import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SongStatus } from "@/generated/prisma/enums";
import { AdminSongActions } from "@/components/admin-song-actions";
import { formatDate, formatBytes } from "@/lib/format";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const session = await auth(); if (!session?.user?.id) redirect("/login"); if (session.user.role !== "ADMIN") redirect("/");
  const [pending, totalSongs, totalUsers, totalStorage] = await Promise.all([
    prisma.song.findMany({ where: { status: SongStatus.PENDING }, include: { owner: { select: { displayName: true, email: true } }, genre: true }, orderBy: { createdAt: "asc" } }),
    prisma.song.count(), prisma.user.count(), prisma.song.aggregate({ _sum: { audioSizeBytes: true } }),
  ]);
  return <><h1 className="page-title">Dashboard administrator</h1><p className="page-subtitle">Kelola unggahan dan moderasi musik SonicCloud.</p><div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-7"><div className="panel"><p className="text-xs text-muted">Total lagu</p><b className="text-2xl">{totalSongs}</b></div><div className="panel"><p className="text-xs text-muted">Total pengguna</p><b className="text-2xl">{totalUsers}</b></div><div className="panel"><p className="text-xs text-muted">Total ukuran audio</p><b className="text-2xl">{formatBytes(totalStorage._sum.audioSizeBytes || 0n)}</b></div></div><div className="flex flex-wrap gap-2 mb-5"><Link href="/admin/genres" className="button button-outline">Kelola genre</Link><Link href="/admin/users" className="button button-outline">Kelola pengguna</Link></div><div className="panel"><div className="flex items-center justify-between mb-4"><h2 className="panel-title mb-0">Menunggu moderasi</h2><span className="status-pill">{pending.length} pending</span></div>{pending.length ? pending.map((song) => <div className="admin-song" key={song.id}><div className="mini-cover">♫</div><div className="min-w-0"><b className="block truncate">{song.title}</b><p className="text-xs text-muted truncate">{song.artist} · {song.genre.name}</p><p className="text-xs text-muted">Pengunggah: {song.owner.displayName} · {formatDate(song.createdAt)}</p></div><AdminSongActions songId={song.id}/></div>) : <p className="muted-note">Tidak ada lagu yang menunggu moderasi.</p>}</div></>;
}
