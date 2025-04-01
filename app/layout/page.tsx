"use client"
import styles from "./page.module.css"
import { useGlobalContext } from "../../components/layoutcontext"
import { Layout, Split } from "@/lib/interfaces"
import { MouseEvent as ReactMouseEvent, SyntheticEvent, useState } from "react"
import { query, queryInput, queryTextArea } from "@/lib/util"

export default function LayoutPage() {
    function onSave() {
        const node = document.querySelector("#layout") as HTMLInputElement
        const str = node.value
        try {
            let layout;
            if (str)
                layout = JSON.parse(str) as Split
            //lc.setLayout(layout)
        } catch (err) {
            window.alert("Failed to parse layout string: " + str + " - Error: " + err)
        }
    }
    function onSelect(e: SyntheticEvent<HTMLSelectElement, Event>) {
        const sel = lc.layouts.layouts.find(l => +e.currentTarget.value === l.id)
        console.log("LayoutPage onSelect: ", sel)
        setSelLayout(sel ?? null)
        const nameNode = query("#name", e.currentTarget) as HTMLInputElement
        nameNode.value = sel?.name ?? ""
        const layoutNode = query("#layout", e.currentTarget) as HTMLTextAreaElement
        layoutNode.value = JSON.stringify(sel?.layout)
    }
    function onCreate(e: ReactMouseEvent<HTMLButtonElement, MouseEvent>) {
        const name = queryInput("#name", e.currentTarget)
        const layout = queryTextArea("#layout", e.currentTarget)
        if (name)
            lc.createLayout(name, layout)
    }
    function onPick(e: ReactMouseEvent<HTMLButtonElement, MouseEvent>) {
        console.log("onPick")
        lc.setLayout(selLayout?.id ?? null)
    }

    const lc = useGlobalContext()
    const [selLayout, setSelLayout] = useState<Layout | null>(null)

    return (
        <div className={styles.page}>
            <h2>Layout Editor</h2>
            <div className="flexcent">
                <select onChange={onSelect} onSelect={onSelect}>
                    <option>Layouts...</option>
                    {lc.layouts.layouts.map((l, i) => 
                        <option value={l.id} key={i}>{l.name}</option>
                    )}
                </select>
            </div>
            <div className="flexcent">
                <span>Name:</span>
                <input type="text" id="name" />
            </div>
            <textarea id="layout" />
            <div className="flexcent">
                <button onClick={onCreate}>Create</button>
                <button onClick={onSave}>Update</button>
                <button>Delete</button>
                <button onClick={onPick}>Select</button>
            </div>
        </div>
    )
}