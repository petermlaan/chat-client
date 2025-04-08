"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useGlobalContext } from "@/components/globalcontext"

export default function Navigation() {
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
            <button onClick={(e) => gc.setLayout(+e.currentTarget.value)} 
              value={l.id} key={i}>{(gc.layout?.id === l.id ? "* " : "") + l.name}</button>
          )}
        </div>
      </div>
    </nav>
  )
}
