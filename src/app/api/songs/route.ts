import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { SongStatus } from "@/generated/prisma/enums";
import { requireApiUser } from "@/lib/authz";
import { uploadObject, deleteObject } from "@/lib/storage";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const genreId = searchParams.get("genreId");
  const songs = await prisma.song.findMany({
    where: {
      status: SongStatus.PUBLISHED,
      ...(genreId ? { genreId } : {}),
      ...(q ? { OR: [
        { title: { contains: q, mode: "insensitive" } },
        { artist: { contains: q, mode: "insensitive" } },
        { album: { contains: q, mode: "insensitive" } },
      ] } : {}),
    },
    include: { genre: true, owner: { select: { displayName: true } } },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 60,
  });
  return NextResponse.json(songs.map((song) => ({
    id: song.id, title: song.title, artist: song.artist, album: song.album,
    durationSeconds: song.durationSeconds, status: song.status,
    genre: song.genre.name, createdAt: song.createdAt,
  })));
}

export async function POST(request: Request) {
  const { user, response } = await requireApiUser();
  if (response) return response;
  let audioKey: string | null = null;
  let coverKey: string | null = null;
  try {
    const form = await request.formData();
    const audio = form.get("audio");
    const cover = form.get("cover");
    const title = String(form.get("title") || "").trim();
    const artist = String(form.get("artist") || "").trim();
    const album = String(form.get("album") || "").trim();
    const genreId = String(form.get("genreId") || "");
    const durationSeconds = Number(form.get("durationSeconds"));

    if (!(audio instanceof File) || audio.size === 0) return NextResponse.json({ error: "File MP3 wajib dipilih." }, { status: 400 });
    if (audio.size > 20 * 1024 * 1024) return NextResponse.json({ error: "Ukuran MP3 maksimal 20 MB." }, { status: 400 });
    if (!audio.name.toLowerCase().endsWith(".mp3") || audio.type !== "audio/mpeg") return NextResponse.json({ error: "Format audio harus MP3 (audio/mpeg)." }, { status: 400 });
    if (title.length < 1 || title.length > 200 || artist.length < 1 || artist.length > 150) return NextResponse.json({ error: "Judul atau nama artis tidak valid." }, { status: 400 });
    if (!Number.isInteger(durationSeconds) || durationSeconds <= 0 || durationSeconds > 3600) return NextResponse.json({ error: "Durasi lagu tidak valid." }, { status: 400 });
    const genre = await prisma.genre.findUnique({ where: { id: genreId } });
    if (!genre) return NextResponse.json({ error: "Genre tidak ditemukan." }, { status: 400 });

    const id = randomUUID();
    audioKey = `pending/${user.id}/${id}.mp3`;
    const audioBuffer = Buffer.from(await audio.arrayBuffer());
    const hasMp3Header = audioBuffer.subarray(0, 3).toString() === "ID3" || (audioBuffer[0] === 0xff && (audioBuffer[1] & 0xe0) === 0xe0);
    if (!hasMp3Header) return NextResponse.json({ error: "Isi file tidak terdeteksi sebagai MP3 yang valid." }, { status: 400 });
    await uploadObject(audioKey, audioBuffer, "audio/mpeg");

    if (cover instanceof File && cover.size > 0) {
      if (cover.size > 5 * 1024 * 1024) throw new Error("Ukuran cover maksimal 5 MB.");
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(cover.type)) throw new Error("Cover harus JPG, PNG, atau WEBP.");
      const ext = cover.type === "image/png" ? "png" : cover.type === "image/webp" ? "webp" : "jpg";
      coverKey = `covers/${user.id}/${id}.${ext}`;
      await uploadObject(coverKey, Buffer.from(await cover.arrayBuffer()), cover.type);
    }

    const song = await prisma.song.create({
      data: {
        id, ownerId: user.id, genreId, title, artist, album: album || null,
        durationSeconds, audioObjectKey: audioKey, coverObjectKey: coverKey,
        audioMimeType: "audio/mpeg", audioSizeBytes: BigInt(audio.size), status: SongStatus.PENDING,
      },
      select: { id: true, title: true, status: true },
    });
    return NextResponse.json({ song, message: "Lagu berhasil diunggah dan menunggu moderasi." }, { status: 201 });
  } catch (error) {
    if (audioKey) await deleteObject(audioKey).catch(() => undefined);
    if (coverKey) await deleteObject(coverKey).catch(() => undefined);
    console.error("UPLOAD_ERROR", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload gagal." }, { status: 500 });
  }
}
