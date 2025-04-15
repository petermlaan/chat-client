"use client"
import styles from "./splitx.module.css"
import { DragEvent, useState } from "react"

export default function SplitV({
}: {
}) {
    function onDragStart(e: DragEvent<HTMLDivElement>) {
        e.dataTransfer.setData("text/plain", "SplitV")
        setDragging(true)
    }
    function onDragEnd() {
        setDragging(false)
    }

    const [dragging, setDragging] = useState(false)

    return (
        <div
            className={`${styles.borderx} ${styles.borderv} ${dragging ? styles.dragging : ""}`}
            draggable 
            onDragStart={onDragStart} 
            onDragEnd={onDragEnd}>
        </div>
    )
}
