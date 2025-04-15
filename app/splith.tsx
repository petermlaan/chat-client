"use client"
import styles from "./splitx.module.css"
import { DragEvent, useState } from "react"

export default function SplitH({
}: {
}) {
    function onDragStart(e: DragEvent<HTMLDivElement>) {
        e.dataTransfer.setData("text/plain", "SplitH")
        setDragging(true)
    }
    function onDragEnd() {
        setDragging(false)
    }

    const [dragging, setDragging] = useState(false)

    return (
        <div
            className={`${styles.borderx} ${styles.borderh} ${dragging ? styles.dragging : ""}`}
            draggable 
            onDragStart={onDragStart} 
            onDragEnd={onDragEnd}>
        </div>
    )
}
