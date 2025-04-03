'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Layout } from '@/lib/interfaces';
import { ChatRoom } from '@/lib/server/db';

interface GlobalContextType {
  layouts: Layouts,
  layout: Layout | null,
  setLayout: (layoutId: number | null) => void,
  deleteLayout: (layoutId: number) => void,
  createLayout: (name: string, layout: string) => void,
  saveLayout: (layout: Layout) => void,
  resetDefaults: () => void,
  rooms: ChatRoom[],
}

interface Layouts {
  layouts: Layout[],
  selected: number | null,
}

const defaultLayouts: Layouts = {
  selected: 0,
  layouts: [
    {
      id: 0,
      name: "One",
      layout: undefined
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

export function GlobalProvider({
  chatRooms,
  children
}: {
  chatRooms: ChatRoom[]
  children: React.ReactNode
}) {
  function storeDefaultLayouts() {
    storeInLS(defaultLayouts)
    setLayouts(defaultLayouts)
    setStateLayout(defaultLayouts.layouts[0])
  }
  const [layouts, setLayouts] = useState<Layouts>({ layouts: [], selected: null })
  const [layout, setStateLayout] = useState<Layout | null>(null)
  const [rooms, setRooms] = useState<ChatRoom[]>([])

  useEffect(() => {
    setRooms(chatRooms)
    const lsi = localStorage.getItem("Chaticus")
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

  const setLayout = (layoutId: number | null) => {
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

  const saveLayout = (layout: Layout) => {
    const newList = [...layouts.layouts]
    const index = newList.findIndex(l => l.id === layout.id)
    if (index > -1)
      newList[index] = layout
    const newLayout: Layouts = { layouts: newList, selected: layouts.selected }
    setLayouts(newLayout)
    storeInLS(newLayout)
  }

  const deleteLayout = (layoutId: number) => {
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

  const storeInLS = (lso: Layouts) => {
    localStorage.setItem("Chaticus", JSON.stringify(lso))
  }

  return (
    <globalContext.Provider value={{
      layouts, layout, setLayout,
      deleteLayout, createLayout, saveLayout,
      resetDefaults: storeDefaultLayouts,
      rooms
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