"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName: form.get("displayName"), email: form.get("email"), password: form.get("password") }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Pendaftaran gagal.");
      router.push("/login?registered=1"); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Terjadi kesalahan."); }
    finally { setBusy(false); }
  }
  return <form className="form-stack" onSubmit={submit}><label>Nama tampilan<input name="displayName" required minLength={2} maxLength={100} placeholder="Nama kamu"/></label><label>Email<input name="email" type="email" required placeholder="nama@email.com"/></label><label>Password<input name="password" type="password" required minLength={8} placeholder="Minimal 8 karakter"/></label>{error && <p className="form-error">{error}</p>}<button className="button button-primary w-full" disabled={busy}>{busy ? "Membuat akun..." : "Buat akun"}</button></form>;
}
