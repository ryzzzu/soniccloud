import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { PlayerProvider } from "@/components/player-provider";

export const metadata: Metadata = {
  title: "SonicCloud | Your Music Space",
  description: "Platform streaming musik berbasis cloud.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="id"><body><PlayerProvider><AppShell>{children}</AppShell></PlayerProvider></body></html>;
}
