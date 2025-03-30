"use client"
import { useChatContext } from "./chatcontext"

export default function Rooms() {
    const cc = useChatContext()

    return (
        <select onChange={(e) => cc.joinRoom(+e.target.value)}>
            <option value={-1}>Chat room</option>
            <option value={0}>Room 1</option>
            <option value={1}>Room 2</option>
            <option value={2}>Room 3</option>
        </select>
    )
}