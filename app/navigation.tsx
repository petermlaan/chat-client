"use client"
import { useGlobalContext } from "@/components/globalcontext"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MouseEvent as ReactMouseEvent } from "react"

export default function Navigation() {
  function onLayout(e: ReactMouseEvent<HTMLButtonElement, MouseEvent>) {
    gc.setLayout(+e.currentTarget.value)
  }

  const gc = useGlobalContext()

  return (
    <nav className="nav">
      <Link href="/" prefetch={false} className={`nav-link ${usePathname() === '/' ? 'active' : ''}`}>
        Chat
      </Link>
      <div className="dropdown">
        <Link href="/layout" prefetch={false} className={`dropbtn nav-link ${usePathname() === '/layout' ? 'active' : ''}`}>
          Layout
        </Link>
        <div className="dropdown-content">
          {gc.layouts.map((l, i) =>
            <button onClick={onLayout} value={l.id} key={i}>{l.name}</button>
          )}
        </div>
      </div>
    </nav>
  )
}


{/*                   <button className="imgbtn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30"
                      viewBox="0 0 24 24" fill="none" strokeWidth="2"
                      stroke={gc.isConnected ? "yellow" : "grey"}
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
                    </svg>
                  </button> */}
