import { SongCard } from "@/components/song-card";

type Song = { id: string; title: string; artist: string; album?: string | null; durationSeconds: number; genre?: { name: string } | string; isFavorite?: boolean };
export function SongGrid({ songs, empty = "Belum ada lagu yang tersedia." }: { songs: Song[]; empty?: string }) {
  if (!songs.length) return <div className="empty-state"><div className="empty-icon">♫</div><h3>Belum ada musik</h3><p>{empty}</p></div>;
  return <div className="song-grid">{songs.map((song) => <SongCard key={song.id} song={song}/>)}</div>;
}
