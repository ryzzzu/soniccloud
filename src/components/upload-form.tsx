"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

type Genre = { id: string; name: string };
export function UploadForm({ genres }: { genres: Genre[] }) {
  const router = useRouter();
  const [duration, setDuration] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  function readDuration(file?: File) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.onloadedmetadata = () => { setDuration(Math.floor(audio.duration)); URL.revokeObjectURL(url); };
    audio.onerror = () => URL.revokeObjectURL(url);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; setBusy(true); setMessage("");
    const form = new FormData(formElement);
    form.set("durationSeconds", String(duration));
    try {
      const response = await fetch("/api/songs", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload gagal.");
      setMessage(data.message); setError(false); formElement.reset(); setDuration(0); router.refresh();
    } catch (err) { setMessage(err instanceof Error ? err.message : "Upload gagal."); setError(true); }
    finally { setBusy(false); }
  }
  return <form className="form-stack" onSubmit={submit}><div className="form-grid"><label>Judul lagu<input name="title" required maxLength={200} placeholder="Judul lagu"/></label><label>Nama artis<input name="artist" required maxLength={150} placeholder="Nama artis"/></label><label>Album (opsional)<input name="album" maxLength={150} placeholder="Nama album"/></label><label>Genre<select name="genreId" required defaultValue=""><option value="" disabled>Pilih genre</option>{genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label></div><label>File audio MP3<input name="audio" type="file" accept="audio/mpeg,.mp3" required onChange={(e) => readDuration(e.target.files?.[0])}/><small>Maksimal 20 MB. Durasi terdeteksi: {duration ? `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2,"0")}` : "belum terdeteksi"}.</small></label><label>Cover lagu (opsional)<input name="cover" type="file" accept="image/jpeg,image/png,image/webp"/><small>JPG, PNG, atau WEBP. Maksimal 5 MB.</small></label><div className="notice">Lagu yang diunggah akan masuk status menunggu moderasi. Pastikan kamu memiliki hak atau izin untuk mengunggah musik tersebut.</div>{message && <p className={error ? "form-error" : "form-success"}>{message}</p>}<button className="button button-primary" disabled={busy || !duration}>{busy ? "Mengunggah..." : "Unggah lagu"}</button></form>;
}
