"use client"
import { useGlobalContext } from "@/components/globalcontext"

export default function FontSize() {
    const gc = useGlobalContext()

    const fontsizes = [
        { name: "8", class: " fontsize8" },
        { name: "10", class: " fontsize10" },
        { name: "12", class: " fontsize12" },
        { name: "14", class: " fontsize14" },
        { name: "16", class: " fontsize16" },
        { name: "18", class: " fontsize18" },
        { name: "20", class: " fontsize20" },
        { name: "22", class: " fontsize22" },
        { name: "24", class: " fontsize24" },
    ]

    return (
        <div className="dropdown">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" 
            viewBox="0 0 24 10" fill="none" stroke="currentColor" strokeWidth="2" 
            strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 14h-5" />
                <path d="M16 16v-3.5a2.5 2.5 0 0 1 5 0V16" />
                <path d="M4.5 13h6" />
                <path d="m3 16 4.5-9 4.5 9" />
            </svg>
            <div className="dropdown-content">
                {fontsizes.map((f, i) =>
                    <button onClick={(e) => gc.setSettings({fontSizeClass: e.currentTarget.value})}
                        value={f.class} key={i}>{(gc.settings.fontSizeClass === f.class ? "* " : "") + f.name}</button>
                )}
            </div>
        </div>
    )
}
