import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Predictify",
  description: "Prediction markets dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-mono antialiased text-[#f0f6fc]" style={{ backgroundColor: '#0d1117' }}>
        {children}
      </body>
    </html>
  );
}
