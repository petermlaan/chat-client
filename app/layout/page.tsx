"use client"
import styles from "./page.module.css"
import { useLayoutContext } from "../layoutcontext"
import { Split } from "@/lib/interfaces"

export default function LayoutPage() {
    const lc = useLayoutContext()

    function onSave() {
        const node = document.querySelector("#layout") as HTMLInputElement
        const str = node.value
        try {
            let layout;
            if (str)
                layout = JSON.parse(str) as Split
            lc.setLayout(layout)
        } catch (err) {
            window.alert("Failed to parse layout string: " + str + " - Error: " + err)
        }
    }

    return (
        <div className={styles.page}>
            <h2>Layout Editor</h2>
            <div className="flexcent">
                <select>
                    <option>Layouts...</option>
                    <option>Layout 1</option>
                    <option>Layout 2</option>
                </select>
                <button>Select</button>
                <button>Delete</button>
            </div>
            <div className="flexcent">
                <span>Name:</span><input type="text" id="name" />
                <span>Layout:</span><input type="text" id="layout" defaultValue={JSON.stringify(lc.layout)} />
                <button onClick={onSave}>Create</button>
            </div>
        </div>
    )
}