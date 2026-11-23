import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/authz";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiAdmin(); if (response) return response;
  const { id } = await context.params;
  const parsed = z.object({ isActive: z.boolean() }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Status pengguna tidak valid." }, { status: 400 });
  if (id === user.id) return NextResponse.json({ error: "Admin tidak dapat menonaktifkan akunnya sendiri." }, { status: 400 });
  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!target) return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
  if (target.role === "ADMIN") return NextResponse.json({ error: "Status akun administrator tidak dapat diubah dari halaman ini." }, { status: 403 });
  await prisma.user.update({ where: { id }, data: { isActive: parsed.data.isActive } });
  return NextResponse.json({ updated: true });
}
