import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminUserManager } from "@/components/admin-user-manager";
export const dynamic = "force-dynamic";
export default async function AdminUsersPage() {
  const session = await auth(); if (!session?.user?.id) redirect("/login"); if (session.user.role !== "ADMIN") redirect("/");
  const users = await prisma.user.findMany({ select: { id: true, email: true, displayName: true, role: true, isActive: true, createdAt: true, _count: { select: { songs: true, playlists: true } } }, orderBy: { createdAt: "desc" }, take: 200 });
  return <><h1 className="page-title">Kelola pengguna</h1><p className="page-subtitle">Pantau akun pengguna dan ubah status akun jika diperlukan.</p><div className="panel"><AdminUserManager initialUsers={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))} currentUserId={session.user.id}/></div></>;
}
