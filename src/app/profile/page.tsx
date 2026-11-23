import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
export const dynamic = "force-dynamic";
export default async function ProfilePage() {
  const session = await auth(); if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } }); if (!user) redirect("/login");
  const [songs, playlists, favorites] = await Promise.all([prisma.song.count({ where: { ownerId: user.id } }), prisma.playlist.count({ where: { userId: user.id } }), prisma.favorite.count({ where: { userId: user.id } })]);
  return <><h1 className="page-title">Profil saya</h1><p className="page-subtitle">Informasi akun SonicCloud.</p><div className="panel"><div className="flex items-center gap-4 mb-6"><div className="avatar" style={{width:58,height:58,fontSize:22}}>{user.displayName.slice(0,1).toUpperCase()}</div><div><h2 className="text-lg font-bold">{user.displayName}</h2><p className="text-xs text-muted">{user.email}</p></div></div><div className="table-scroll"><table className="simple-table"><tbody><tr><th>Peran</th><td>{user.role}</td></tr><tr><th>Status akun</th><td>{user.isActive ? "Aktif" : "Nonaktif"}</td></tr><tr><th>Bergabung</th><td>{formatDate(user.createdAt)}</td></tr><tr><th>Lagu diunggah</th><td>{songs}</td></tr><tr><th>Playlist</th><td>{playlists}</td></tr><tr><th>Favorit</th><td>{favorites}</td></tr></tbody></table></div></div></>;
}
