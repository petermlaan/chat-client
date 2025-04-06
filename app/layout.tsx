import "server-only"
import type { Metadata } from "next";
import { Geist, Geist_Mono, Luxurious_Roman } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "../components/globalcontext";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { dbGetChatRooms } from "@/lib/server/db";
import Navigation from "./navigation";
import Link from "next/link";

const luxuriousRoman = Luxurious_Roman({
  weight: "400",
  variable: "--font-luxurious-roman",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        <body className={`${geistSans.variable} ${geistMono.variable} ${luxuriousRoman.variable}`}>
          <GlobalProvider chatRooms={await dbGetChatRooms()}>
            <div className="page">
              <header className="banner">
                <Link href="/" prefetch={false}><h1 className="logo">Chaticus Maximus</h1></Link>
                <Navigation />
                <div className="user">
{/*         <button onClick={onBtnConnect} className="imgbtn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                viewBox="0 0 24 24" fill="none" strokeWidth="2"
                stroke={cc.isConnected ? "yellow" : "grey"}
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
            </svg>
        </button> */}
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
    </ClerkProvider>
  );
}
