import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { Msg } from "./interfaces"

export default function useChat(username: string, roomNo: number): 
    [Msg[], (m: string) => void, boolean, string, number, string] {
    function sendMsg(msg: string) {
        if (!socket || !socket.connected) {
            console.log("useChat: trying to send msg on null or closed socket", socket)
            return
        }
        socket.emit("message", msg)
    }

    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [transport, setTransport] = useState("N/A")
    const [messages, setMessages] = useState<Msg[]>([])
    const [room, setRoom] = useState(roomNo)
    const [user, setUser] = useState(username)

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

        setRoom(roomNo)
        setUser(username)
        const s = io("ws://localhost:808" + room, {auth: {token: username}})
        setSocket(s)
        if (s) {
            s.on("connect", onConnect)
            s.on("disconnect", onDisconnect)
            s.on("message", e => {
                setMessages(prev => [JSON.parse(e), ...prev])
            })
        }
    }, [])

    return [messages, sendMsg, isConnected, transport, room, user]
}
