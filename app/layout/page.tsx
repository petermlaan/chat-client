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
            </div>
            <div className="flexcent">
                <span>Name:</span><input type="text" id="name" />
            </div>
            <textarea id="layout" defaultValue={JSON.stringify(lc.layout)} />
            <div className="flexcent">
                <button onClick={onSave}>Create</button>
                <button onClick={onSave}>Update</button>
                <button>Delete</button>
                <button>Use</button>
            </div>
        </div>
    )
}