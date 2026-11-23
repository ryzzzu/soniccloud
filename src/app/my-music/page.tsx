import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MySongsManager } from "@/components/my-songs-manager";
export const dynamic = "force-dynamic";
export default async function MyMusicPage() {
  const session = await auth(); if (!session?.user?.id) redirect("/login");
  const songs = await prisma.song.findMany({ where: { ownerId: session.user.id }, orderBy: { createdAt: "desc" }, select: { id: true, title: true, artist: true, status: true, createdAt: true, rejectionReason: true } });
  return <><h1 className="page-title">Musik saya</h1><p className="page-subtitle">Kelola unggahan musik dan status moderasinya.</p><div className="panel"><MySongsManager songs={songs.map((song) => ({ ...song, createdAt: song.createdAt.toISOString() }))}/></div></>;
}
