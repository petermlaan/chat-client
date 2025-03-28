"use client"
import useChat from "@/lib/usechat";
import styles from "./pagec.module.css"
import { MouseEvent as RME } from "react";

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
    "sure?",
]

export default function PageC() {
    function onBtnClick(e: RME<HTMLButtonElement, MouseEvent>) {
        const node = e.currentTarget.parentElement?.firstChild
        if (node) {
            const input = node as HTMLInputElement
            sendMsg(input.value)
            input.value = ""
        }
    }
    function onBtnSpam(e: RME<HTMLButtonElement, MouseEvent>) {
        const node = e.currentTarget.parentElement?.childNodes[2]
        if (node) {
            const input = node as HTMLInputElement
            const delay = 1000 * +input.value
            window.setInterval(() => {
                const m = spam[Math.floor(Math.random() * 9.999)]
                sendMsg(m)
            }, delay)
        }
    }

    const [messages, sendMsg, isConnected, transport] = useChat("User" + (100 * Math.random()).toFixed(0))

    return (
        <main className={styles.main}>
            <div className={styles.top}>
                <input type="text" />
                <button onClick={(e) => onBtnClick(e)}>Skicka</button>
                <input type="text" defaultValue="2" />
                <button onClick={(e) => onBtnSpam(e)}>Spam!</button>
                <span>Connected:</span><span>{isConnected + ""}</span>
                <span>Transport:</span><span>{transport}</span>
            </div>
            <hr />
            <div className={styles.msgs}>
                {messages.map((m, i) =>
                    <div className={styles.msg} key={i}>{m.user + ": " + m.msg}</div>
                )}
            </div>
        </main>
    );
}
