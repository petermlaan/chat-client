"use client"
import styles from "./splitter.module.css"
import { Split } from "@/lib/interfaces"
import ChatRoomCont from "./chatroomcont"
import Border from "./border"
import { useRef } from "react"
import { useGlobalContext } from "@/components/globalcontext"
import { queryClosest } from "@/lib/util"

export default function Splitter({
    layout,
    level,
}: {
    layout: Split | undefined;
    level: number;
}) {
    function onDrop(e: React.DragEvent<HTMLDivElement>) {
        console.log("Split onDrop", level, dragover.current)
        console.log("Split onDrop", e, layout, e.clientX, e.clientY)
        const div = divRef.current //queryClosest(".split", e.target as HTMLElement)
        console.log("Split onDrop div", div)
        const rect = div?.getBoundingClientRect()
        console.log("Split onDrop rect", rect)
        if (!dragover.current) {
            console.log("Split onDrop propagation...")
            return
        }
        if (rect && layout && layout.percent) {
            const res = (layout.vertical ? (e.clientY / rect.height) : (e.clientX / rect.width)) * 100
            console.log("Split onDrop res", res)
            const newPercent = Math.min(95, Math.max(5, res))
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
    const divRef = useRef<HTMLDivElement | null>(null)

    return (
        <>
            {layout?.percent ? (
                <div
                    className={styles.cont + " split" + " level" + level}
                    style={
                        layout.vertical
                            ? { gridTemplateRows: `${layout.percent}% 0.8% ${99.2 - layout.percent}%` }
                            : { gridTemplateColumns: `${layout.percent}% 0.4% ${99.6 - layout.percent}%` }
                    }
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    ref={divRef}>
                    <Splitter layout={layout.child1} level={level+1} />
                    <Border vertical={layout.vertical} setDragover={setDragover} />
                    <Splitter layout={layout.child2} level={level+1} />
                </div>
            ) : (
                <ChatRoomCont roomId={layout?.roomId ?? -1} />
            )}
        </>
    );
}
