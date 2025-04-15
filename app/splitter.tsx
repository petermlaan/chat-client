"use client"
import styles from "./splitter.module.css"
import { useRef } from "react"
import Border from "./border"
import { Split } from "@/lib/interfaces"
import ChatRoomCont from "./chatroomcont"
import { useGlobalContext } from "@/components/globalcontext"

export default function Splitter({
    split,
}: {
    split: Split | undefined;
}) {
    function onDrop(e: React.DragEvent<HTMLDivElement>) {
        const rect = divRef.current?.getBoundingClientRect()
        if (!dragover.current || !divRef.current)
            return // propagate event to the correct div
        if (rect && split && split.percent) {
            const res = (split.vertical ?
                ((e.clientY - rect.top) / rect.height) :
                ((e.clientX - rect.left) / rect.width))
            const newPercent = Math.min(95, Math.max(5, Math.floor(res * 1000) / 10))
            split.percent = newPercent
            if (split.vertical)
                divRef.current.style.setProperty(
                    "grid-template-rows",
                    `${newPercent}% 0.8% ${99.2 - newPercent}%`, "important")
            else
                divRef.current.style.setProperty(
                    "grid-template-columns",
                    `${newPercent}% 0.4% ${99.6 - newPercent}%`, "important")
        }
        gc.setLayout(-2) // Save the layout
        e.stopPropagation()
    }
    function onDragOver(e: React.DragEvent<HTMLDivElement>) {
        if (dragover.current)
            e.preventDefault()
    }
    function setDragover(d: boolean) {
        dragover.current = d
    }

    const gc = useGlobalContext()
    const dragover = useRef(false)
    const divRef = useRef<HTMLDivElement | null>(null)

    return (
        <>
            {split?.percent ? (
                <div
                    className={styles.cont}
                    style={
                        split.vertical
                            ? { gridTemplateRows: `${split.percent}% 0.8% ${99.2 - split.percent}%` }
                            : { gridTemplateColumns: `${split.percent}% 0.4% ${99.6 - split.percent}%` }
                    }
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    ref={divRef}>
                    <Splitter split={split.child1} />
                    <Border vertical={split.vertical} setDragover={setDragover} />
                    <Splitter split={split.child2} />
                </div>
            ) : (
                <ChatRoomCont split={split} />
            )}
        </>
    );
}
