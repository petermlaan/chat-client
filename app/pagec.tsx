"use client"
import { useChatContext } from "./chatcontext"
import ChatRoom from "./chatroom"
import Splitter from "./splitter"

export default function PageC() {
    const cc = useChatContext()

    return (<>
        {cc.layout ?
            <Splitter layout={cc.layout} /> :
            <ChatRoom />}
    </>)
}
