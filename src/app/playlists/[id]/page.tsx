import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SongGrid } from "@/components/song-grid";
import { DeletePlaylistButton } from "@/components/delete-playlist-button";
export const dynamic = "force-dynamic";
export default async function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth(); if (!session?.user?.id) redirect("/login");
  const { id } = await params;
  const playlist = await prisma.playlist.findFirst({ where: { id, userId: session.user.id }, include: { songs: { include: { song: { include: { genre: true } } }, orderBy: { position: "asc" } } } });
  if (!playlist) notFound();
  const songs = playlist.songs.filter((item) => item.song.status === "PUBLISHED").map((item) => ({ id: item.song.id, title: item.song.title, artist: item.song.artist, album: item.song.album, durationSeconds: item.song.durationSeconds, genre: { name: item.song.genre.name } }));
  return <><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="page-title">{playlist.name}</h1><p className="page-subtitle">{playlist.description || "Playlist SonicCloud"} · {songs.length} lagu</p></div><DeletePlaylistButton id={playlist.id}/></div><SongGrid songs={songs} empty="Tambahkan lagu dari katalog menggunakan tombol playlist pada kartu lagu."/></>;
}
