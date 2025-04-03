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
        } catch (err) {
            window.alert("Failed to parse layout string: " + str + " - Error: " + err)
        }
    }
    function onSelect(e: SyntheticEvent<HTMLSelectElement, Event>) {
        const sel = gc.layouts.layouts.find(l => +e.currentTarget.value === l.id)
        console.log("LayoutPage onSelect: ", sel)
        render(sel ?? null)
        setSelLayout(sel ?? null)
    }
    function onCreate(e: ReactMouseEvent<HTMLButtonElement, MouseEvent>) {
        const name = queryInput("#name", e.currentTarget)
        const layout = queryTextArea("#layout", e.currentTarget)
        if (name) {
            gc.createLayout(name, layout)
            render(null)
        }
    }
    function onPick() {
        gc.setLayout(selLayout?.id ?? null)
    }
    function onDelete(e: ReactMouseEvent<HTMLButtonElement, MouseEvent>) {
        console.log("onDelete: ", selLayout)
        if (selLayout) {
            gc.deleteLayout(selLayout.id)
            const node = query("#layouts", e.currentTarget) as HTMLSelectElement
            node.selectedIndex = 0
            render(null)
            if (gc.layout?.id === selLayout.id)
                setSelLayout(selLayout)
        }
    }
    function onReset() {
        console.log("onReset")
        if (window.confirm("Are you sure you want to DELETE ALL layouts and restore the default ones?")) {
            gc.resetDefaults()
            render(null)
        }
    }
    function render(selLayout: Layout | null) {
        console.log("LayoutPage render: ", selLayout)
        const nameNode = document.querySelector("#name") as HTMLInputElement
        nameNode.value = selLayout?.name ?? ""
        const layoutNode = document.querySelector("#layout") as HTMLTextAreaElement
        layoutNode.value = selLayout ? JSON.stringify(selLayout?.layout) : ""
    }

    const gc = useGlobalContext()
    const [selLayout, setSelLayout] = useState<Layout | null>(null)

    return (
        <div className={styles.page}>
            <h2>Layout Editor</h2>
            <div className="flexcent">
                <select onChange={onSelect} id="layouts">
                    <option>Layouts...</option>
                    {gc.layouts.layouts.map((l, i) =>
                        <option value={l.id} key={i}>{l.name}</option>
                    )}
                </select>
            </div>
            <div className="flexcent">
                <span>Name:</span>
                <input type="text" id="name" />
            </div>
            <textarea id="layout" />
            <div className="flexcentwrap">
                <button onClick={onCreate}>Create</button>
                <button onClick={onSave}>Update</button>
                <button onClick={onDelete}>Delete</button>
                <button onClick={onPick}>Select</button>
                <button onClick={onReset}>Reset all</button>
            </div>
        </div>
    )
}