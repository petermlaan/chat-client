'use client';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Layout, Msg } from '@/lib/interfaces';
import { ChatRoom } from "@/lib/interfaces";
import { io, Socket } from 'socket.io-client';
import { useUser } from '@clerk/nextjs';
import { LS_LAYOUTS, LS_SETTINGS } from '@/lib/constants';
import { LS_SEL_LAYOUT } from '@/lib/constants';

interface GlobalContextType {
  layouts: Layout[],
  layout: Layout | null,
  rooms: ChatRoom[],
  isConnected: boolean,
  transport: string,
  version: number,
  settings: Settings,
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
  setSettings: (settings: Partial<Settings>) => void,
}

interface Client {
  clientId: number;
  roomId: number;
  onMessage: (msg: Msg) => void;
}

interface Settings {
  fontClass: string;
  fontSizeClass: string;
}

const defaultLayouts: Layout[] = [
  {
    id: 0,
    name: "One",
    split: { roomId: 0 }
  },
  {
    id: 1,
    name: "Two Horizontal",
    split: { vertical: false, percent: 50, child1: { roomId: 0 }, child2: { roomId: 0 } }
  },
  {
    id: 2,
    name: "Two Vertical",
    split: { vertical: true, percent: 50, child1: { roomId: 3 }, child2: { roomId: 4 } }
  },
  {
    id: 3,
    name: "Three",
    split: { vertical: false, percent: 50, child1: { roomId: 0 }, child2: { vertical: true, percent: 50, child1: { roomId: 0 }, child2: { roomId: 0 } } }
  },
  {
    id: 4,
    name: "Four",
    split: { vertical: true, percent: 50, child1: { vertical: false, percent: 50, child1: { roomId: 1 }, child2: { roomId: 2 } }, child2: { vertical: false, percent: 50, child1: { roomId: 3 }, child2: { roomId: 4 } } }
  },
  {
    id: 5,
    name: "Six",
    split: {
      vertical: false, percent: 67, child1: {
        vertical: false, percent: 50,
        child1: { vertical: true, percent: 50, child1: { roomId: 0 }, child2: { roomId: 0 } },
        child2: { vertical: true, percent: 50, child1: { roomId: 0 }, child2: { roomId: 0 } }
      },
      child2: { vertical: true, percent: 50, child1: { roomId: 0 }, child2: { roomId: 0 } }
    }
  },
  {
    id: 6,
    name: "Nine",
    split: {
      vertical: false, percent: 67,
      child1: {
        vertical: false, percent: 50,
        child1: {
          vertical: true, percent: 67,
          child1: { vertical: true, percent: 50, child1: { roomId: 0 }, child2: { roomId: 0 } },
          child2: { roomId: 0 }
        },
        child2: {
          vertical: true, percent: 67,
          child1: { vertical: true, percent: 50, child1: { roomId: 0 }, child2: { roomId: 0 } },
          child2: { roomId: 0 }
        },
      },
      child2: {
        vertical: true, percent: 67,
        child1: { vertical: true, percent: 50, child1: { roomId: 0 }, child2: { roomId: 0 } },
        child2: { roomId: 0 }
      },
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
  // Functions exposed by the context
  function setLayout(layoutId: number | null) {
    if (layoutId === -2) { // user resized a chat window
      storeLayoutsInLS(layouts)
      return
    }
    if (layoutId === -3) { // user split a chat window
      storeLayoutsInLS(layouts)
      setVersion(v => v + 1) // Redraws the entire splitter tree
      return
    }
    setVersion(v => v + 1) // Redraws the entire splitter tree
    setStateLayout(layouts.find(l => l.id === layoutId) ?? null)
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
      split: JSON.parse(layout),
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
    clients.current.push({ clientId: newId, roomId: 0, onMessage })
    return newId
  }
  function unregisterClient(clientId: number) {
    const client = clients.current.find(c => c.clientId === clientId)
    if (socket.current && client && client.roomId)
      leaveRoom(client)
    clients.current = clients.current.filter(c => c.clientId !== clientId)
  }
  function joinRoom(clientId: number, roomId: number) {
    // Leaves the current room (if any) and joins roomId. 
    // Set roomId = 0 to only leave the current room. 
    const client = clients.current.find(c => c.clientId === clientId)
    if (!client)
      return
    if (client.roomId === 0 && roomId === 0)
      return
    if (!socket.current) {
      console.log("GC joinRoom: NO SOCKET!", { clientId, roomId });
      return
    }
    if (client.roomId)
      leaveRoom(client)
    client.roomId = roomId
    if (roomId)
      socket.current.emit("join", createMsg(roomId, "", 2))
  }
  function sendMsg(clientId: number, message: string) {
    const roomId = getClient(clientId).roomId
    if (!roomId) {
      console.log("GC sendMsg: room 0")
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
  function setSettings(s: Partial<Settings>) {
    const newSettings = { ...settings, ...s }
    setStateSettings(newSettings)
    if (localStorage) {
      localStorage.setItem(LS_SETTINGS, JSON.stringify(newSettings))
    }
  }

  // Other functions
  function onMessage(data: unknown) {
    const msgs = data as Msg[]
    let recipientFound = false
    msgs.forEach(msg => {
      clients.current.forEach(c => {
        if (c.roomId === msg.room_id) {
          c.onMessage({ ...msg })
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
    msg.message = "<" + msg.user + " joined>"
    clients.current.forEach(c => {
      if (c.roomId === msg.room_id)
        c.onMessage(msg)
    })
  }
  function onLeft(data: unknown) {
    const msg = data as Msg
    msg.message = "<" + msg.user + " left>"
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
  function leaveRoom(client: Client) {
    // Send leave Msg to server if this is the only client in this room
    if (client.roomId && socket.current &&
      clients.current.reduce((a, c) => a + +(c.roomId === client.roomId), 0) === 1)
      socket.current.emit("leave", createMsg(client.roomId, "", 2))
  }

  const [layouts, setLayouts] = useState<Layout[]>([])
  const [layout, setStateLayout] = useState<Layout | null>(null)
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [transport, setTransport] = useState("N/A")
  const [settings, setStateSettings] = useState({
    fontClass: "",
    fontSizeClass: "",
  })

  // Used as key to Splitter to force reset 
  // of entire tree when changing layout
  const [version, setVersion] = useState(0)

  const clients = useRef<Client[]>([])
  const socket = useRef<Socket | undefined>(undefined)
  const usr = useUser()
  const username = useRef("")

  useEffect(() => {
    setRooms(chatRooms)
    if (localStorage) {
      const lso = getLayoutsFromLS()
      setLayouts(lso)
      const sel = getSelLayoutFromLS()
      const selectedLayout = lso.find(l => l.id === sel)
      if (selectedLayout) {
        setStateLayout(selectedLayout)
      }
      const lsi = localStorage.getItem(LS_SETTINGS)
      if (lsi) {
        const lso = JSON.parse(lsi) as Settings
        if (lso)
          setStateSettings(lso)
      }
    }
  }, [chatRooms])

  useEffect(() => {
    if (usr.user && usr.isLoaded && usr.isSignedIn && !socket.current) {
      console.log("GC useEffect user - creating socket...")
      username.current = usr.user?.username ?? ""
      const s = io("ws://192.168.1.112:8080", { auth: { token: usr.user?.username }, })
      s.on("disconnect", onDisconnect)
      s.on("connect", onConnect)
      s.on("message", onMessage)
      s.on("pm", onPM)
      s.on("joined", onJoined)
      s.on("left", onLeft)
      socket.current = s
    }
  }, [usr])

  return (
    <globalContext.Provider value={{
      layouts, layout, rooms, isConnected, transport, version, settings,
      setLayout, deleteLayout, createLayout, saveLayout,
      resetDefaults: storeDefaultLayouts, registerClient,
      unregisterClient, joinRoom, sendMsg, disconnect, connect, setSettings,
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
