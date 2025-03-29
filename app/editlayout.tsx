"use client"
import { Split } from "@/lib/interfaces"
import { useLayoutContext } from "./layoutcontext"

export default function EditLayout() {
    const lc = useLayoutContext()
    
    function onSave() {
        const node = document.querySelector("#layout") as HTMLInputElement
        const str = node.value
        console.log(str)
        const layout = JSON.parse(str) as Split
        lc.setLayout(layout)
    }

    return (
        <div>
            <input type="text" id="layout" defaultValue={JSON.stringify(lc.layout)} />
            <button onClick={onSave}>Save</button>
        </div>
    )
}