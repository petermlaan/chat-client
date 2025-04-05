"use client"
import { MouseEvent as ReactMouseEvent, useEffect } from "react"
import { useChatContext } from "../components/chatcontext"
import { query } from "@/lib/util"
import { useGlobalContext } from "../components/globalcontext"
import { useUser } from "@clerk/nextjs"

export default function Rooms({
    roomId
}: {
    roomId: number
}) {
    function onBtnConnect(e: ReactMouseEvent<HTMLButtonElement, MouseEvent>) {
        if (cc.isConnected) {
            cc.joinRoom(-1)
        } else {
            const node = query("#room", e.currentTarget)
            if (node) {
                const sel = node as HTMLSelectElement
                cc.joinRoom(+sel.value)
            }
        }
    }

    const cc = useChatContext()
    const gc = useGlobalContext()
    const { isLoaded } = useUser();

    useEffect(() => {
        console.log("useEffect: " + roomId)
        if (isLoaded) {
            console.log("useEffect - joining room: " + roomId)
            cc.joinRoom(roomId)
        }
        return () => {
            console.log("useEffect cleanup")
            cc.joinRoom(-1)
        }
    }, [roomId, isLoaded])

    return (<div className="flexcent">
        <select id="room" defaultValue={roomId} onChange={(e) => cc.joinRoom(+e.target.value)}>
            <option value={-1}>Chat room</option>
            {gc.rooms.map(r =>
                <option value={r.id} key={r.id}>{r.name}</option>)}
        </select>
        <button onClick={onBtnConnect} className="imgbtn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                viewBox="0 0 24 24" fill="none" strokeWidth="2"
                stroke={cc.isConnected ? "yellow" : "grey"}
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
            </svg>
        </button>
    </div>)
}