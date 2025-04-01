'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Layout } from '@/lib/interfaces';
import { ChatRoom } from '@/lib/server/db';

interface GlobalContextType {
  layouts: LS,
  layout: Layout | null,
  setLayout: (layoutId: number | null) => void,
  createLayout: (name: string, layout: string) => void,
  rooms: ChatRoom[],
}

interface LS {
  layouts: Layout[],
  selected: number | null,
}

const globalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({
  chatRooms,
  children
}: {
  chatRooms: ChatRoom[]
  children: React.ReactNode
}) {
  const [layouts, setLayouts] = useState<LS>({ layouts: [], selected: null })
  const [layout, setStateLayout] = useState<Layout | null>(null)
  const [rooms, setRooms] = useState<ChatRoom[]>([])

  useEffect(() => {
    setRooms(chatRooms)
    const lsi = localStorage.getItem("Chaticus")
    if (lsi) {
      const lso: LS = JSON.parse(lsi)
      if (lso) {
        setLayouts(lso)
        const selectedLayout = lso.layouts.find(l => l.id === lso.selected)
        console.log("GC - useEffect: ", lso, selectedLayout)
        if (selectedLayout) {
          setStateLayout(selectedLayout)
        }
      }
    }
  }, [])

  const setLayout = (layoutId: number | null) => {
    console.log("GC - setLayout: " + layoutId)
    setStateLayout(prev => {
      if (prev)
        return layouts?.layouts?.find(l => l.id === layoutId) ?? null
      return null
    })
    setLayouts(prev => {
      const ls: LS = {...prev, selected: layoutId}
      storeInLS(ls)
      return ls
    })
  }

  const createLayout = (name: string, layout: string) => {
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

  const storeInLS = (lso: LS) => {
    localStorage.setItem("Chaticus", JSON.stringify(lso))
  }

  return (
    <globalContext.Provider value={{
      layouts, layout, setLayout, createLayout, rooms
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