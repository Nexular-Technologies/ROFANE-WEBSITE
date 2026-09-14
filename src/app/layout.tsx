import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

// The only React-rendered pages are the blog admin tools; keep them out of search.
export const metadata: Metadata = {
  title: "Rofane Consulting Admin",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
