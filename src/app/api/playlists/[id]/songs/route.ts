import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/authz";
import { SongStatus } from "@/generated/prisma/enums";

const schema = z.object({ songId: z.string().uuid() });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiUser();
  if (response) return response;
  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Lagu tidak valid." }, { status: 400 });
  const [playlist, song] = await Promise.all([
    prisma.playlist.findFirst({ where: { id, userId: user.id }, select: { id: true } }),
    prisma.song.findFirst({ where: { id: parsed.data.songId, status: SongStatus.PUBLISHED }, select: { id: true } }),
  ]);
  if (!playlist) return NextResponse.json({ error: "Playlist tidak ditemukan." }, { status: 404 });
  if (!song) return NextResponse.json({ error: "Lagu tidak tersedia." }, { status: 404 });
  const last = await prisma.playlistSong.aggregate({ where: { playlistId: id }, _max: { position: true } });
  await prisma.playlistSong.upsert({
    where: { playlistId_songId: { playlistId: id, songId: song.id } },
    update: {},
    create: { playlistId: id, songId: song.id, position: (last._max.position ?? 0) + 1 },
  });
  return NextResponse.json({ added: true });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiUser();
  if (response) return response;
  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Lagu tidak valid." }, { status: 400 });
  const playlist = await prisma.playlist.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!playlist) return NextResponse.json({ error: "Playlist tidak ditemukan." }, { status: 404 });
  await prisma.playlistSong.deleteMany({ where: { playlistId: id, songId: parsed.data.songId } });
  return NextResponse.json({ removed: true });
}
