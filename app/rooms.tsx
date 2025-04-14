"use client"
import { useEffect } from "react"
import { useChatContext } from "../components/chatcontext"
import { useGlobalContext } from "../components/globalcontext"
import { useUser } from "@clerk/nextjs"
import { Split } from "@/lib/interfaces"

// Select element with all chat rooms.
export default function Rooms({
    layout
}: {
    layout: Split | undefined
}) {
    function onRoomChange(roomId: number) {
        cc.joinRoom(roomId)
        if (layout) {
            layout.roomId = roomId
            gc.setLayout(-2)
        }
    }

    const { isLoaded } = useUser()
    const gc = useGlobalContext()
    const cc = useChatContext()

    useEffect(() => {
        if (isLoaded && cc.clientId > -1 && gc.isConnected) {
            cc.joinRoom(layout?.roomId ?? -1)
        }

        return () => {
            cc.joinRoom(-1)
        }
    }, [layout?.roomId, isLoaded, cc.clientId, gc.isConnected])

    return (
        <select defaultValue={layout?.roomId ?? -1} onChange={e => onRoomChange(+e.target.value)}>
            <option value={-1}>Chat room</option>
            {gc.rooms.map(r =>
                <option value={r.id} key={r.id}>{r.name}</option>)}
        </select>
    )
}