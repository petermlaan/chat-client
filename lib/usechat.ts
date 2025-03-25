import { DefaultEventsMap } from "@socket.io/component-emitter";
import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client";

export default function useChat(): [string[], (m: string) => void, boolean, string] {
    function sendMsg(m: string) {
        console.log("sendMsg: " + m)
        if (!ws || !ws.connected) {
            console.log("useChat: trying to send msg on null or closed ws", ws)
            return
        }
        ws.send(m)
    }
    function onConnect() {
        console.log("onConnect: ", ws)
        setIsConnected(true)
        if (ws) {
            setTransport(ws.io.engine.transport.name)
            ws.io.engine.on("upgrade", (transport) => {
                setTransport(transport.name)
            });
            ws.send("Hello, server!")
        }
    }
    function onDisconnect() {
        console.log("onDisconnect")
        setIsConnected(false)
        setTransport("N/A")
    }

    const [ws, setWS] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [transport, setTransport] = useState("N/A")
    const [messages, setMessages] = useState<string[]>([])

    useEffect(() => {
        const s = io("ws://localhost:8080")
        console.log("useEffect - socket: ", s);
        if (s) {
            s.on("connect", onConnect)
            s.on("disconnect", onDisconnect)
            s.on("message", (e) => {
                console.log("Received message from server: ", e)
                //setMessages([...messages, ev.data as string])
            })
        }
        setWS(s)

        return () => {
            console.log("useEffect cleanup")
            if (s) {
                s.off("connect", onConnect)
                s.off("disconnect", onDisconnect)
                s.off("message", onDisconnect)
            }
        };
    }, [])

    return [messages, sendMsg, isConnected, transport]
}
