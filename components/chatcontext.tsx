"use client"
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Msg } from '@/lib/interfaces';
import { rnd } from '@/lib/util';
import { useGlobalContext } from './globalcontext';

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
    clientId: number,
    messages: Msg[],
    joinRoom: (roomNo: number) => void,
    sendMsg: (m: string) => void,
    room: number,
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
    function onMessage(msg: Msg) {
        setMessages(prev => {
            const newList = prev.length > 150 ? prev.slice(0, 100) : prev
            return [msg, ...newList]
        })
    }
    function joinRoom(roomId: number) {
        endSpam()
        setMessages([])
        if (clientIdRef.current > -1) {
            setRoom(roomId)
            gc.joinRoom(clientIdRef.current, roomId)
        }
    }
    function sendMsg(msg: string) {
        gc.sendMsg(clientIdRef.current, msg)
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
    function endSpam(sid?: number) {
        const newSpamId = sid === undefined ? spamId : sid
        if (newSpamId > -1) {
            window.clearInterval(newSpamId)
            setSpamId(-1)
        }
    }

    const [messages, setMessages] = useState<Msg[]>([])
    const [spamId, setSpamId] = useState(-1)
    const [roomId, setRoom] = useState(-1)
    const clientIdRef = useRef(-1)
    const gc = useGlobalContext()

    useEffect(() => {
        if (clientIdRef.current > -1)
            gc.unregisterClient(clientIdRef.current)
        clientIdRef.current = gc.registerClient(onMessage)

        return () => {
            gc.unregisterClient(clientIdRef.current)
        }
    }, [])

    useEffect(() => {
        return () => {
            endSpam(spamId)
        }
    }, [spamId])

    return (
        <ChatContext.Provider value={{
            clientId: clientIdRef.current, messages, joinRoom, sendMsg, room: roomId, isSpamming: spamId > -1, startSpam, endSpam
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