import styles from "./border.module.css"
import { useState } from "react"

export default function Border({
    setDragover,
}: {
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
      className={`${styles.border} ${dragging ? styles.dragging : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}>
    </div>
  );
}