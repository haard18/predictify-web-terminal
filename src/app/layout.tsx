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
      <body className="font-mono antialiased bg-primary text-white">
        {children}
      </body>
    </html>
  );
}
