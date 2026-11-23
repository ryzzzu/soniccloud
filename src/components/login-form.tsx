"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", { email: form.get("email"), password: form.get("password"), redirect: false });
    setBusy(false);
    if (result?.error) { setError("Email atau password tidak sesuai."); return; }
    router.push("/"); router.refresh();
  }
  return <form className="form-stack" onSubmit={submit}>{params.get("registered") === "1" && <p className="form-success">Akun berhasil dibuat. Silakan masuk.</p>}<label>Email<input name="email" type="email" required placeholder="nama@email.com"/></label><label>Password<input name="password" type="password" required placeholder="Password kamu"/></label>{error && <p className="form-error">{error}</p>}<button className="button button-primary w-full" disabled={busy}>{busy ? "Memeriksa..." : "Masuk ke SonicCloud"}</button></form>;
}
