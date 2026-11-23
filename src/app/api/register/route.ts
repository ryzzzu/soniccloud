import { NextResponse } from "next/server";
import { hash } from "argon2";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Periksa kembali data pendaftaran." }, { status: 400 });
    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    const user = await prisma.user.create({
      data: {
        email,
        displayName: parsed.data.displayName,
        passwordHash: await hash(parsed.data.password),
        role: "USER",
      },
      select: { id: true, email: true, displayName: true },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("REGISTER_ERROR", error);
    return NextResponse.json({ error: "Pendaftaran gagal diproses." }, { status: 500 });
  }
}
