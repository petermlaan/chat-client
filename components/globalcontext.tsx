'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
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
  setLayout: (layoutId: number | null) => void,
  deleteLayout: (layoutId: number) => void,
  createLayout: (name: string, layout: string) => void,
  saveLayout: (layout: Layout) => void,
  resetDefaults: () => void,
  registerClient: (onMessage: (msg: Msg) => void) => number,
  unregisterClient: (clientId: number) => void,
  joinRoom: (clientId: number, roomId: number) => void,
  sendMsg: (clientId: number, message: string) => void
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
let clients: Client[] = []

export function GlobalProvider({
  chatRooms,
  children
}: {
  chatRooms: ChatRoom[]
  children: React.ReactNode
}) {
  // Functions exposed on the context
  function setLayout(layoutId: number | null) {
    setStateLayout(prev => {
      if (prev)
        return layouts?.find(l => l.id === layoutId) ?? null
      return null
    })
    storeSelLayoutInLS(layoutId)
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
    const newId = clients.reduce((a, c) => c.clientId > a ? c.clientId : a, 0) + 1
    console.log("registerClient newId: " + newId)
    clients.push({ clientId: newId, roomId: -1, onMessage })
    clients.forEach(c => { console.log("GC registerClient client: " + c.clientId + " - " + c.roomId) })
    return newId
  }
  function unregisterClient(clientId: number) {
    console.log("unregisterClient clientId: " + clientId)
    clients = clients.filter(c => c.clientId !== clientId)
    clients.forEach(c => { console.log("GC registerClient client: " + c.clientId + " - " + c.roomId) })
  }
  function joinRoom(clientId: number, roomId: number) {
    // Leaves the current room (if any) and joins roomId. 
    // roomId = -1 to only leave the current room. 
    const client = clients.find(c => c.clientId === clientId)
    if (!client) {
      console.log("Found no client with clientId: " + clientId)
      return
    }
    if (client.roomId === -1 && roomId === -1)
      return
    if (!socket) {
      console.log("GC joinRoom: NO SOCKET!", { clientId, roomId });
      return
    }
    if (client.roomId > -1) {
      // Leave old room
      console.log("GC joinRoom: leaving old room", { clientId, roomId });
      socket.emit("leave", createMsg(client.roomId, ""))
    }
    client.roomId = roomId
    if (roomId > -1) {
      console.log("GC joinRoom: joining room", { clientId, roomId });
      // Join new room
      socket.emit("join", createMsg(roomId, ""))
    }
    clients.forEach(c => { console.log("GC registerClient client: " + c.clientId + " - " + c.roomId) })
  }
  function sendMsg(clientId: number, message: string) {
    const roomId = getClient(clientId).roomId
    if (roomId < 0) {
      console.log("GC sendMsg: room -1")
      return
    }
    if (!socket || !socket.connected) {
      console.log("GC sendMsg: no socket or no connection", socket)
      return
    }
    socket.emit("message", createMsg(roomId, message))
  }

  // Other functions
  function onMessage(data: unknown) {
    const msgs = data as Msg[]
    msgs.forEach(msg => {
      clients.forEach(c => {
        if (c.roomId === msg.room_id) {
          c.onMessage(msg)
        }
      })
    })
  }
  function onJoined(data: unknown) {
    const msg = data as Msg
    msg.message = "<" + msg.user + " has joined>"
    clients.forEach(c => {
      if (c.roomId === msg.room_id)
        c.onMessage(msg)
    })
  }
  function onLeft(data: unknown) {
    const msg = data as Msg
    msg.message = "<" + msg.user + " has left>"
    clients.forEach(c => {
      if (c.roomId === msg.room_id)
        c.onMessage(msg)
    })
  }
  function onConnect() {
    console.log("onConnect")
    setIsConnected(true)
    if (socket) {
      setTransport(socket.io.engine.transport.name)
      socket.io.engine.on("upgrade", transport => setTransport(transport.name))
    }
  }
  function onDisconnect() {
    console.log("onDisconnect")
    setIsConnected(false)
    setTransport("")
  }
  function createMsg(roomId: number, message: string) {
    const msg: Msg = {
      user: usr.user?.username ?? "",
      room_id: roomId,
      message: message,
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
    const client = clients.find(c => c.clientId === clientId)
    if (!client)
      throw new Error("Found no client with clientId: " + clientId)
    return client
  }

  const [layouts, setLayouts] = useState<Layout[]>([])
  const [layout, setStateLayout] = useState<Layout | null>(null)
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [socket, setSocket] = useState<Socket | undefined>()
  const [isConnected, setIsConnected] = useState(false)
  const [transport, setTransport] = useState("N/A")
  const usr = useUser()

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
    if (usr.user && usr.isLoaded && usr.isSignedIn && !socket) {
      console.log("GC useEffect user - creating socket...")
      const s = io("ws://localhost:8080", { auth: { token: usr.user?.username }, })
      s.on("disconnect", onDisconnect)
      s.on("connect", onConnect)
      s.on("message", onMessage)
      s.on("joined", onJoined)
      s.on("left", onLeft)
      setSocket(s)
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
      layouts, layout, rooms, isConnected, transport,
      setLayout, deleteLayout, createLayout, saveLayout,
      resetDefaults: storeDefaultLayouts,
      registerClient, unregisterClient, joinRoom, sendMsg,
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


/*   function disconnect() {
    console.log("disconnect: ", socket)
    if (socket && socket.connected) {
      console.log("disconnecting...")
      socket.disconnect()
      socket.off("connect")
      socket.off("disconnect")
      socket.off("message")
    }
  }*/
