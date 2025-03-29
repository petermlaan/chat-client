"use client"
import useChat from "@/lib/usechat";
import styles from "./pagec.module.css"
import { rnd } from "@/lib/util";

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
    function onBtnClick() {
        const node = document.querySelector("#msg")
        if (node) {
            const input = node as HTMLInputElement
            sendMsg(input.value)
            input.value = ""
        }
    }
    function onBtnSpam() {
        const node = document.querySelector("#delay")
        if (node) {
            const input = node as HTMLInputElement
            const delay = 1000 * +input.value
            window.setInterval(() => {
                const m = spam[Math.floor(Math.random() * 9.999)]
                sendMsg(m)
            }, delay)
        }
    }

    const [messages, sendMsg, isConnected, transport, room, user] = useChat("User" + rnd(99), rnd(2))

    return (
        <main className={styles.main}>
            <div className={styles.top}>
                <input type="text" id="msg" />
                <button onClick={onBtnClick}>Skicka</button>
                <span>Connected:</span><span>{isConnected + ""}</span>
                <span>Room:</span><span>{room}</span>
                <input type="text" id="delay" defaultValue="2" />
                <button onClick={onBtnSpam}>Spam!</button>
                <span>Transport:</span><span>{transport}</span>
                <span>User:</span><span>{user}</span>
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
