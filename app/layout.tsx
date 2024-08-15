import "@/styles/globals.css";
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';

const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
})


export const metadata: Metadata = {
  title: "Dataroom Chat Service",
  description: "Built on Next.js, based on PDF to Chat by Hassan El Mghari",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${archivo.className} antialiased`}>
      <ClerkProvider>
      <body>
        <Analytics />
        {children}
      </body>
      </ClerkProvider>
    </html>
  );
}
