"use client"
import styles from "./splitter.module.css"
import { useRef } from "react"
import Border from "./border"
import { Split } from "@/lib/interfaces"
import ChatRoomCont from "./chatroomcont"
import { useGlobalContext } from "@/components/globalcontext"
import { DRAGDATA_BORDER, DRAGTYPE_TEXT } from "@/lib/constants"

export default function Splitter({
    split,
}: {
    split: Split;
}) {
    function onDrop(e: React.DragEvent<HTMLDivElement>) {
        console.log(split, divRef.current)
        const dragData = e.dataTransfer.getData(DRAGTYPE_TEXT)
        console.log(dragData)
        if (dragData !== DRAGDATA_BORDER)
            return
        if (!dragover.current || !divRef.current)
            return // propagate event to the correct Splitter
        const rect = divRef.current.getBoundingClientRect()
        if (rect && split.percent) {
            if (e.altKey) {
                // Delete both children
                split.roomId = split.child1?.roomId ?? 0
                split.child1 = undefined
                split.child2 = undefined
                split.percent = undefined
                split.vertical = undefined
                gc.setLayout(-3) // Save the layout and redraw the splitter tree
            } else {
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
                gc.setLayout(-2) // Save the layout
            }
        }
        e.stopPropagation()
    }
    function onDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault()
    }
    function setDragover(d: boolean) {
        dragover.current = d
    }

    const gc = useGlobalContext()
    const dragover = useRef(true)
    const divRef = useRef<HTMLDivElement | null>(null)

    if (split.percent && ((split.child1 === undefined) || (split.child2 === undefined))) {
        console.log(split)
        throw new Error("Children can't be undefined unless percent is undefined")
    }

    return (
        <>
            {split.percent ? (
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
                    <Splitter split={split.child1!} />
                    <Border vertical={split.vertical} setDragover={setDragover} />
                    <Splitter split={split.child2!} />
                </div>
            ) : (
                <ChatRoomCont split={split} />
            )}
        </>
    );
}
