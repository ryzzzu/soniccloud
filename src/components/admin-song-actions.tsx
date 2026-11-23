"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function AdminSongActions({ songId }: { songId: string }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function act(action: "approve" | "reject") {
    let reason: string | undefined;
    if (action === "reject") { reason = window.prompt("Alasan penolakan:") || "Tidak memenuhi ketentuan."; }
    setBusy(true); setError("");
    const response = await fetch(`/api/admin/songs/${songId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, reason }) });
    const data = await response.json(); setBusy(false);
    if (!response.ok) { setError(data.error || "Gagal memproses moderasi."); return; }
    router.refresh();
  }
  return <div className="flex flex-wrap items-center gap-2"><button className="button button-primary button-small" disabled={busy} onClick={() => act("approve")}>Setujui</button><button className="button button-outline button-small" disabled={busy} onClick={() => act("reject")}>Tolak</button>{error && <span className="form-error">{error}</span>}</div>;
}
