"use client";
import { useState } from "react";
type User = { id: string; email: string; displayName: string; role: string; isActive: boolean; createdAt: string; _count: { songs: number; playlists: number } };
export function AdminUserManager({ initialUsers, currentUserId }: { initialUsers: User[]; currentUserId: string }) {
  const [users, setUsers] = useState(initialUsers); const [error, setError] = useState(""); const [busyId, setBusyId] = useState("");
  async function toggle(user: User) {
    setBusyId(user.id); setError("");
    const response = await fetch(`/api/admin/users/${user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !user.isActive }) });
    const data = await response.json(); setBusyId("");
    if (!response.ok) { setError(data.error || "Gagal memperbarui pengguna."); return; }
    setUsers((items) => items.map((item) => item.id === user.id ? { ...item, isActive: !item.isActive } : item));
  }
  return <div>{error && <p className="form-error mb-3">{error}</p>}<div className="table-scroll"><table className="simple-table"><thead><tr><th>Pengguna</th><th>Peran</th><th>Status</th><th>Kontribusi</th><th>Aksi</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><b>{user.displayName}</b><br/><span className="text-muted">{user.email}</span></td><td>{user.role}</td><td>{user.isActive ? "Aktif" : "Nonaktif"}</td><td>{user._count.songs} lagu · {user._count.playlists} playlist</td><td>{user.role === "USER" && user.id !== currentUserId ? <button className="button button-outline button-small" disabled={busyId === user.id} onClick={() => toggle(user)}>{user.isActive ? "Nonaktifkan" : "Aktifkan"}</button> : "-"}</td></tr>)}</tbody></table></div></div>;
}
