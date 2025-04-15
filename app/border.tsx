"use client"
import { DRAG_DATA_BORDERH, DRAG_DATA_BORDERV, DRAG_FORMAT_TEXT } from "@/lib/constants"
import styles from "./border.module.css"
import { DragEvent, useState } from "react"

export default function Border({
    vertical,
    setDragover,
}: {
    vertical: boolean | undefined,
    setDragover: (dragover: boolean) => void,
}) {
    function onDragStart(e: DragEvent<HTMLDivElement>) {
        e.dataTransfer.setData(DRAG_FORMAT_TEXT, vertical ? DRAG_DATA_BORDERV : DRAG_DATA_BORDERH)
        setDragging(true)
        setDragover(true)
    }
    function onDragEnd() {
        setDragging(false)
        setDragover(false)
    }

    const [dragging, setDragging] = useState(false)

    return (
        <div
            className={`${styles.border} ${vertical ? styles.borderv : styles.borderh} ${dragging ? styles.dragging : ""}`}
            draggable 
            onDragStart={onDragStart} 
            onDragEnd={onDragEnd}>
        </div>
    )
}