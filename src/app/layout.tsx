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
      <body className="antialiased text-[#f0f6fc] bg-primary font-geo">
        {children}
      </body>
    </html>
  );
}
