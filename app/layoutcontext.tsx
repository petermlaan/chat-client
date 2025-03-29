'use client';
import React, { createContext, useContext, useState } from 'react';
import { Split } from '@/lib/interfaces';

interface LayoutContextType {
    layout: Split | undefined,
    setLayout: React.Dispatch<React.SetStateAction<Split | undefined>>
};

/*interface LS {
  showSearchList: boolean,
  showSavedList: boolean,
};*/

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({
    children
}: {
    children: React.ReactNode
}) {
    const [layout, setLayout] = useState<Split | undefined>()

    /*  useEffect(() => {
        const lsi = localStorage.getItem("Products");
        if (lsi) {
          const lso: LS = SuperJSON.parse(lsi);
          if (lso) {
            setStateShowSearchList(lso.showSearchList);
            setStateShowSavedList(lso.showSavedList);
          }
        }
      }, []);*/

    /*  const setShowSearchList = (showSearchList: boolean) => {
        setStateShowSearchList(showSearchList);
        storeInLS({
          showSearchList,
          showSavedList,
        });
      };*/

    /*  const storeInLS = (lso: LS) => {
        localStorage.setItem("Products", SuperJSON.stringify(lso));
      }*/

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