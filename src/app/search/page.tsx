import { prisma } from "@/lib/prisma";
import { SongGrid } from "@/components/song-grid";
import { SongStatus } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ q?: string; genreId?: string }> };
export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q?.trim();
  const genreId = params.genreId;
  const [songs, genres] = await Promise.all([
    prisma.song.findMany({ where: { status: SongStatus.PUBLISHED, ...(genreId ? { genreId } : {}), ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { artist: { contains: q, mode: "insensitive" } }, { album: { contains: q, mode: "insensitive" } }] } : {}) }, include: { genre: true }, orderBy: { publishedAt: "desc" }, take: 60 }),
    prisma.genre.findMany({ orderBy: { name: "asc" } }),
  ]);
  return <><h1 className="page-title">Cari musik</h1><p className="page-subtitle">Temukan lagu berdasarkan judul, artis, album, atau genre.</p><form className="panel flex flex-wrap gap-3" action="/search"><input name="q" defaultValue={q} placeholder="Cari judul lagu atau artis..." className="min-w-[220px] flex-1 rounded-lg border border-[#30374a] bg-[#0d121e] px-4 py-3 text-sm outline-none"/><select name="genreId" defaultValue={genreId || ""} className="rounded-lg border border-[#30374a] bg-[#0d121e] px-3 py-3 text-sm"><option value="">Semua genre</option>{genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select><button className="button button-primary">Cari</button></form><div className="section-heading"><div><h2>Hasil pencarian</h2><p>{songs.length} lagu ditemukan</p></div></div><SongGrid songs={songs.map((song) => ({ id: song.id, title: song.title, artist: song.artist, album: song.album, durationSeconds: song.durationSeconds, genre: { name: song.genre.name } }))} empty="Tidak ada lagu yang sesuai dengan pencarian."/></>;
}
