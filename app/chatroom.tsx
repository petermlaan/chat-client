"use client"
import { KeyboardEvent, MouseEvent as ReactMouseEvent, useRef } from "react"
import styles from "./chatroom.module.css"
import { useChatContext } from "../components/chatcontext"
import Rooms from "./rooms"
import { useGlobalContext } from "@/components/globalcontext"
import { Split } from "@/lib/interfaces"
import { DRAG_DATA_BORDERH, DRAG_DATA_BORDERV, DRAG_DATA_SPLITH, DRAG_DATA_SPLITV, DRAG_FORMAT_TEXT } from "@/lib/constants"
import { calcPercentage } from "@/lib/util"

export default function ChatRoom({
    split
}: {
    split: Split
}) {
    function onBtnSend() {
        sendMsg()
    }
    function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter')
            sendMsg()
    }
    function onBtnSpam() {
        if (cc.isSpamming)
            cc.endSpam()
        else
            cc.startSpam()
    }
    function sendMsg() {
        const msg = msgtxtRef.current?.value?.trim()
        if (msg) {
            cc.sendMsg(msg)
            msgtxtRef.current!.value = ""
        }
    }
    function onUserClick(e: ReactMouseEvent<HTMLButtonElement, MouseEvent>) {
        if (msgtxtRef.current) {
            msgtxtRef.current.value = "@" + e.currentTarget.innerText + " " + msgtxtRef.current.value
            msgtxtRef.current.focus()
        }
    }
    function onDrop(e: React.DragEvent<HTMLDivElement>) {
        const dragData = e.dataTransfer.getData(DRAG_FORMAT_TEXT)
        const rect = divRef.current?.getBoundingClientRect()
        if ((dragData === DRAG_DATA_SPLITH || dragData === DRAG_DATA_SPLITV) ||
            (e.ctrlKey && (dragData === DRAG_DATA_BORDERV || dragData === DRAG_DATA_BORDERH))) {
            split.vertical = e.ctrlKey ?
                (dragData === DRAG_DATA_BORDERV) :
                (dragData === DRAG_DATA_SPLITV)
            split.percent = 50
            if (rect)
                split.percent = calcPercentage(split.vertical!, rect, e.clientX, e.clientY)
            split.child1 = { roomId: split.roomId ?? 0 }
            split.child2 = { roomId: split.roomId ?? 0 }
            split.roomId = undefined
            gc.setLayout(-3) // save layouts and redraw the splitter tree
            e.stopPropagation()
        }
    }
    function onDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault()
    }

    const cc = useChatContext()
    const gc = useGlobalContext()
    const msgtxtRef = useRef<HTMLInputElement | null>(null)
    const divRef = useRef<HTMLDivElement | null>(null)

    return (
        <section onDrop={onDrop} onDragOver={onDragOver}
            ref={divRef} className={styles.chatroom}>
            <div className={styles.msgs}>
                {cc.roomId ?
                    cc.messages.map(m =>
                        <div className={styles.msg + gc.settings.fontClass + gc.settings.fontSizeClass} key={m.id}>
                            {(m.type < 2) &&
                                <button onClick={onUserClick} className={styles.msguser}
                                    key={"u" + m.id}>{m.user}</button>}
                            {((m.type < 2) ? ": " : "")}
                            <span className={(m.type === 0) ?
                                styles.msgmessage :
                                (m.type === 1) ?
                                    styles.msgpm :
                                    styles.msgsystem}
                                key={"m" + m.id}>
                                {m.message}
                            </span>
                        </div>
                    ) :
                    <div className={styles.noroom}>
                        <span>Join a chat room!</span>
                    </div>
                }
            </div>
            <div className={styles.ctrl}>
                <Rooms split={split} />
                <button onClick={onBtnSpam} className="imgbtn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"
                        viewBox="0 0 24 24" fill="none" stroke={cc.isSpamming ? "yellow" : "grey"}
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" />
                        <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
                    </svg>
                </button>
                <div className="flexcentgrow">
                    <input ref={msgtxtRef} type="text" onKeyDown={onKeyDown} className="msgtxt" />
                    <button onClick={onBtnSend} className="imgbtn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                            viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" />
                            <path d="M6 12h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    )
}
