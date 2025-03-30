'use client';
import { createContext, useContext, useState } from 'react';
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
    user: string,
    spamId: number,
    setSpamId: React.Dispatch<React.SetStateAction<number>>
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
        if (roomNo < 0)
            return

        const s = io("ws://localhost:808" + roomNo, { auth: { token: user } })
        setSocket(s)
        setRoom(roomNo)
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
    const [spamId, setSpamId] = useState(-1)

    return (
        <ChatContext.Provider value={{
            messages, joinRoom, sendMsg, isConnected, transport, room, user, spamId, setSpamId
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