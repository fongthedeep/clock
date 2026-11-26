
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DARK TIME | Digital Clock",
  description:
    "เว็บไซต์นาฬิกาดิจิทัล นาฬิกาปลุก จับเวลา นับถอยหลัง และนาฬิกาโลก",
  keywords: [
    "DARK TIME",
    "Digital Clock",
    "World Clock",
    "Next.js",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
