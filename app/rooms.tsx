"use client"
import { useChatContext } from "./chatcontext"

export default function Rooms() {
    const cc = useChatContext()

    return (<>
        <button onClick={() => cc.joinRoom(0)}>Rum 1</button>
        <button onClick={() => cc.joinRoom(1)}>Rum 2</button>
        <button onClick={() => cc.joinRoom(2)}>Rum 3</button>
    </>)
}