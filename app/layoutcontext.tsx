'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Split } from '@/lib/interfaces';

interface LayoutContextType {
  layout: Split | undefined,
  setLayout: (layout: Split) => void
}

interface LS {
  layout: Split,
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [layout, setStateLayout] = useState<Split | undefined>()

  useEffect(() => {
    const lsi = localStorage.getItem("Chaticus")
    if (lsi) {
      const lso: LS = JSON.parse(lsi)
      if (lso) {
        setLayout(lso.layout);
      }
    }
  }, [])

  const setLayout = (layout: Split) => {
    setStateLayout(layout)
    storeInLS({
      layout,
    })
  }

  const storeInLS = (lso: LS) => {
    localStorage.setItem("Chaticus", JSON.stringify(lso))
  }

  return (
    <LayoutContext.Provider value={{
      layout, setLayout
    }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayoutContext() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within an LayoutProvider');
  }
  return context;
}