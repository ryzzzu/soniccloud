import Link from "next/link";
import { RegisterForm } from "@/components/register-form";
export default function RegisterPage() {
  return <div className="auth-wrap"><div className="auth-brand">♫ Sonic<span className="brand-accent">Cloud</span></div><div className="auth-panel"><h1>Buat akun SonicCloud</h1><p>Daftar untuk mengunggah musik dan membangun koleksi pribadimu.</p><RegisterForm/><div className="auth-foot">Sudah punya akun? <Link href="/login">Masuk</Link></div></div></div>;
}
