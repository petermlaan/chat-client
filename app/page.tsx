"use client"
import useChat from "@/lib/usechat";
import styles from "./page.module.css"
import { useEffect } from "react";

export default function Home() {
  const [messages, sendMsg, isConnected, transport] = useChat()

  console.log("Home")

  useEffect(() => {
    console.log("useEffect")
    sendMsg("Hello from Home!")
  }, [])
  
  return (
    <div className={styles.page}>
      {messages.map((m, i) =>
        <div key={i}>{m}</div>
      )}
    </div>
  );
}
