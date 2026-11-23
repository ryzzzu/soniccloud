"use client";
import { useState } from "react";
import type { FormEvent } from "react";
type Genre = { id: string; name: string; description: string | null; _count: { songs: number } };
export function AdminGenreManager({ initialGenres }: { initialGenres: Genre[] }) {
  const [genres, setGenres] = useState(initialGenres); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); setBusy(true); setError("");
    const response = await fetch("/api/admin/genres", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: data.get("name"), description: data.get("description") }) });
    const result = await response.json(); setBusy(false);
    if (!response.ok) { setError(result.error || "Gagal menambah genre."); return; }
    form.reset(); setGenres((items) => [...items, { ...result.genre, _count: { songs: 0 } }].sort((a, b) => a.name.localeCompare(b.name)));
  }
  async function remove(id: string) {
    if (!window.confirm("Hapus genre ini?")) return;
    const response = await fetch(`/api/admin/genres/${id}`, { method: "DELETE" }); const result = await response.json();
    if (!response.ok) { setError(result.error || "Gagal menghapus genre."); return; }
    setGenres((items) => items.filter((item) => item.id !== id));
  }
  return <div className="space-y-5"><form className="inline-create-form" onSubmit={add}><input name="name" required maxLength={100} placeholder="Nama genre"/><input name="description" placeholder="Deskripsi singkat"/><button className="button button-primary" disabled={busy}>{busy ? "Menyimpan..." : "Tambah genre"}</button></form>{error && <p className="form-error">{error}</p>}<div className="table-scroll"><table className="simple-table"><thead><tr><th>Genre</th><th>Deskripsi</th><th>Jumlah lagu</th><th>Aksi</th></tr></thead><tbody>{genres.map((genre) => <tr key={genre.id}><td>{genre.name}</td><td>{genre.description || "-"}</td><td>{genre._count.songs}</td><td><button className="button button-outline button-small" onClick={() => remove(genre.id)}>Hapus</button></td></tr>)}</tbody></table></div></div>;
}
