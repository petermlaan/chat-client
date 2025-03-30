"use client"
import { Split } from "@/lib/interfaces"
import { useLayoutContext } from "./layoutcontext"

export default function EditLayout() {
    const lc = useLayoutContext()

    function onSave() {
        const node = document.querySelector("#layout") as HTMLInputElement
        const str = node.value
        try {
            const layout = JSON.parse(str) as Split
            lc.setLayout(layout)
        } catch (err) {
            window.alert("Failed to parse layout string: " + str)
        }
    }

    return (<>
        <input type="text" id="layout" defaultValue={JSON.stringify(lc.layout)} />
        <button onClick={onSave}>Save</button>
    </>)
}