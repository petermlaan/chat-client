import type { Metadata } from "next";
import { Geist, Geist_Mono, Luxurious_Roman } from "next/font/google";
import "./globals.css";
import EditLayout from "./editlayout";
import { LayoutProvider } from "./layoutcontext";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { dbGetChatRooms } from "@/lib/server/db";
import Navigation from "./navigation";

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
          <LayoutProvider chatRooms={await dbGetChatRooms()}>
            <div className="page">
              <header className="banner">
                <h1 className="logo">Chaticus Maximus</h1>
                <Navigation />
                <div className="user">
                  <EditLayout />
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
          </LayoutProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
