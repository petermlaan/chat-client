'use client';
import React, { createContext, useContext, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Msg } from '@/lib/interfaces';
import { rnd } from '@/lib/util';

interface ChatContextType {
    messages: Msg[],
    joinRoom: (roomNo: number) => void,
    sendMsg: (m: string) => void,
    isConnected: boolean,
    transport: string,
    room: number,
    user: string
};

/*interface LS {
  showSearchList: boolean,
  showSavedList: boolean,
};*/

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({
    children
}: {
    children: React.ReactNode
}) {
    function joinRoom(roomNo: number) {
        function onConnect() {
            setIsConnected(true)
            if (s) {
                setTransport(s.io.engine.transport.name)
                s.io.engine.on("upgrade", transport => setTransport(transport.name))
            }
        }
        function onDisconnect() {
            console.log("onDisconnect")
            setIsConnected(false)
            setTransport("N/A")
            setRoom(-1)
        }

        if (socket && isConnected)
            socket.disconnect()

        const s = io("ws://localhost:808" + roomNo, { auth: { token: user } })
        setRoom(roomNo)
        setSocket(s)
        if (s) {
            s.on("connect", onConnect)
            s.on("disconnect", onDisconnect)
            s.on("message", e => {
                setMessages(prev => [JSON.parse(e), ...prev])
            })
        }
    }
    function sendMsg(msg: string) {
        if (!socket || !socket.connected) {
            console.log("useChat: trying to send msg on null or closed socket", socket)
            return
        }
        socket.emit("message", msg)
    }

    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [transport, setTransport] = useState("N/A")
    const [messages, setMessages] = useState<Msg[]>([])
    const [room, setRoom] = useState(-1)
    const [user] = useState("User" + rnd(99))

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
        <ChatContext.Provider value={{
            messages, joinRoom, sendMsg, isConnected, transport, room, user
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChatContext() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within an ChatProvider');
    }
    return context;
}