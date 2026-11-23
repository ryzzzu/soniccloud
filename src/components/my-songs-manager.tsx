"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
type MySong = { id: string; title: string; artist: string; status: string; createdAt: string; rejectionReason: string | null };
export function MySongsManager({ songs }: { songs: MySong[] }) {
  const [items, setItems] = useState(songs); const [error, setError] = useState(""); const [busy, setBusy] = useState(""); const router = useRouter();
  async function archive(id: string) {
    if (!window.confirm("Arsipkan lagu ini? Lagu tidak akan muncul di katalog publik.")) return;
    setBusy(id); setError(""); const response = await fetch(`/api/songs/${id}`, { method: "DELETE" }); const data = await response.json(); setBusy("");
    if (!response.ok) { setError(data.error || "Gagal mengarsipkan lagu."); return; }
    setItems((rows) => rows.map((row) => row.id === id ? { ...row, status: "ARCHIVED" } : row)); router.refresh();
  }
  return <div>{error && <p className="form-error mb-3">{error}</p>}{items.length ? items.map((song) => <div className="data-row" key={song.id}><div className="min-w-0"><b>{song.title}</b><p className="text-xs text-muted">{song.artist} · {new Date(song.createdAt).toLocaleDateString("id-ID")}</p>{song.rejectionReason && <p className="text-xs text-rose-300">Alasan: {song.rejectionReason}</p>}</div><div className="flex items-center gap-2"><span className="status-pill">{song.status}</span>{song.status !== "ARCHIVED" && <button className="button button-outline button-small" disabled={busy === song.id} onClick={() => archive(song.id)}>Arsipkan</button>}</div></div>) : <p className="muted-note">Belum ada lagu yang diunggah.</p>}</div>;
}
