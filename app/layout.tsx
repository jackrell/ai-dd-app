import React from "react";
import { ClerkProvider } from "@clerk/nextjs";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dataroom Chat Service",
  description: "Built on Next.js, based on PDF to Chat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <ClerkProvider>
      <body className={`${inter.className} antialiased`}>{children}</body>
      </ClerkProvider>
    </html>
  );
}
