"use client"
import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Msg } from '@/lib/interfaces';
import { rnd } from '@/lib/util';
import { useUser } from '@clerk/nextjs';
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
        if (msg.type === 0)
            setMessages(prev => {
                const newList = prev.length > 150 ? prev.slice(0, 100) : prev
                return [msg, ...newList]
            })
        else if (msg.type === 1 || msg.type === 2)
            setMessages(prev => {
                msg.msg = (msg.type === 1 ? "<joined" : "<left") + " the channel>"
                return [msg, ...prev]
            })
    }
    function joinRoom(roomId: number) {
        console.log("joinRoom: " + roomId)
        endSpam()
        setRoom(roomId)
        setMessages([])
        gc.joinRoom(clientId, roomId)
    }
    function sendMsg(msg: string) {
        gc.sendMsg(clientId, msg)
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
    const [roomId, setRoom] = useState(-1)
    const [spamId, setSpamId] = useState(-1)
    const [clientId, setClientId] = useState(-1)
    const gc = useGlobalContext()

    useEffect(() => {
        setClientId(gc.registerClient(onMessage))

        return () => endSpam(spamId)
    }, [spamId])

    return (
        <ChatContext.Provider value={{
            messages, joinRoom, sendMsg, room: roomId, isSpamming: spamId > -1, startSpam, endSpam
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