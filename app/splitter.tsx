"use client"
import styles from "./splitter.module.css"
import { useRef } from "react"
import Border from "./border"
import { Split } from "@/lib/interfaces"
import ChatRoomCont from "./chatroomcont"
import { useGlobalContext } from "@/components/globalcontext"
import { BORDER_HEIGHT_PERC, BORDER_WIDTH_PERC, DRAG_DATA_BORDER, DRAG_FORMAT_TEXT } from "@/lib/constants"

export default function Splitter({
    split,
}: {
    split: Split;
}) {
    function onDrop(e: React.DragEvent<HTMLDivElement>) {
        const dragData = e.dataTransfer.getData(DRAG_FORMAT_TEXT)
        if (dragData !== DRAG_DATA_BORDER)
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
                        getTemplateRows())
                else
                    divRef.current.style.setProperty(
                        "grid-template-columns",
                        getTemplateColumns())
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
    function getTemplateRows() {
        return `${split.percent}% ${BORDER_HEIGHT_PERC}% ${100 - BORDER_HEIGHT_PERC - split.percent!}%`
    }
    function getTemplateColumns() {
        return `${split.percent}% ${BORDER_WIDTH_PERC}% ${100 - BORDER_WIDTH_PERC - split.percent!}%`
    }

    const gc = useGlobalContext()
    const dragover = useRef(false)
    const divRef = useRef<HTMLDivElement | null>(null)

    if (split.percent && ((split.child1 === undefined) || (split.child2 === undefined))) {
        console.error(split)
        throw new Error("Children can't be undefined unless percent is undefined")
    }

    return (
        <>
            {split.percent ? (
                <div
                    className={styles.cont}
                    style={split.vertical ? 
                        { gridTemplateRows: getTemplateRows() } :
                        { gridTemplateColumns: getTemplateColumns()}}
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
