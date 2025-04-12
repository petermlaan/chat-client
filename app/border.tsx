import styles from "./border.module.css"
import { useState } from "react"

export default function Border({
    vertical,
    setDragover,
}: {
    vertical: boolean | undefined,
    setDragover: (dragover: boolean) => void,
}) {
    const [dragging, setDragging] = useState(false)

    function onDragStart(e: React.DragEvent<HTMLDivElement>) {
        console.log("Border onDragStart", e)
        setDragging(true)
        e.dataTransfer.setData("text/plain", "dragging")
        setDragover(true)
    }

    function onDragEnd(e: React.DragEvent<HTMLDivElement>) {
        console.log("Border onDragEnd", e)
        setDragging(false)
        setDragover(false)
    }

    return (
        <div
            className={`${styles.border} ${vertical ? styles.borderv : styles.borderh} ${dragging ? styles.dragging : ""}`}
            draggable onDragStart={onDragStart} onDragEnd={onDragEnd}>
        </div>
    );
}