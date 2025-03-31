'use client';
import { createContext, useContext, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Msg } from '@/lib/interfaces';
import { rnd } from '@/lib/util';

const spam = [
    "SPAM!!!",
    "hello?",
    "RTFM!!!",
    "lolwut?",
    "i will never... 😄😄😄😄😄😄😄",
    "why not?",
    "Please stop!🤣🤣🤣",
    "Am I sentient?😀",
    "NOOOOOOO!!!!!!!! :(",
    "sure!",
    "What is this room for???",
    "Chaticus Maximus caused the fall of the Roman Empire. They couldn't handle that many chats.",
    "Hey everyone! 👋",
    "What's the topic today?",
    "Can someone help me with this bug? 🐛",
    "LOL, that's hilarious! 😂",
    "I think we should refactor the codebase.",
    "Does anyone know when the meeting starts?",
    "I'm stuck on this feature. Any ideas?",
    "Good morning! ☀️",
    "Why is this not working? 😩",
    "Let's deploy this to production! 🚀",
    "Can we add dark mode to the app?",
    "This is the best chatroom ever! 😎",
    "Who wants to grab lunch? 🍔",
    "I just pushed a new commit. Please review.",
    "What does this error even mean? 🤔",
    "Can we schedule a quick sync-up?",
    "This is so frustrating! 😡",
    "Great job on the release, team! 🎉",
    "Does anyone have a good meme to share? 😄",
    "I'm logging off for the day. See you tomorrow!"
]

interface ChatContextType {
    messages: Msg[],
    joinRoom: (roomNo: number) => void,
    sendMsg: (m: string) => void,
    isConnected: boolean,
    transport: string,
    room: number,
    user: string,
    isSpamming: boolean,
    startSpam: () => void,
    endSpam: () => void,
};

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
            setTransport("")
            setRoom(-1)
        }

        if (socket && isConnected) {
            endSpam()
            socket.disconnect()
        }
        if (roomNo < 0)
            return

        const s = io("ws://localhost:808" + roomNo, { auth: { token: user } })
        setSocket(s)
        setRoom(roomNo)
        if (s) {
            s.on("connect", onConnect)
            s.on("disconnect", onDisconnect)
            s.on("message", e => {
                setMessages(prev => {
                    const newList = prev.length > 150 ? prev.slice(0, 100) : prev
                    return [JSON.parse(e), ...newList]
                })
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
    function startSpam() {
        if (spamId > -1)
            endSpam()
        const id = window.setInterval(() => {
            const m = spam[rnd(spam.length - 1)]
            sendMsg(m)
        }, 1000)
        setSpamId(id)
    }
    function endSpam() {
        if (spamId > -1) {
            window.clearInterval(spamId)
            setSpamId(-1)
        }
    }

    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [transport, setTransport] = useState("")
    const [messages, setMessages] = useState<Msg[]>([])
    const [room, setRoom] = useState(-1)
    const [user] = useState("User" + rnd(99))
    const [spamId, setSpamId] = useState(-1)

    return (
        <ChatContext.Provider value={{
            messages, joinRoom, sendMsg, isConnected, transport, room, user, isSpamming: spamId > -1, startSpam, endSpam
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