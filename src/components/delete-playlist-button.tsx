"use client";
import { useRouter } from "next/navigation";
export function DeletePlaylistButton({ id }: { id: string }) {
  const router = useRouter();
  async function remove() {
    if (!window.confirm("Hapus playlist ini?")) return;
    const response = await fetch(`/api/playlists/${id}`, { method: "DELETE" });
    if (response.ok) router.push("/playlists");
  }
  return <button className="button button-outline" onClick={remove}>Hapus playlist</button>;
}
