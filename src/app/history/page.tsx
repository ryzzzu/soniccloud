import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SongGrid } from "@/components/song-grid";
export const dynamic = "force-dynamic";
export default async function HistoryPage() {
  const session = await auth(); if (!session?.user?.id) redirect("/login");
  const rows = await prisma.listeningHistory.findMany({ where: { userId: session.user.id, song: { status: "PUBLISHED" } }, include: { song: { include: { genre: true } } }, orderBy: { listenedAt: "desc" }, take: 50 });
  const seen = new Set<string>();
  const songs = rows.filter((row) => { if (seen.has(row.songId)) return false; seen.add(row.songId); return true; }).map((row) => ({ id: row.song.id, title: row.song.title, artist: row.song.artist, album: row.song.album, durationSeconds: row.song.durationSeconds, genre: { name: row.song.genre.name } }));
  return <><h1 className="page-title">Riwayat pemutaran</h1><p className="page-subtitle">Lagu yang terakhir kamu dengarkan.</p><SongGrid songs={songs} empty="Belum ada riwayat pemutaran."/></>;
}
