"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navigation() {
    return (
        <nav className="nav">
        <Link href="/" className={`nav-link ${usePathname() === '/' ? 'active' : ''}`}>
          Chat
        </Link>
        <Link href="/layout" className={`nav-link ${usePathname() === '/layout' ? 'active' : ''}`}>
          Layout
        </Link>
      </nav>
    )
}