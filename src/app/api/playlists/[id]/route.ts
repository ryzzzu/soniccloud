import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/authz";
import { playlistSchema } from "@/lib/validators";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiUser();
  if (response) return response;
  const { id } = await context.params;
  const parsed = playlistSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Data playlist tidak valid." }, { status: 400 });
  const result = await prisma.playlist.updateMany({
    where: { id, userId: user.id },
    data: { name: parsed.data.name, description: parsed.data.description || null, isPublic: parsed.data.isPublic ?? false },
  });
  if (!result.count) return NextResponse.json({ error: "Playlist tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ updated: true });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiUser();
  if (response) return response;
  const { id } = await context.params;
  const result = await prisma.playlist.deleteMany({ where: { id, userId: user.id } });
  if (!result.count) return NextResponse.json({ error: "Playlist tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
