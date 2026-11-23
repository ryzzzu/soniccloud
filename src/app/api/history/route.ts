import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/authz";
import { SongStatus } from "@/generated/prisma/enums";

const schema = z.object({ songId: z.string().uuid(), listenedSeconds: z.number().int().min(0).max(86400) });

export async function GET() {
  const { user, response } = await requireApiUser();
  if (response) return response;
  const rows = await prisma.listeningHistory.findMany({
    where: { userId: user.id },
    include: { song: { include: { genre: true } } },
    orderBy: { listenedAt: "desc" },
    take: 100,
  });
  return NextResponse.json(rows.map((row) => ({
    id: row.id, listenedSeconds: row.listenedSeconds, listenedAt: row.listenedAt,
    song: { id: row.song.id, title: row.song.title, artist: row.song.artist, durationSeconds: row.song.durationSeconds, status: row.song.status, genre: row.song.genre.name },
  })));
}

export async function POST(request: Request) {
  const { user, response } = await requireApiUser();
  if (response) return response;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Data riwayat tidak valid." }, { status: 400 });
  const song = await prisma.song.findFirst({ where: { id: parsed.data.songId, status: SongStatus.PUBLISHED }, select: { id: true } });
  if (!song) return NextResponse.json({ error: "Lagu tidak tersedia." }, { status: 404 });
  await prisma.listeningHistory.create({ data: { userId: user.id, songId: song.id, listenedSeconds: parsed.data.listenedSeconds } });
  return NextResponse.json({ saved: true }, { status: 201 });
}
