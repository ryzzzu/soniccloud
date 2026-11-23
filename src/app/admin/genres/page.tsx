import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminGenreManager } from "@/components/admin-genre-manager";
export const dynamic = "force-dynamic";
export default async function AdminGenresPage() {
  const session = await auth(); if (!session?.user?.id) redirect("/login"); if (session.user.role !== "ADMIN") redirect("/");
  const genres = await prisma.genre.findMany({ include: { _count: { select: { songs: true } } }, orderBy: { name: "asc" } });
  return <><h1 className="page-title">Kelola genre</h1><p className="page-subtitle">Tambah dan hapus kategori musik. Genre yang masih digunakan tidak dapat dihapus.</p><div className="panel"><AdminGenreManager initialGenres={genres}/></div></>;
}
