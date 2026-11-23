"use client";
import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { usePlayer } from "@/components/player-provider";
import { formatDuration } from "@/lib/format";

export function AudioPlayer() {
  const { current, isPlaying, toggle, currentTime, duration, seek } = usePlayer();
  if (!current) return null;
  return (
    <div className="player-bar">
      <div className="player-track">
        <div className="mini-cover">♫</div>
        <div className="min-w-0"><div className="truncate font-semibold">{current.title}</div><div className="truncate text-xs text-muted">{current.artist}</div></div>
      </div>
      <div className="player-controls">
        <div className="flex items-center gap-5">
          <button className="icon-button" aria-label="Sebelumnya"><SkipBack size={17}/></button>
          <button className="play-button" onClick={toggle} aria-label={isPlaying ? "Pause" : "Play"}>{isPlaying ? <Pause size={17} fill="currentColor"/> : <Play size={17} fill="currentColor"/>}</button>
          <button className="icon-button" aria-label="Berikutnya"><SkipForward size={17}/></button>
        </div>
        <div className="progress-row">
          <span>{formatDuration(currentTime)}</span>
          <input aria-label="Posisi lagu" type="range" min={0} max={Math.max(duration, 1)} value={Math.min(currentTime, duration || 0)} onChange={(e) => seek(Number(e.target.value))}/>
          <span>{formatDuration(duration || current.durationSeconds)}</span>
        </div>
      </div>
      <div className="player-volume"><Volume2 size={17}/><span className="text-xs text-muted">SonicCloud</span></div>
    </div>
  );
}
