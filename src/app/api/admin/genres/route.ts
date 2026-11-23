import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/authz";

const schema = z.object({ name: z.string().trim().min(1).max(100), description: z.string().trim().max(500).optional().or(z.literal("")) });

export async function GET() {
  const { response } = await requireApiAdmin(); if (response) return response;
  const genres = await prisma.genre.findMany({ include: { _count: { select: { songs: true } } }, orderBy: { name: "asc" } });
  return NextResponse.json(genres);
}

export async function POST(request: Request) {
  const { response } = await requireApiAdmin(); if (response) return response;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Nama genre wajib diisi." }, { status: 400 });
  try {
    const genre = await prisma.genre.create({ data: { name: parsed.data.name, description: parsed.data.description || null } });
    return NextResponse.json({ genre }, { status: 201 });
  } catch { return NextResponse.json({ error: "Genre sudah ada atau tidak dapat dibuat." }, { status: 409 }); }
}
