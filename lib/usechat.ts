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
        console.log("onConnect")
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

    const [ws, setWS] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [transport, setTransport] = useState("N/A")
    const [messages, setMessages] = useState<string[]>([])

    useEffect(() => {
        const s = io("ws://localhost:8080")
        console.log("useEffect - socket: ", s);
        setWS(s)
        if (ws) {
            ws.on("connect", onConnect)
            ws.on("disconnect", onDisconnect)
            ws.on("message", (ev) => {
                console.log("Received message from server: ", ev)
                //setMessages([...messages, ev.data as string])
            })
        }

        return () => {
            console.log("useEffect cleanup")
            if (ws) {
                ws.off("connect", onConnect)
                ws.off("disconnect", onDisconnect)
                ws.off("message", onDisconnect)
            }
        };
    }, [])

    return [messages, sendMsg, isConnected, transport]
}
