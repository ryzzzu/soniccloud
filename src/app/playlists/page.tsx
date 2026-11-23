import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreatePlaylistForm } from "@/components/create-playlist-form";
import { ListMusic } from "lucide-react";
export const dynamic = "force-dynamic";
export default async function PlaylistsPage() {
  const session = await auth(); if (!session?.user?.id) redirect("/login");
  const playlists = await prisma.playlist.findMany({ where: { userId: session.user.id }, include: { _count: { select: { songs: true } } }, orderBy: { updatedAt: "desc" } });
  return <><h1 className="page-title">Playlist saya</h1><p className="page-subtitle">Susun lagu favoritmu ke dalam koleksi pribadi.</p><div className="panel"><h2 className="panel-title">Buat playlist baru</h2><CreatePlaylistForm/></div><div className="section-heading"><div><h2>Koleksi playlist</h2><p>{playlists.length} playlist</p></div></div>{playlists.length ? <div className="playlist-list">{playlists.map((p) => <Link href={`/playlists/${p.id}`} className="playlist-tile" key={p.id}><div className="playlist-art"><ListMusic/></div><h3>{p.name}</h3><p>{p._count.songs} lagu · {p.isPublic ? "Publik" : "Privat"}</p></Link>)}</div> : <div className="empty-state"><div className="empty-icon">♫</div><h3>Belum ada playlist</h3><p>Buat playlist pertama untuk mulai mengatur musik.</p></div>}</>;
}
