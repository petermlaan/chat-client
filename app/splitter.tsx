"use client"
import styles from "./splitter.module.css"
import { Split } from "@/lib/interfaces"
import ChatRoomCont from "./chatroomcont"
import Border from "./border"
import { useRef } from "react"
import { useGlobalContext } from "@/components/globalcontext"

export default function Splitter({
    layout,
}: {
    layout: Split | undefined;
}) {
    function onDrop(e: React.DragEvent<HTMLDivElement>) {
        console.log("Split onDrop", e, layout)
        if (layout && layout.percent) {
            const newPercent = Math.min(95, Math.max(5, (
                (layout.vertical ? e.clientX : e.clientY) /
                (layout.vertical ? window.innerHeight : window.innerWidth)
            ) * 100))
            layout.percent = newPercent
        }
        gc.setLayout(-1)
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

    return (
        <>
            {layout?.percent ? (
                <div
                    className={styles.cont}
                    style={
                        layout.vertical
                            ? { gridTemplateRows: `${layout.percent}% 1% ${99 - layout.percent}%` }
                            : { gridTemplateColumns: `${layout.percent}% 1% ${99 - layout.percent}%` }
                    }
                    onDrop={onDrop}
                    onDragOver={onDragOver}>
                    <Splitter layout={layout.child1} />
                    <Border setDragover={setDragover} />
                    <Splitter layout={layout.child2} />
                </div>
            ) : (
                <ChatRoomCont roomId={layout?.roomId ?? -1} />
            )}
        </>
    );
}
