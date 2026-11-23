import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/authz";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { response } = await requireApiAdmin(); if (response) return response;
  const { id } = await context.params;
  try {
    const result = await prisma.genre.deleteMany({ where: { id } });
    if (!result.count) return NextResponse.json({ error: "Genre tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch { return NextResponse.json({ error: "Genre masih digunakan oleh lagu dan tidak dapat dihapus." }, { status: 409 }); }
}
