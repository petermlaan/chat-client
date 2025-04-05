"use client"
import { KeyboardEvent, MouseEvent as ReactMouseEvent } from "react"
import { useChatContext } from "../components/chatcontext"
import styles from "./chatroom.module.css"
import Rooms from "./rooms"
import { query } from "@/lib/util"
import { useGlobalContext } from "@/components/globalcontext"

export default function ChatRoom({
    roomId
}: {
    roomId: number
}) {
    function onBtnSend(e: ReactMouseEvent<HTMLButtonElement, MouseEvent>) {
        const node = query(".msgtxt", e.currentTarget)
        sendMsg(node)
    }
    function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            const node = query(".msgtxt", e.currentTarget)
            sendMsg(node)
        }
    }
    function onBtnSpam() {
        if (cc.isSpamming)
            cc.endSpam()
        else
            cc.startSpam()
    }
    function sendMsg(inputEl: Element | null | undefined) {
        const input = inputEl as HTMLInputElement
        if (input) {
            const msg = input.value.trim()
            if (msg) {
                cc.sendMsg(msg)
                input.value = ""
            }
        }
    }

    const cc = useChatContext()

    return (
        <div className={styles.chatroom}>
            <div className={styles.msgs}>
                {cc.messages.map((m, i) =>
                    <div className={styles.msg} key={i}>{m.user + ": " + m.msg}</div>
                )}
            </div>
            <div className={styles.ctrl}>
                <Rooms roomId={roomId} />
                <button onClick={onBtnSpam} className="imgbtn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                        viewBox="0 0 24 24" fill="none" stroke={cc.isSpamming ? "yellow" : "grey"}
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" />
                        <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
                    </svg>
                </button>
                <div className="flexcentgrow">
                    <input type="text" onKeyDown={onKeyDown} className="msgtxt" />
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
        </div>
    )
}
