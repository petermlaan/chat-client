import { Split } from "@/lib/interfaces"
import styles from "./splitter.module.css"
import ChatRoomCont from "./chatroomcont"

export default function Splitter({
    layout
}: {
    layout: Split | undefined
}) {
    return (<>
        {layout ?
            <div className={styles.cont}
                style={layout.vertical ?
                    { gridTemplateRows: layout.percent + "% " + (100 - layout.percent) + "%" } :
                    { gridTemplateColumns: layout.percent + "% " + (100 - layout.percent) + "%" }}>
                <Splitter layout={layout.child1} />
                <Splitter layout={layout.child2} />
            </div> :
            <ChatRoomCont />}
    </>)
}
