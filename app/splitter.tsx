import { Split } from "@/lib/interfaces"
import ChatRoom from "./chatroom"
import styles from "./splitter.module.css"

export default function Splitter({
    layout
}: {
    layout: Split
}) {
    return (
        <div className={styles.cont}
            style={layout.vertical ?
                { gridTemplateRows: layout.percent + "% " + (100 - layout.percent) + "%" } :
                { gridTemplateColumns: layout.percent + "% " + (100 - layout.percent) + "%" }}>
            {layout.child1 ?
                <Splitter layout={layout.child1} /> :
                <ChatRoom />}
            {layout.child2 ?
                <Splitter layout={layout.child2} /> :
                <ChatRoom />}
        </div>
    )
}
