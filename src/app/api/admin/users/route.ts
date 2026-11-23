import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/authz";

export async function GET() {
  const { response } = await requireApiAdmin(); if (response) return response;
  const users = await prisma.user.findMany({ select: { id: true, email: true, displayName: true, role: true, isActive: true, createdAt: true, _count: { select: { songs: true, playlists: true } } }, orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json(users);
}
