import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { SongStatus } from "@/generated/prisma/enums";
import { requireApiAdmin } from "@/lib/authz";
import { moveObject } from "@/lib/storage";

const schema = z.object({ action: z.enum(["approve", "reject"]), reason: z.string().trim().max(1000).optional() });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiAdmin();
  if (response) return response;
  try {
    const { id } = await context.params;
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Permintaan moderasi tidak valid." }, { status: 400 });
    const song = await prisma.song.findUnique({ where: { id } });
    if (!song) return NextResponse.json({ error: "Lagu tidak ditemukan." }, { status: 404 });
    if (song.status !== SongStatus.PENDING) return NextResponse.json({ error: "Hanya lagu pending yang dapat dimoderasi." }, { status: 409 });

    if (parsed.data.action === "approve") {
      const extension = song.audioObjectKey.split(".").pop() || "mp3";
      const newKey = `published/${song.id}.${extension}`;
      await moveObject(song.audioObjectKey, newKey);
      try {
        const updated = await prisma.song.update({
          where: { id },
          data: { audioObjectKey: newKey, status: SongStatus.PUBLISHED, moderatedBy: user.id, moderatedAt: new Date(), publishedAt: new Date(), rejectionReason: null },
        });
        return NextResponse.json({ song: { id: updated.id, status: updated.status }, message: "Lagu berhasil dipublikasikan." });
      } catch (databaseError) {
        await moveObject(newKey, song.audioObjectKey).catch(() => undefined);
        throw databaseError;
      }
    }

    const updated = await prisma.song.update({
      where: { id },
      data: { status: SongStatus.REJECTED, moderatedBy: user.id, moderatedAt: new Date(), rejectionReason: parsed.data.reason || "Tidak memenuhi ketentuan." },
    });
    return NextResponse.json({ song: { id: updated.id, status: updated.status }, message: "Lagu ditolak." });
  } catch (error) {
    console.error("MODERATION_ERROR", error);
    return NextResponse.json({ error: "Moderasi gagal diproses." }, { status: 500 });
  }
}
