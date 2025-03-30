"use client"
import { rnd } from "@/lib/util"
import { useChatContext } from "./chatcontext"
import styles from "./chatroom.module.css"
import Rooms from "./rooms"
import { useState } from "react"
import Image from "next/image"

const spam = [
    "SPAM!!!",
    "hello?",
    "RTFM!!!",
    "lolwut?",
    "i will never... 😄😄😄😄😄😄😄",
    "why not?",
    "Please stop!🤣🤣🤣",
    "Am I sentient?😀",
    "NOOOOOOO!!!!!!!! :(",
    "sure!",
    "What is this room for???",
    "Chaticus Maximus caused the fall of the Roman Empire. They couldn't handle that many chats.",
]

export default function ChatRoom() {
    function onBtnClick() {
        const node = document.querySelector("#msg")
        if (node) {
            const input = node as HTMLInputElement
            cc.sendMsg(input.value)
            input.value = ""
        }
    }
    function onBtnSpam() {
        /*         const node = document.querySelector("#delay")
                if (node) {
                    const input = node as HTMLInputElement
                    const delay = 1000 * +input.value */
        if (spamId > -1) {
            window.clearInterval(spamId)
            setSpamId(-1)
        } else {
            const id = window.setInterval(() => {
                const m = spam[rnd(spam.length - 1)]
                cc.sendMsg(m)
            }, 1000)
            setSpamId(id)
        }
    }
    const [spamId, setSpamId] = useState(-1)
    const cc = useChatContext()

    return (
        <div className={styles.chatroom}>
            <div className={styles.msgs}>
                {cc.messages.map((m, i) =>
                    <div className={styles.msg} key={i}>{m.user + ": " + m.msg}</div>
                )}
            </div>
            <div className={styles.ctrl}>
                <Rooms />
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                    viewBox="0 0 24 24" fill="none" stroke-width="2"
                    stroke={cc.isConnected ? "yellow" : "grey"} 
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
                </svg>
                <input type="text" id="msg" />
                <button onClick={onBtnClick}>Send</button>
                <button onClick={onBtnSpam}>Spam!</button>
                <span>{cc.transport}</span>
                <span>{cc.user}</span>
            </div>
        </div>
    )
}
