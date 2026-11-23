import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
export default function LoginPage() {
  return <div className="auth-wrap"><div className="auth-brand">♫ Sonic<span className="brand-accent">Cloud</span></div><div className="auth-panel"><h1>Selamat datang kembali</h1><p>Masuk untuk mengelola musik dan koleksi favoritmu.</p><Suspense fallback={<div className="muted-note">Memuat formulir...</div>}><LoginForm/></Suspense><div className="auth-foot">Belum punya akun? <Link href="/register">Daftar sekarang</Link></div></div></div>;
}
