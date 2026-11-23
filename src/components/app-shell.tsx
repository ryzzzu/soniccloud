import Link from "next/link";
import type { ReactNode } from "react";
import { auth } from "@/auth";
import { AudioPlayer } from "@/components/audio-player";
import { Home, Search, Heart, ListMusic, History, Upload, Shield, LogIn, Library } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

export async function AppShell({ children }: { children: ReactNode }) {
  const session = await auth();
  const user = session?.user?.id ? session.user : null;
  const links = [
    { href: "/", label: "Beranda", icon: Home },
    { href: "/search", label: "Cari Musik", icon: Search },
    { href: "/playlists", label: "Playlist", icon: ListMusic },
    { href: "/favorites", label: "Favorit", icon: Heart },
    { href: "/history", label: "Riwayat", icon: History },
    { href: "/upload", label: "Upload Musik", icon: Upload },
    { href: "/my-music", label: "Musik Saya", icon: Library },
  ];
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <Link href="/" className="brand"><span className="brand-mark">♫</span><span>Sonic<span className="brand-accent">Cloud</span></span></Link>
        <div className="sidebar-label">MENU UTAMA</div>
        <nav className="sidebar-nav">{links.map(({ href, label, icon: Icon }) => <Link href={href} key={href}><Icon size={18}/><span>{label}</span></Link>)}</nav>
        {user?.role === "ADMIN" && <><div className="sidebar-label">ADMINISTRASI</div><nav className="sidebar-nav"><Link href="/admin"><Shield size={18}/><span>Dashboard Admin</span></Link></nav></>}
        <div className="sidebar-bottom">
          {user ? <><Link href="/profile" className="profile-chip"><span className="avatar">{(user.name || user.email || "U").slice(0,1).toUpperCase()}</span><span className="min-w-0"><b className="block truncate">{user.name || "Pengguna"}</b><small>{user.role === "ADMIN" ? "Administrator" : "Pengguna"}</small></span></Link><SignOutButton/></> : <Link href="/login" className="login-link"><LogIn size={17}/> Masuk / Daftar</Link>}
        </div>
      </aside>
      <main className="main-area"><header className="topbar"><div><span className="eyebrow">YOUR MUSIC SPACE</span><div className="topbar-title">Temukan musik favoritmu</div></div><div className="topbar-actions"><Link href="/search" className="top-search"><Search size={17}/><span>Cari lagu, artis...</span></Link>{user ? <Link href="/profile" className="avatar">{(user.name || "U").slice(0,1).toUpperCase()}</Link> : <Link href="/login" className="button button-outline">Masuk</Link>}</div></header><div className="page-content">{children}</div><div className="bottom-spacer"/></main>
      <AudioPlayer/>
    </div>
  );
}
