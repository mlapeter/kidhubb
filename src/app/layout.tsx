import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "KidHubb — Publish & Play Games",
  description:
    "A place where kids can publish and play browser games. Make a game, share it with friends!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${pixelFont.variable} font-pixel bg-background text-foreground min-h-screen`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
