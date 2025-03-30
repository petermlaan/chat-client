"use client"
import { rnd } from "@/lib/util"
import { useChatContext } from "./chatcontext"
import styles from "./chatroom.module.css"
import Rooms from "./rooms"

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
            window.setInterval(() => {
                const m = spam[rnd(spam.length - 1)]
                cc.sendMsg(m)
            }, 1000)
//        }
    }
    const cc = useChatContext()

    return (
        <div className={styles.chatroom}>
            <div className={styles.msgs}>
                {cc.messages.map((m, i) =>
                    <div className={styles.msg} key={i}>{m.user + ": " + m.msg}</div>
                )}
            </div>
            <div className={styles.top}>
                <input type="text" id="msg" />
                <button onClick={onBtnClick}>Skicka</button>
                <span>Connected:</span><span>{cc.isConnected + ""}</span>
                <span>Room:</span><span>{cc.room}</span>
                <Rooms />
                <button onClick={onBtnSpam}>Spam!</button>
                <span>Transport:</span><span>{cc.transport}</span>
                <span>User:</span><span>{cc.user}</span>
            </div>
        </div>
    )
}
