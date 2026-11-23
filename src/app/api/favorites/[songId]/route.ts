import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/authz";
import { SongStatus } from "@/generated/prisma/enums";

export async function POST(_request: Request, context: { params: Promise<{ songId: string }> }) {
  const { user, response } = await requireApiUser();
  if (response) return response;
  const { songId } = await context.params;
  const song = await prisma.song.findFirst({ where: { id: songId, status: SongStatus.PUBLISHED }, select: { id: true } });
  if (!song) return NextResponse.json({ error: "Lagu tidak ditemukan." }, { status: 404 });
  await prisma.favorite.upsert({ where: { userId_songId: { userId: user.id, songId } }, update: {}, create: { userId: user.id, songId } });
  return NextResponse.json({ favorited: true });
}

export async function DELETE(_request: Request, context: { params: Promise<{ songId: string }> }) {
  const { user, response } = await requireApiUser();
  if (response) return response;
  const { songId } = await context.params;
  await prisma.favorite.deleteMany({ where: { userId: user.id, songId } });
  return NextResponse.json({ favorited: false });
}
