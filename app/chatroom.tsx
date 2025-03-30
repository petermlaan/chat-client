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
    "Chaticus Maximus caused the fall of the Roman Empire. They couldn't handle that many chats.",
    "Hey everyone! 👋",
    "What's the topic today?",
    "Can someone help me with this bug? 🐛",
    "LOL, that's hilarious! 😂",
    "I think we should refactor the codebase.",
    "Does anyone know when the meeting starts?",
    "I'm stuck on this feature. Any ideas?",
    "Good morning! ☀️",
    "Why is this not working? 😩",
    "Let's deploy this to production! 🚀",
    "Can we add dark mode to the app?",
    "This is the best chatroom ever! 😎",
    "Who wants to grab lunch? 🍔",
    "I just pushed a new commit. Please review.",
    "What does this error even mean? 🤔",
    "Can we schedule a quick sync-up?",
    "This is so frustrating! 😡",
    "Great job on the release, team! 🎉",
    "Does anyone have a good meme to share? 😄",
    "I'm logging off for the day. See you tomorrow!"
]

export default function ChatRoom() {
    function onBtnSend() {
        const node = document.querySelector("#msg")
        if (node) {
            const input = node as HTMLInputElement
            cc.sendMsg(input.value)
            input.value = ""
        }
    }
    function onBtnSpam() {
        if (cc.spamId > -1) {
            window.clearInterval(cc.spamId)
            cc.setSpamId(-1)
        } else {
            const id = window.setInterval(() => {
                const m = spam[rnd(spam.length - 1)]
                cc.sendMsg(m)
            }, 1000)
            cc.setSpamId(id)
        }
    }
    function onBtnConnect() {
        if (cc.isConnected) {
            cc.joinRoom(-1)
        } else {
            const node = document.querySelector("#room")
            if (node) {
                const sel = node as HTMLSelectElement
                cc.joinRoom(+sel.value)
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
                <Rooms />
                <button onClick={onBtnConnect} className={styles.imgbtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                        viewBox="0 0 24 24" fill="none" strokeWidth="2"
                        stroke={cc.isConnected ? "yellow" : "grey"}
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
                    </svg>
                </button>
                <input type="text" id="msg" />
                <button onClick={onBtnSend}>Send</button>
                <button onClick={onBtnSpam} className={styles.imgbtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                        viewBox="0 0 24 24" fill="none" stroke={cc.spamId > -1 ? "yellow" : "grey"}
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" />
                        <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
                    </svg>
                </button>
                <span>{cc.transport}</span>
                <span>{cc.user}</span>
            </div>
        </div>
    )
}
