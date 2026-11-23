"use client";
import { useState } from "react";
import { Heart, ListPlus, Play } from "lucide-react";
import { usePlayer } from "@/components/player-provider";
import { formatDuration } from "@/lib/format";

type Song = { id: string; title: string; artist: string; album?: string | null; durationSeconds: number; genre?: { name: string } | string; isFavorite?: boolean };

export function SongCard({ song }: { song: Song }) {
  const { play } = usePlayer();
  const [favorite, setFavorite] = useState(Boolean(song.isFavorite));
  const [busy, setBusy] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [playlists, setPlaylists] = useState<{ id: string; name: string }[]>([]);
  const [message, setMessage] = useState("");

  async function toggleFavorite() {
    setBusy(true);
    try {
      const response = await fetch(`/api/favorites/${song.id}`, { method: favorite ? "DELETE" : "POST" });
      if (response.status === 401) { setMessage("Login untuk menyimpan favorit."); return; }
      if (!response.ok) throw new Error("Tidak dapat memperbarui favorit.");
      setFavorite(!favorite);
      setMessage(favorite ? "Dihapus dari favorit" : "Ditambahkan ke favorit");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Terjadi kesalahan."); }
    finally { setBusy(false); }
  }

  async function loadPlaylists() {
    setShowPlaylists((v) => !v);
    if (playlists.length) return;
    const response = await fetch("/api/playlists");
    if (response.status === 401) { setMessage("Login untuk menggunakan playlist."); return; }
    if (response.ok) setPlaylists(await response.json());
  }

  async function addToPlaylist(playlistId: string) {
    const response = await fetch(`/api/playlists/${playlistId}/songs`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ songId: song.id }),
    });
    setMessage(response.ok ? "Lagu ditambahkan ke playlist." : "Gagal menambahkan lagu.");
    setShowPlaylists(false);
  }

  const genreName = typeof song.genre === "string" ? song.genre : song.genre?.name;
  return (
    <article className="song-card">
      <button className="cover-button" onClick={() => play(song)} aria-label={`Putar ${song.title}`}>
        <img src={`/api/songs/${song.id}/cover`} alt="" className="song-cover" onError={(e) => { e.currentTarget.style.display = "none"; }}/>
        <span className="cover-fallback">♫</span>
        <span className="cover-play"><Play size={20} fill="currentColor"/></span>
      </button>
      <div className="song-card-info">
        <div className="min-w-0"><h3 className="truncate font-semibold">{song.title}</h3><p className="truncate text-sm text-muted">{song.artist}</p></div>
        <div className="song-meta"><span>{genreName || "Music"}</span><span>{formatDuration(song.durationSeconds)}</span></div>
        <div className="song-actions">
          <button className={`small-action ${favorite ? "active" : ""}`} onClick={toggleFavorite} disabled={busy} title="Favorit"><Heart size={16} fill={favorite ? "currentColor" : "none"}/></button>
          <div className="relative"><button className="small-action" onClick={loadPlaylists} title="Tambah ke playlist"><ListPlus size={17}/></button>
            {showPlaylists && <div className="playlist-popover">{playlists.length ? playlists.map((p) => <button key={p.id} onClick={() => addToPlaylist(p.id)}>{p.name}</button>) : <span className="text-xs text-muted">Belum ada playlist</span>}</div>}
          </div>
        </div>
        {message && <p className="text-xs text-muted">{message}</p>}
      </div>
    </article>
  );
}
