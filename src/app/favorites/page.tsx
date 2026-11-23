import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SongGrid } from "@/components/song-grid";
export const dynamic = "force-dynamic";
export default async function FavoritesPage() {
  const session = await auth(); if (!session?.user?.id) redirect("/login");
  const rows = await prisma.favorite.findMany({ where: { userId: session.user.id, song: { status: "PUBLISHED" } }, include: { song: { include: { genre: true } } }, orderBy: { createdAt: "desc" } });
  const songs = rows.map((row) => ({ id: row.song.id, title: row.song.title, artist: row.song.artist, album: row.song.album, durationSeconds: row.song.durationSeconds, genre: { name: row.song.genre.name }, isFavorite: true }));
  return <><h1 className="page-title">Lagu favorit</h1><p className="page-subtitle">Semua lagu yang kamu simpan.</p><SongGrid songs={songs} empty="Kamu belum menyimpan lagu favorit."/></>;
}
