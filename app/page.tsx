"use client"
import useChat from "@/lib/usechat";
import styles from "./page.module.css"
import { MouseEvent as RME } from "react";

export default function Home() {
  function onBtnClick(e: RME<HTMLButtonElement, MouseEvent>) {
    const node = e.currentTarget.parentElement?.firstChild
    if (node) {
      const input = node as HTMLInputElement
      sendMsg(input.value)
      input.value = ""
    }
  }

  const [messages, sendMsg, isConnected, transport] = useChat()

  return (<>
    <div className={styles.page}>
      <input type="text" />
      <button onClick={(e) => onBtnClick(e)}>Skicka</button>
      <span>Connected:</span>
      <span>{isConnected + ""}</span>
      <span>Transport:</span><span>{transport}</span>
    </div>
    <hr />
    {messages.map((m, i) =>
      <div key={i}>{m}</div>
    )}
  </>);
}
