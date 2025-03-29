"use client"
import styles from "./rooms.module.css"
import { useChatContext } from "./chatcontext"

export default function Rooms() {
    const cc = useChatContext()

    return (
        <div className={styles.page}>
            <button onClick={() => cc.joinRoom(0)}>Rum 1</button>
            <button onClick={() => cc.joinRoom(1)}>Rum 2</button>
            <button onClick={() => cc.joinRoom(2)}>Rum 3</button>
        </div>
    )
}