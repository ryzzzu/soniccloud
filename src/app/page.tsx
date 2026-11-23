import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SongGrid } from "@/components/song-grid";
import { SongStatus } from "@/generated/prisma/enums";
import { Music2, Search } from "lucide-react";

export const dynamic = "force-dynamic";
export default async function HomePage() {
  const [songs, genres, totalSongs] = await Promise.all([
    prisma.song.findMany({ where: { status: SongStatus.PUBLISHED }, include: { genre: true }, orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }], take: 12 }),
    prisma.genre.findMany({ orderBy: { name: "asc" } }),
    prisma.song.count({ where: { status: SongStatus.PUBLISHED } }),
  ]);
  return <>
    <section className="hero"><div className="hero-content"><div className="hero-kicker">MUSIC WITHOUT LIMITS</div><h1>Temukan suara yang<br/>menemani harimu.</h1><p>Jelajahi musik, buat playlist, dan nikmati koleksi lagu dari satu ruang musik berbasis cloud.</p><Link href="/search" className="button button-primary mt-4"><Search size={16}/> Jelajahi musik</Link></div><div className="relative z-10 hidden md:block"><div className="mini-cover" style={{width:130,height:130,fontSize:65,borderRadius:25}}>♫</div></div></section>
    <div className="section-heading"><div><h2>Rilisan terbaru</h2><p>{totalSongs} lagu tersedia di SonicCloud</p></div><Link href="/search" className="text-xs font-bold text-violet-300">Lihat semua →</Link></div>
    <SongGrid songs={songs.map((song) => ({ id: song.id, title: song.title, artist: song.artist, album: song.album, durationSeconds: song.durationSeconds, genre: { name: song.genre.name } }))} empty="Belum ada lagu yang dipublikasikan. Lagu akan muncul setelah admin menyetujuinya."/>
    <div className="section-heading"><div><h2>Jelajahi genre</h2><p>Pilih kategori musik favoritmu</p></div></div>
    <div className="flex flex-wrap gap-2">{genres.map((genre) => <Link key={genre.id} href={`/search?genreId=${genre.id}`} className="button button-outline"><Music2 size={14}/>{genre.name}</Link>)}</div>
  </>;
}
