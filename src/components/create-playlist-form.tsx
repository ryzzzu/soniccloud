"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
export function CreatePlaylistForm() {
  const router = useRouter(); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; setBusy(true); setError(""); const form = new FormData(formElement);
    const response = await fetch("/api/playlists", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), description: form.get("description"), isPublic: form.get("isPublic") === "on" }) });
    const data = await response.json(); setBusy(false);
    if (!response.ok) { setError(data.error || "Gagal membuat playlist."); return; }
    formElement.reset(); router.refresh();
  }
  return <form className="inline-create-form" onSubmit={submit}><input name="name" required maxLength={150} placeholder="Nama playlist baru"/><input name="description" placeholder="Deskripsi (opsional)"/><label className="checkbox-label"><input type="checkbox" name="isPublic"/> Publik</label><button className="button button-primary" disabled={busy}>{busy ? "Menyimpan..." : "Buat playlist"}</button>{error && <span className="form-error">{error}</span>}</form>;
}
