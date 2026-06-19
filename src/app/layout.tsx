import type { Metadata } from "next";
import "../index.css";

export const metadata: Metadata = {
  title: "Message Triage System - WhatsApp Government Dashboard",
  description: "WhatsApp Government Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
