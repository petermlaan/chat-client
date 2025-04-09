'use client';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Layout, Msg } from '@/lib/interfaces';
import { ChatRoom } from "@/lib/interfaces";
import { io, Socket } from 'socket.io-client';
import { useUser } from '@clerk/nextjs';
import { LS_LAYOUTS } from '@/lib/constants';
import { LS_SEL_LAYOUT } from '@/lib/constants';

interface GlobalContextType {
  layouts: Layout[],
  layout: Layout | null,
  rooms: ChatRoom[],
  isConnected: boolean,
  transport: string,
  version: number,
  setLayout: (layoutId: number | null) => void,
  deleteLayout: (layoutId: number) => void,
  createLayout: (name: string, layout: string) => void,
  saveLayout: (layout: Layout) => void,
  resetDefaults: () => void,
  registerClient: (onMessage: (msg: Msg) => void) => number,
  unregisterClient: (clientId: number) => void,
  joinRoom: (clientId: number, roomId: number) => void,
  sendMsg: (clientId: number, message: string) => void,
  disconnect: () => void,
  connect: () => void,
}

interface Client {
  clientId: number;
  roomId: number;
  onMessage: (msg: Msg) => void;
}

const defaultLayouts: Layout[] = [
  {
    id: 0,
    name: "One",
    layout: { roomId: 0 }
  },
  {
    id: 1,
    name: "Two Horizontal",
    layout: { vertical: false, percent: 50, child1: { roomId: 0 }, child2: { roomId: 1 } }
  },
  {
    id: 2,
    name: "Two Vertical",
    layout: { vertical: true, percent: 50, child1: { roomId: 2 }, child2: { roomId: 3 } }
  },
  {
    id: 3,
    name: "Three",
    layout: { vertical: false, percent: 50, child2: { vertical: true, percent: 50 } }
  },
  {
    id: 4,
    name: "Four",
    layout: { vertical: true, percent: 50, child1: { vertical: false, percent: 50, child1: { roomId: 0 }, child2: { roomId: 1 } }, child2: { vertical: false, percent: 50, child1: { roomId: 2 }, child2: { roomId: 3 } } }
  },
  {
    id: 5,
    name: "Six",
    layout: {
      vertical: false, percent: 67, child1: {
        vertical: false, percent: 50,
        child1: { vertical: true, percent: 50 },
        child2: { vertical: true, percent: 50 }
      },
      child2: { vertical: true, percent: 50 }
    }
  },
]

const globalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({
  chatRooms,
  children
}: {
  chatRooms: ChatRoom[]
  children: React.ReactNode
}) {
  // Functions exposed on the context
  function setLayout(layoutId: number | null) {
    setStateLayout(layouts.find(l => l.id === layoutId) ?? null)
    storeSelLayoutInLS(layoutId)
    setVersion(v => v + 1)
  }
  function deleteLayout(layoutId: number) {
    setStateLayout(prev => {
      if (prev && prev.id === layoutId) {
        storeSelLayoutInLS(null)
        return null
      } else
        return prev
    })
    setLayouts(prev => {
      const ls: Layout[] = prev.filter(l => l.id !== layoutId)
      storeLayoutsInLS(ls)
      return ls
    })
  }
  function createLayout(name: string, layout: string) {
    const newLayout: Layout = {
      id: layouts.reduce((a, l) => a > l.id ? a : l.id + 1, 0),
      name,
      layout: JSON.parse(layout),
    }
    setLayouts(prev => {
      const newList = [...prev, newLayout]
      storeLayoutsInLS(newList)
      return newList
    })
  }
  function saveLayout(layout: Layout) {
    const newList = [...layouts]
    const index = newList.findIndex(l => l.id === layout.id)
    if (index > -1)
      newList[index] = layout
    setLayouts(newList)
    storeLayoutsInLS(newList)
  }
  function registerClient(onMessage: (msg: Msg) => void) {
    const newId = clients.current.reduce((a, c) => c.clientId > a ? c.clientId : a, 0) + 1
    clients.current.push({ clientId: newId, roomId: -1, onMessage })
    return newId
  }
  function unregisterClient(clientId: number) {
    const client = clients.current.find(c => c.clientId === clientId)
    if (socket.current && client && client.roomId > -1)
      socket.current.emit("leave", createMsg(client.roomId, "", 2))
    clients.current = clients.current.filter(c => c.clientId !== clientId)
  }
  function joinRoom(clientId: number, roomId: number) {
    // Leaves the current room (if any) and joins roomId. 
    // roomId = -1 to only leave the current room. 
    const client = clients.current.find(c => c.clientId === clientId)
    if (!client) {
      console.log("Found no client with clientId: " + clientId)
      return
    }
    if (client.roomId === -1 && roomId === -1)
      return
    if (!socket.current) {
      console.log("GC joinRoom: NO SOCKET!", { clientId, roomId });
      return
    }
    if (client.roomId > -1) {
      // Leave old room
      console.log("GC joinRoom: leaving old room", { clientId, roomId });
      socket.current.emit("leave", createMsg(client.roomId, "", 2))
    }
    client.roomId = roomId
    if (roomId > -1) {
      console.log("GC joinRoom: joining room", { clientId, roomId });
      // Join new room
      socket.current.emit("join", createMsg(roomId, "", 2))
    }
  }
  function sendMsg(clientId: number, message: string) {
    const roomId = getClient(clientId).roomId
    if (roomId < 0) {
      console.log("GC sendMsg: room -1")
      return
    }
    if (!socket.current || !socket.current.connected) {
      console.log("GC sendMsg: no socket or no connection", socket)
      return
    }
    if (message.startsWith("@")) {
      if (message.includes(" "))
        socket.current.emit("pm", createMsg(roomId, message, 1))
    } else
      socket.current.emit("message", createMsg(roomId, message, 0))
  }
  function disconnect() {
    console.log("disconnect: ", socket.current)
    if (socket.current && socket.current.connected) {
      console.log("disconnecting...")
      socket.current.disconnect()
    }
  }
  function connect() {
    socket.current?.connect()
  }

  // Other functions
  function onMessage(data: unknown) {
    const msgs = data as Msg[]
    let recipientFound = false
    msgs.forEach(msg => {
      clients.current.forEach(c => {
        if (c.roomId === msg.room_id) {
          c.onMessage({...msg})
          recipientFound = true
        }
      })
      if (!recipientFound)
        console.log("ERROR: found no recipient for message: ", msg);
    })
  }
  function onPM(data: unknown) {
    const msgs = data as Msg[]
    console.log("PM", msgs)
    let recipientFound = false
    msgs.forEach(msg => {
      clients.current.forEach(c => {
        if (c.roomId === msg.room_id) {
          c.onMessage(msg)
          recipientFound = true
        }
      })
      if (!recipientFound)
        console.log("ERROR: found no recipient for message: ", msg);
    })
  }
  function onJoined(data: unknown) {
    const msg = data as Msg
    msg.message = "<" + msg.user + " has joined>"
    clients.current.forEach(c => {
      if (c.roomId === msg.room_id)
        c.onMessage(msg)
    })
  }
  function onLeft(data: unknown) {
    const msg = data as Msg
    msg.message = "<" + msg.user + " has left>"
    clients.current.forEach(c => {
      if (c.roomId === msg.room_id)
        c.onMessage(msg)
    })
  }
  function onConnect() {
    console.log("onConnect")
    setIsConnected(true)
    if (socket.current) {
      setTransport(socket.current.io.engine.transport.name)
      socket.current.io.engine.on("upgrade", transport => setTransport(transport.name))
    }
  }
  function onDisconnect() {
    console.log("onDisconnect")
    setIsConnected(false)
    setTransport("")
  }
  function createMsg(roomId: number, message: string, type: number) {
    const msg: Msg = {
      user: username.current,
      room_id: roomId,
      message,
      type,
      save: true,
    }
    return msg
  }
  function storeDefaultLayouts() {
    storeLayoutsInLS(defaultLayouts)
    storeSelLayoutInLS(0)
    setLayouts(defaultLayouts)
    setStateLayout(defaultLayouts[0])
  }
  function storeLayoutsInLS(lso: Layout[]) {
    localStorage.setItem(LS_LAYOUTS, JSON.stringify(lso))
  }
  function storeSelLayoutInLS(selLayout: number | null) {
    localStorage.setItem(LS_SEL_LAYOUT, JSON.stringify(selLayout))
  }
  function getLayoutsFromLS() {
    const lsi = localStorage.getItem(LS_LAYOUTS)
    if (!lsi) {
      storeDefaultLayouts()
      return defaultLayouts
    }
    let lso: Layout[]
    try {
      lso = JSON.parse(lsi)
    } catch (err) {
      console.error("Failed to parse: ", lsi, err)
      storeDefaultLayouts()
      return defaultLayouts
    }
    if (!lso) {
      console.log("localStorage object empty, storing default layouts instead")
      storeDefaultLayouts()
      return defaultLayouts
    }
    return lso
  }
  function getSelLayoutFromLS() {
    const lsi = localStorage.getItem(LS_SEL_LAYOUT)
    if (!lsi) {
      storeSelLayoutInLS(0)
      return 0
    }
    let lso: number | null
    try {
      lso = JSON.parse(lsi)
    } catch (err) {
      console.error("Failed to parse: ", lsi, err)
      storeSelLayoutInLS(0)
      return 0
    }
    if (lso === undefined) {
      console.log("localStorage object empty, storing 0")
      storeSelLayoutInLS(0)
      return 0
    }
    return lso
  }
  function getClient(clientId: number) {
    const client = clients.current.find(c => c.clientId === clientId)
    if (!client)
      throw new Error("Found no client with clientId: " + clientId)
    return client
  }

  const [layouts, setLayouts] = useState<Layout[]>([])
  const [layout, setStateLayout] = useState<Layout | null>(null)
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [transport, setTransport] = useState("N/A")

  // Used as key to Splitter to force reset 
  // of entire tree when changing layout
  const [version, setVersion] = useState(0)

  const clients = useRef<Client[]>([])
  const socket = useRef<Socket | undefined>(undefined)
  const usr = useUser()
  const username = useRef("")

  useEffect(() => {
    setRooms(chatRooms)
    const lso = getLayoutsFromLS()
    setLayouts(lso)
    const sel = getSelLayoutFromLS()
    const selectedLayout = lso.find(l => l.id === sel)
    if (selectedLayout) {
      setStateLayout(selectedLayout)
    }
  }, [chatRooms])

  useEffect(() => {
    if (usr.user && usr.isLoaded && usr.isSignedIn && !socket.current) {
      console.log("GC useEffect user - creating socket...")
      username.current = usr.user?.username ?? ""
      const s = io("ws://localhost:8080", { auth: { token: usr.user?.username }, })
      s.on("disconnect", onDisconnect)
      s.on("connect", onConnect)
      s.on("message", onMessage)
      s.on("pm", onPM)
      s.on("joined", onJoined)
      s.on("left", onLeft)
      socket.current = s
    }

    /*     return () => {
          console.log("GC useEffect user cleanup")
          if (socket) {
            console.log("GC useEffect cleanup user - disconnecting...")
            socket.removeAllListeners()
            socket.disconnect()
            setSocket(undefined)
          }
        } */
  }, [usr])

  return (
    <globalContext.Provider value={{
      layouts, layout, rooms, isConnected, transport, version,
      setLayout, deleteLayout, createLayout, saveLayout,
      resetDefaults: storeDefaultLayouts, registerClient,
      unregisterClient, joinRoom, sendMsg, disconnect, connect
    }}>
      {children}
    </globalContext.Provider>
  );
}

export function useGlobalContext() {
  const context = useContext(globalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within an GlobalProvider');
  }
  return context;
}
