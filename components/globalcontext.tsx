'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Layout, Msg } from '@/lib/interfaces';
import { ChatRoom } from "@/lib/interfaces";
import { io, Socket } from 'socket.io-client';
import { useUser } from '@clerk/nextjs';
import { SS_CLIENTS, LS } from '@/lib/constants';

interface GlobalContextType {
  layouts: Layouts,
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

interface Layouts {
  layouts: Layout[],
  selected: number | null,
}

interface Client {
  clientId: number;
  roomId: number;
  onMessage: (msg: Msg) => void;
}

const defaultLayouts: Layouts = {
  selected: 0,
  layouts: [
    {
      id: 0,
      name: "One",
      layout: { roomId: 1 }
    },
    {
      id: 1,
      name: "Two Horizontal",
      layout: { vertical: false, percent: 50 }
    },
    {
      id: 2,
      name: "Two Vertical",
      layout: { vertical: true, percent: 50 }
    },
    {
      id: 3,
      name: "Three",
      layout: { vertical: false, percent: 50, child2: { vertical: true, percent: 50 } }
    },
    {
      id: 4,
      name: "Four",
      layout: { vertical: true, percent: 50, child1: { vertical: false, percent: 50 }, child2: { vertical: false, percent: 50 } }
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
}

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
    console.log("GC - setLayout: " + layoutId)
    setStateLayout(prev => {
      if (prev)
        return layouts?.layouts?.find(l => l.id === layoutId) ?? null
      return null
    })
    setLayouts(prev => {
      const ls: Layouts = { ...prev, selected: layoutId }
      storeInLS(ls)
      return ls
    })
  }
  function deleteLayout(layoutId: number) {
    console.log("GC - deleteLayout: " + layoutId)
    setStateLayout(prev => {
      if (prev && prev.id === layoutId)
        return null
      else
        return prev
    })
    setLayouts(prev => {
      const ls: Layouts = {
        layouts: prev.layouts.filter(l => l.id !== layoutId),
        selected: prev.selected
      }
      storeInLS(ls)
      return ls
    })
  }
  function createLayout(name: string, layout: string) {
    const newLayout: Layout = {
      name,
      layout: JSON.parse(layout),
      id: layouts.layouts.reduce((a, l) => a > l.id ? a : l.id + 1, 0),
    }
    setLayouts(prev => {
      const newList = { ...prev, layouts: [...prev.layouts, newLayout] }
      storeInLS(newList)
      return newList
    })
  }
  function saveLayout(layout: Layout) {
    const newList = [...layouts.layouts]
    const index = newList.findIndex(l => l.id === layout.id)
    if (index > -1)
      newList[index] = layout
    const newLayout: Layouts = { layouts: newList, selected: layouts.selected }
    setLayouts(newLayout)
    storeInLS(newLayout)
  }
  function registerClient(onMessage: (msg: Msg) => void) {
    const newId = clients.reduce((a, c) => c.clientId > a ? c.clientId : a, 0) + 1
    console.log("GC registerClient", newId, onMessage, clients)
    clients.push({ clientId: newId, roomId: -1, onMessage })
    return newId
  }
  function unregisterClient(clientId: number) {
    console.log("GC unregisterClient", clientId, clients)
    clients = clients.filter(c => c.clientId !== clientId)
  }
  function joinRoom(clientId: number, roomId: number) {
    // Leaves the current room (if any) and joins roomId. 
    // roomId = -1 to only leave the current room. 
    const client = clients.find(c => c.clientId === clientId)
    if (!client)
      throw new Error("Found no client with clientId: " + clientId)
    if (client.roomId === -1 && roomId === -1)
      return
    if (!socket) {
      console.error("GC joinRoom: no socket", { clientId, roomId });
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
  }
  function sendMsg(clientId: number, message: string) {
    const roomId = getClient(clientId).roomId
    if (roomId < 0) {
      console.error("GC sendMsg: room -1")
      return
    }
    if (!socket || !socket.connected) {
      console.error("GC sendMsg: no socket or no connection", socket)
      return
    }
    socket.emit("message", createMsg(roomId, message))
  }

  // Other functions
  function onMessage(data: any) {
    const msgs = data as Msg[]
    console.log("GC onMessage", clients, msgs)
    msgs.forEach(msg => {
      clients.forEach(c => {
        if (c.roomId === msg.room_id) {
          c.onMessage(msg)
        }
      })
    })
  }
  function onJoined(data: any) {
    console.log("GC onJoined", data)
    const msg = data as Msg
    clients.forEach(c => {
      if (c.roomId === msg.room_id)
        c.onMessage(msg)
    })
  }
  function onLeft(data: any) {
    console.log("GC onLeft", data)
    const msg = data as Msg
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
  function disconnect() {
    console.log("disconnect: ", socket)
    if (socket && socket.connected) {
      console.log("disconnecting...")
      socket.disconnect()
      socket.off("connect")
      socket.off("disconnect")
      socket.off("message")
    }
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
    storeInLS(defaultLayouts)
    setLayouts(defaultLayouts)
    setStateLayout(defaultLayouts.layouts[0])
  }
  function storeInLS(lso: Layouts) {
    localStorage.setItem(LS, JSON.stringify(lso))
  }
  function getClient(clientId: number) {
    const client = clients.find(c => c.clientId === clientId)
    if (!client)
      throw new Error("Found no client with clientId: " + clientId)
    return client
  }

  const [layouts, setLayouts] = useState<Layouts>({ layouts: [], selected: null })
  const [layout, setStateLayout] = useState<Layout | null>(null)
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [socket, setSocket] = useState<Socket | undefined>()
  const [isConnected, setIsConnected] = useState(false)
  const [transport, setTransport] = useState("N/A")
  const usr = useUser()

  useEffect(() => {
    setRooms(chatRooms)
    const lsi = localStorage.getItem(LS)
    if (!lsi) {
      storeDefaultLayouts()
      return
    }
    let lso: Layouts
    try {
      lso = JSON.parse(lsi)
    } catch (err) {
      console.error("Failed to parse: ", lsi, err)
      storeDefaultLayouts()
      return
    }
    if (!lso) {
      console.log("localStorage object empty, storing default layouts instead")
      storeDefaultLayouts()
      return
    }
    setLayouts(lso)
    const selectedLayout = lso.layouts.find(l => l.id === lso.selected)
    console.log("GC - useEffect: ", lso, selectedLayout)
    if (selectedLayout) {
      setStateLayout(selectedLayout)
    }
  }, [chatRooms])

  useEffect(() => {
    if (usr.user && usr.isLoaded && usr.isSignedIn && !socket) {
      const s = io("ws://localhost:8080", { auth: { token: usr.user?.username }, })
      s.on("connect", onConnect)
      s.on("disconnect", onDisconnect)
      s.on("message", onMessage)
      s.on("joined", onJoined)
      s.on("left", onLeft)
      setSocket(s)
    }

    return () => {
      if (socket) {
        socket.removeAllListeners()
        socket.disconnect()
        setSocket(undefined)
      }
    }
  }, [usr.user])

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