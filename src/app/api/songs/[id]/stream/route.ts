import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createReadUrl } from "@/lib/storage";
import { SongStatus } from "@/generated/prisma/enums";
import { auth } from "@/auth";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const song = await prisma.song.findUnique({ where: { id } });
    if (!song) return NextResponse.json({ error: "Lagu tidak ditemukan." }, { status: 404 });
    if (song.status !== SongStatus.PUBLISHED) {
      const session = await auth();
      const isOwner = session?.user?.id === song.ownerId;
      const isAdmin = session?.user?.role === "ADMIN";
      if (!isOwner && !isAdmin) return NextResponse.json({ error: "Lagu belum tersedia." }, { status: 404 });
    }
    const url = await createReadUrl(song.audioObjectKey, 3600);
    return NextResponse.redirect(url, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("STREAM_ERROR", error);
    return NextResponse.json({ error: "Audio tidak dapat dimuat." }, { status: 500 });
  }
}
