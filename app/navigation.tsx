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
          {gc.layouts.layouts.map((l, i) =>
            <button onClick={onLayout} value={l.id} key={i}>{l.name}</button>
          )}
        </div>
      </div>
    </nav>
  )
}