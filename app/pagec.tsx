"use client"
import useChat from "@/lib/usechat";
import styles from "./pagec.module.css"
import { MouseEvent as RME } from "react";

export default function PageC() {
    function onBtnClick(e: RME<HTMLButtonElement, MouseEvent>) {
        const node = e.currentTarget.parentElement?.firstChild
        if (node) {
            const input = node as HTMLInputElement
            sendMsg(input.value)
            input.value = ""
        }
    }

    const [messages, sendMsg, isConnected, transport] = useChat("User" + (100 * Math.random()).toFixed(0))

    return (
        <main className={styles.main}>
            <div className={styles.page}>
                <input type="text" />
                <button onClick={(e) => onBtnClick(e)}>Skicka</button>
                <span>Connected:</span>
                <span>{isConnected + ""}</span>
                <span>Transport:</span><span>{transport}</span>
            </div>
            <hr />
            <div className={styles.msgs}>
                {messages.map((m, i) =>
                    <div className={styles.msg} key={i}>{`${m.date.getHours()}:${m.date.getMinutes()}:${m.date.getSeconds()} ${m.user}: ${m.msg}`}</div>
                )}
            </div>
        </main>
    );
}
