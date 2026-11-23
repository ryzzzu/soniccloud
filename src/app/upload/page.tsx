import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UploadForm } from "@/components/upload-form";
export const dynamic = "force-dynamic";
export default async function UploadPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const genres = await prisma.genre.findMany({ orderBy: { name: "asc" } });
  const mySongs = await prisma.song.findMany({ where: { ownerId: session.user.id }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, title: true, status: true, createdAt: true, rejectionReason: true } });
  return <><h1 className="page-title">Upload musik</h1><p className="page-subtitle">Unggah musik yang kamu miliki atau yang telah mendapat izin penggunaan.</p><div className="panel"><h2 className="panel-title">Informasi lagu</h2><UploadForm genres={genres}/></div><div className="panel"><h2 className="panel-title">Unggahan saya</h2>{mySongs.length ? mySongs.map((song) => <div className="data-row" key={song.id}><div><b>{song.title}</b><p className="text-xs text-muted">{new Date(song.createdAt).toLocaleDateString("id-ID")}{song.rejectionReason ? ` · ${song.rejectionReason}` : ""}</p></div><span className="status-pill">{song.status}</span></div>) : <p className="muted-note">Belum ada lagu yang diunggah.</p>}</div></>;
}
