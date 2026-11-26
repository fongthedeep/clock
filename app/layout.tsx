
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DARK TIME | Digital Clock",
  description: "เว็บไซต์นาฬิกาดิจิทัลและเครื่องมือจัดการเวลา",
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
