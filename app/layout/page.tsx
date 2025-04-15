"use client"
import styles from "./page.module.css"
import { useGlobalContext } from "../../components/globalcontext"
import { Layout, Split } from "@/lib/interfaces"
import { SyntheticEvent, useRef, useState } from "react"

export default function LayoutPage() {
    function onSave() {
        if (selLayout && nameRef.current?.value && layoutRef.current) {
            try {
                let split: Split | undefined = undefined
                if (layoutRef.current.value)
                    split = JSON.parse(layoutRef.current.value)
                if (split && !validateSplit(split))
                    window.alert("Failed to parse layout")
                const updatedLayout: Layout = { ...selLayout, split: split, name: nameRef.current.value }
                gc.saveLayout(updatedLayout)
                layoutRef.current.value = JSON.stringify(split)
            } catch (err) {
                window.alert("Failed to parse layout - Error: " + err)
            }
        }
    }
    function onSelect(e: SyntheticEvent<HTMLSelectElement, Event>) {
        // User selected a layout in the select element
        const sel = gc.layouts.find(l => +e.currentTarget.value === l.id)
        render(sel ?? null)
        setSelLayout(sel ?? null)
    }
    function onCreate() {
        if (nameRef.current && layoutRef.current) {
            gc.createLayout(nameRef.current.value, layoutRef.current.value)
            render(null)
        }
    }
    function onDelete() {
        if (selLayout && layoutsRef.current) {
            gc.deleteLayout(selLayout.id)
            layoutsRef.current.selectedIndex = 0
            render(null)
            if (gc.layout?.id === selLayout.id)
                setSelLayout(selLayout)
        }
    }
    function onReset() {
        if (window.confirm("Are you sure you want to DELETE ALL layouts and restore the default ones?")) {
            gc.resetDefaults()
            render(null)
        }
    }
    function render(selLayout: Layout | null) {
        const nameNode = document.querySelector("#name") as HTMLInputElement
        nameNode.value = selLayout?.name ?? ""
        const layoutNode = document.querySelector("#layout") as HTMLTextAreaElement
        layoutNode.value = selLayout ? JSON.stringify(selLayout?.split) : ""
    }
    function validateSplit(split: Split): boolean {
        if (split.vertical || split.percent || split.child1 || split.child2) {
            split.roomId = undefined
            if (!split.vertical || !split.percent)
                return false
            if (!split.child1)
                split.child1 = { roomId: 0}
            if (!split.child2)
                split.child2 = { roomId: 0}
            return validateSplit(split.child1) && validateSplit(split.child2)
        } else {
            if (!split.roomId)
                split.roomId = 0
            return true
        }
    }

    const gc = useGlobalContext()
    const [selLayout, setSelLayout] = useState<Layout | null>(null)
    const nameRef = useRef<HTMLInputElement | null>(null)
    const layoutRef = useRef<HTMLTextAreaElement | null>(null)
    const layoutsRef = useRef<HTMLSelectElement | null>(null)

    return (
        <div className={styles.page}>
            <h2>Layout Editor</h2>
            <div className="flexcent">
                <select ref={layoutsRef} onChange={onSelect} id="layouts">
                    <option>Layouts...</option>
                    {gc.layouts.map((l, i) =>
                        <option value={l.id} key={i}>{l.name}</option>
                    )}
                </select>
            </div>
            <div className="flexcent">
                <span>Name:</span>
                <input ref={nameRef} type="text" id="name" />
            </div>
            <textarea ref={layoutRef} id="layout" />
            <div className="flexcentwrap">
                <button onClick={onSave}>Save</button>
                <button onClick={onCreate}>Create</button>
                <button onClick={onDelete}>Delete</button>
                <button onClick={onReset}>Reset all</button>
            </div>
        </div>
    )
}