"use client"
import { useGlobalContext } from "@/components/globalcontext"

export default function Fonts() {
    const gc = useGlobalContext()

    const fonts = [
        { name: "Geist", class: " font1" },
        { name: "Romano", class: " font2" },
        { name: "Space", class: " font3" },
    ]

    return (
        <div className="dropdown">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30"
                viewBox="0 0 20 20" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 7 4 4 20 4 20 7" />
                <line x1="9" x2="15" y1="20" y2="20" />
                <line x1="12" x2="12" y1="4" y2="20" />
            </svg>
            <div className="dropdown-content">
                {fonts.map((f, i) =>
                    <button onClick={(e) => gc.setFontClass(e.currentTarget.value)}
                        value={f.class} key={i}>{(gc.fontClass === f.class ? "* " : "") + f.name}</button>
                )}
            </div>
        </div>
    )
}
