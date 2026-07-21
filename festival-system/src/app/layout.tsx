import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation"; // 追加

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "学園祭注文管理システム",
  description: "模擬店用オーダーシステム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navigation /> {/* ここに追加 */}
        {children}
      </body>
    </html>
  );
}