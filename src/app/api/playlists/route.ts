import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/authz";
import { playlistSchema } from "@/lib/validators";

export async function GET() {
  const { user, response } = await requireApiUser();
  if (response) return response;
  const playlists = await prisma.playlist.findMany({
    where: { userId: user.id },
    include: { _count: { select: { songs: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(playlists);
}

export async function POST(request: Request) {
  const { user, response } = await requireApiUser();
  if (response) return response;
  const parsed = playlistSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Nama playlist wajib diisi." }, { status: 400 });
  const playlist = await prisma.playlist.create({
    data: { userId: user.id, name: parsed.data.name, description: parsed.data.description || null, isPublic: parsed.data.isPublic ?? false },
  });
  return NextResponse.json({ playlist }, { status: 201 });
}
