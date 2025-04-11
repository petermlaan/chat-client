import "server-only"
import type { Metadata } from "next"
import { Geist, Luxurious_Roman, Space_Mono } from "next/font/google"
import "./globals.css"
import { GlobalProvider } from "../components/globalcontext"
import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { dbGetChatRooms } from "@/lib/server/db"
import Navigation from "./navigation"
import Link from "next/link"
import Connection from "./connection"
import Fonts from "./fonts"

const luxuriousRoman = Luxurious_Roman({
  weight: "400",
  variable: "--font-luxurious-roman",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Chaticus Maximus",
  description: "More chats than Rome could handle",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${spaceMono.variable} ${luxuriousRoman.variable}`}>
          <GlobalProvider chatRooms={await dbGetChatRooms()}>
            <div className="page">
              <header className="banner">
                <Link href="/" prefetch={false}><h1 className="logo">Chaticus Maximus</h1></Link>
                <Navigation />
                <div className="user">
                  <Fonts />
                  <Connection />
                  <SignedOut>
                    <SignInButton />
                    <SignUpButton />
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
              </header>
              {children}
            </div>
          </GlobalProvider>
        </body>
      </html>
    </ClerkProvider >
  );
}
