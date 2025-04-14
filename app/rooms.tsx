"use client"
import { useEffect } from "react"
import { useChatContext } from "../components/chatcontext"
import { useGlobalContext } from "../components/globalcontext"
import { useUser } from "@clerk/nextjs"
import { Split } from "@/lib/interfaces"

// Select element with all chat rooms.
export default function Rooms({
    split
}: {
    split: Split | undefined
}) {
    function onRoomChange(roomId: number) {
        cc.joinRoom(roomId)

        // Only save the room in the selected layout if its roomId > -1
        if (split && split?.roomId !== undefined && split?.roomId > -1) {
            split.roomId = roomId
            gc.setLayout(-2)
        }
    }

    const { isLoaded } = useUser()
    const gc = useGlobalContext()
    const cc = useChatContext()

    useEffect(() => {
        if (isLoaded && cc.clientId > -1 && gc.isConnected) {
            cc.joinRoom(Math.abs(split?.roomId ?? 0))
        }

        return () => {
            cc.joinRoom(0)
        }
    }, [split?.roomId, isLoaded, cc.clientId, gc.isConnected])

    return (
        <select defaultValue={Math.abs(split?.roomId ?? 0)} onChange={e => onRoomChange(+e.target.value)}>
            <option value={0}>Chat room</option>
            {gc.rooms.map(r =>
                <option value={r.id} key={r.id}>{r.name}</option>)}
        </select>
    )
}