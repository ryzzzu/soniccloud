import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/authz";
import { SongStatus } from "@/generated/prisma/enums";
import { deleteObject } from "@/lib/storage";

const updateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  artist: z.string().trim().min(1).max(150),
  album: z.string().trim().max(150).optional().or(z.literal("")),
  genreId: z.string().uuid(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiUser();
  if (response) return response;
  const { id } = await context.params;
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Data lagu tidak valid." }, { status: 400 });
  const song = await prisma.song.findFirst({ where: { id, ownerId: user.id } });
  if (!song) return NextResponse.json({ error: "Lagu tidak ditemukan." }, { status: 404 });
  if ( song.status !== SongStatus.PENDING &&
  song.status !== SongStatus.REJECTED) {
    return NextResponse.json({ error: "Lagu yang sudah dipublikasikan tidak dapat diedit pada versi pertama." }, { status: 409 });
  }
  const genre = await prisma.genre.findUnique({ where: { id: parsed.data.genreId }, select: { id: true } });
  if (!genre) return NextResponse.json({ error: "Genre tidak ditemukan." }, { status: 400 });
  await prisma.song.update({
    where: { id },
    data: { title: parsed.data.title, artist: parsed.data.artist, album: parsed.data.album || null, genreId: parsed.data.genreId, status: SongStatus.PENDING, rejectionReason: null, moderatedBy: null, moderatedAt: null, publishedAt: null },
  });
  return NextResponse.json({ updated: true, message: "Metadata diperbarui dan dikirim ulang untuk moderasi." });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiUser();
  if (response) return response;
  const { id } = await context.params;
  const song = await prisma.song.findFirst({ where: { id, ownerId: user.id } });
  if (!song) return NextResponse.json({ error: "Lagu tidak ditemukan." }, { status: 404 });
  await prisma.song.update({ where: { id }, data: { status: SongStatus.ARCHIVED } });
  await Promise.all([deleteObject(song.audioObjectKey).catch(() => undefined), song.coverObjectKey ? deleteObject(song.coverObjectKey).catch(() => undefined) : Promise.resolve()]);
  return NextResponse.json({ archived: true });
}
