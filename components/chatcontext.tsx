"use client"
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Msg } from '@/lib/interfaces';
import { rnd } from '@/lib/util';
import { useGlobalContext } from './globalcontext';
import { MAX_MESSAGES } from '@/lib/constants';

const spam = [
    "Yo, chummer, you got the creds for this run?",
    "The grid's lit up like a Christmas tree tonight. Watch your back.",
    "Just jacked into the matrix. Who's ready to burn some ICE?",
    "Got a hot tip on a corp shipment. Meet me at the usual spot.",
    "Frag it, the deck's overheating again. Need a new cooling rig.",
    "Anyone seen a fixer around? Got some gear to offload.",
    "The megacorps are up to something big. Feels like a storm's coming.",
    "Keep your chrome clean and your optics sharper, omae.",
    "Just dodged a Lone Star patrol. Close call.",
    "Need a decker for a quick smash-and-grab. Any takers?",
    "The streets are crawling with drones tonight. Stay low.",
    "Got a new piece of cyberware. Feels like I'm running on overdrive.",
    "Anyone got a spare credstick? I'm tapped out.",
    "The Johnson's offer smells fishy. Might be a setup.",
    "Just hacked a corp node. Got some juicy data to sell.",
    "Watch out for the Yakuza in the Redmond Barrens. They're on edge.",
    "Need a rigger for a vehicle extraction. Who's in?",
    "The matrix is crawling with black ICE. Be careful out there.",
    "Just scored some rare bioware. Anyone interested?",
    "The shadows are darker than usual tonight. Something's up.",
    "Got a lead on a high-paying run. Need a team ASAP.",
    "Anyone know a good street doc? My cyberarm's glitching.",
    "The corp sec is using new drones. Watch for thermal scans.",
    "Just saw a dragon in the matrix. No joke.",
    "Need a mage for some astral recon. Any spell-slingers around?",
    "The SIN scanners are acting up. Might be a good time to move.",
    "Got a new datajack installed. Feels like I'm flying.",
    "The local gang's been quiet. Too quiet.",
    "Anyone got a spare mag for a Predator? I'm running low.",
    "The fixer says the job's clean, but I don't trust him.",
    "Just saw a chromed-out samurai take down a troll. Wild.",
    "The corp's got a new prototype. Could be worth a fortune.",
    "Need a face for a negotiation. Who's got the silver tongue?",
    "The astral plane feels... off tonight. Anyone else notice?",
    "Just picked up a new deck. Time to test it out.",
    "The streets are buzzing with rumors about a new gang in town.",
    "Anyone got a line on some C4? Got a door that needs opening.",
    "The Johnson's paying in crypto. Hope it's not a scam.",
    "Just dodged a corp hit squad. They're getting bolder.",
    "The matrix is alive tonight. Feels electric.",
    "Need a safehouse for a few days. Anyone got a spot?",
    "The local street doc's been arrested. Need a new contact.",
    "Just saw a technomancer fry a drone with their mind. Impressive.",
    "The corp's got a bounty on my head. Time to lay low.",
    "Anyone got a spare commlink? Mine's fried.",
    "The fixer says the job's a milk run. Yeah, right.",
    "Just saw a troll bouncer toss a guy like a ragdoll. Brutal.",
    "The shadows are calling, chummers. Who's ready to run?",
    "Got a lead on a black market cyberdeck. Anyone interested?",
    "The megacorps are always watching. Stay frosty."
]

interface ChatContextType {
    clientId: number,
    messages: Msg[],
    joinRoom: (roomNo: number) => void,
    sendMsg: (m: string) => void,
    roomId: number,
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
            const newList = prev.length > MAX_MESSAGES ? prev.slice(0, Math.floor(MAX_MESSAGES / 2)) : prev
            msg.id = rnd(1E12) // Used for unique keys for react performance reasons.
            return [msg, ...newList]
        })
    }
    function joinRoom(roomId: number) {
        endSpam()
        setMessages([])
        if (clientIdRef.current > -1) {
            setRoomId(roomId)
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
    const [roomId, setRoomId] = useState(-1)
    const clientIdRef = useRef(-1)
    const gc = useGlobalContext()

    useEffect(() => {
        clientIdRef.current = gc.registerClient(onMessage)

        return () =>
            gc.unregisterClient(clientIdRef.current)
    }, [])

    useEffect(() => {
        return () => {
            endSpam(spamId)
        }
    }, [spamId])

    return (
        <ChatContext.Provider value={{
            clientId: clientIdRef.current, messages, joinRoom, sendMsg, roomId, isSpamming: spamId > -1, startSpam, endSpam
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