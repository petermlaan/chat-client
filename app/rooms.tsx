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
    const { isLoaded } = useUser()
    const gc = useGlobalContext()
    const cc = useChatContext()

    useEffect(() => {
        if (isLoaded) {
            cc.joinRoom(roomId)
        }
        
        return () => {
            cc.joinRoom(-1)
        }
    }, [roomId, isLoaded])

    return (<div className="flexcent">
        <select id="room" defaultValue={roomId} onChange={(e) => cc.joinRoom(+e.target.value)}>
            <option value={-1}>Chat room</option>
            {gc.rooms.map(r =>
                <option value={r.id} key={r.id}>{r.name}</option>)}
        </select>
    </div>)
}