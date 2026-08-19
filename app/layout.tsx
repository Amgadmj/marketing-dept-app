import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Marketing Dept",
  description: "Um departamento de marketing para cada negócio, construído a partir do próprio cérebro de marca.",
};

/** Bare shell only — fonts and the CSS reset. App chrome (sidebar/top bar)
 *  lives in (app)/layout.tsx so routes like /welcome can opt out of it. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
