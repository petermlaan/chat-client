import type { Metadata } from "next";
import { Geist, Geist_Mono, Luxurious_Roman } from "next/font/google";
import "./globals.css";
import EditLayout from "./editlayout";
import { LayoutProvider } from "./layoutcontext";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} ${luxuriousRoman.variable}`}>
          <LayoutProvider>
            <div className="page">
              <header className="banner">
                <h1 className="logo">Chaticus Maximus</h1>
                <EditLayout />
                <SignedOut>
                  <SignInButton />
                  <SignUpButton />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </header>
              {children}
            </div>
          </LayoutProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
