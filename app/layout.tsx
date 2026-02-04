import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "System Health Evaluation Framework",
  description: "Evaluate whether systems are actually healthy using leading indicators and a failure learning loop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
