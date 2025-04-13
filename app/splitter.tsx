"use client"
import styles from "./splitter.module.css"
import { useRef } from "react"
import Border from "./border"
import { Split } from "@/lib/interfaces"
import ChatRoomCont from "./chatroomcont"
import { useGlobalContext } from "@/components/globalcontext"

export default function Splitter({
    layout,
}: {
    layout: Split | undefined;
}) {
    function onDrop(e: React.DragEvent<HTMLDivElement>) {
        const rect = divRef.current?.getBoundingClientRect()
        if (!dragover.current) 
            return // propagate event to the correct div
        if (rect && layout && layout.percent) {
            // -45 due to e.clientY including the header height
            const res = (layout.vertical ? ((e.clientY-45) / rect.height) : (e.clientX / rect.width)) * 100
            const newPercent = Math.min(95, Math.max(5, res))
            layout.percent = newPercent
        }
        gc.setLayout(-2)
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
            {layout?.percent ? (
                <div
                    className={styles.cont}
                    style={
                        layout.vertical
                            ? { gridTemplateRows: `${layout.percent}% 0.8% ${99.2 - layout.percent}%` }
                            : { gridTemplateColumns: `${layout.percent}% 0.4% ${99.6 - layout.percent}%` }
                    }
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    ref={divRef}>
                    <Splitter layout={layout.child1} />
                    <Border vertical={layout.vertical} setDragover={setDragover} />
                    <Splitter layout={layout.child2} />
                </div>
            ) : (
                <ChatRoomCont layout={layout} />
            )}
        </>
    );
}
