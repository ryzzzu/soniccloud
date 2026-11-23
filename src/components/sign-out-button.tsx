"use client";
import { signOut } from "next-auth/react";
export function SignOutButton() {
  return <button className="sidebar-signout" onClick={() => signOut({ callbackUrl: "/" })}>Keluar</button>;
}
