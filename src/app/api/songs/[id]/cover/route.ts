import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createReadUrl } from "@/lib/storage";
import { SongStatus } from "@/generated/prisma/enums";
import { auth } from "@/auth";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const song = await prisma.song.findUnique({ where: { id } });
    if (!song?.coverObjectKey) return new Response(null, { status: 404 });
    if (song.status !== SongStatus.PUBLISHED) {
      const session = await auth();
      if (session?.user?.id !== song.ownerId && session?.user?.role !== "ADMIN") return new Response(null, { status: 404 });
    }
    return NextResponse.redirect(await createReadUrl(song.coverObjectKey, 3600), { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (error) {
    console.error("COVER_ERROR", error);
    return new Response(null, { status: 500 });
  }
}
