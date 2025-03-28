import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client";

export default function useChat(username: string): [string[], (m: string) => void, boolean, string] {
    function sendMsg(m: string) {
        if (!socket || !socket.connected) {
            console.log("useChat: trying to send msg on null or closed socket", socket)
            return
        }
        socket.emit("message", m)
    }

    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [transport, setTransport] = useState("N/A")
    const [messages, setMessages] = useState<string[]>([])

    useEffect(() => {
        function onConnect() {
            setIsConnected(true)
            if (s) {
                setTransport(s.io.engine.transport.name)
                s.io.engine.on("upgrade", transport => setTransport(transport.name))
            }
        }
        function onDisconnect() {
            console.log("onDisconnect")
            setIsConnected(false)
            setTransport("N/A")
        }

        const s = io("ws://localhost:8080", {auth: {token: username}})
        setSocket(s)
        if (s) {
            s.on("connect", onConnect)
            s.on("disconnect", onDisconnect)
            s.on("message", e => setMessages(prev => [...prev, e]))
        }
    }, [])

    return [messages, sendMsg, isConnected, transport]
}
