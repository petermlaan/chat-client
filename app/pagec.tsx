"use client"
import ChatRoomCont from "./chatroomcont"
import { useLayoutContext } from "./layoutcontext"
import Splitter from "./splitter"

export default function PageC() {
    const lc = useLayoutContext()

    return (<>
        {lc.layout ?
            <Splitter layout={lc.layout} /> :
            <ChatRoomCont />}
    </>)
}
