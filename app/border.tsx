import styles from "./border.module.css"
import { useState } from "react"

export default function Border({
    vertical,
    setDragover,
}: {
    vertical: boolean | undefined,
    setDragover: (dragover: boolean) => void,
}) {
    function onDragStart() {
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
            draggable onDragStart={onDragStart} onDragEnd={onDragEnd}>
        </div>
    );
}