import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Aura - AI KPOP Idol Social Platform",
  description: "Create and interact with virtual KPOP idols.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#000000] text-white flex justify-center w-full min-h-screen`}
      >
        <div className="w-full relative md:max-w-md min-h-screen bg-aura-surface border-x border-aura-outline shadow-2xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-16 relative">
            {children}
          </div>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
