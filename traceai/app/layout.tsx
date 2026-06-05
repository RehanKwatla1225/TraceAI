import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TraceAI - Missing Person Recovery & Intelligence Network",
  description:
    "AI-powered platform that helps families, citizens, and authorities collaborate to locate missing persons faster.",
  keywords: [
    "missing persons",
    "AI matching",
    "search and rescue",
    "community reporting",
  ],
};

import { QueryProvider } from "@/lib/query-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
