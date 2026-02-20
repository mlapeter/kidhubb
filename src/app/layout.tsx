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
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎮</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${pixelFont.variable} font-pixel text-foreground min-h-screen`}
      >
        <Header />
        <div className="relative z-[1]">
          {children}
        </div>
      </body>
    </html>
  );
}
