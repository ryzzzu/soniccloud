"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";

type Track = { id: string; title: string; artist: string; durationSeconds: number };
type PlayerContextValue = {
  current: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  play: (track: Track) => void;
  toggle: () => void;
  seek: (value: number) => void;
  audioRef: RefObject<HTMLAudioElement | null>;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);
export function usePlayer() {
  const value = useContext(PlayerContext);
  if (!value) throw new Error("usePlayer must be used inside PlayerProvider");
  return value;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const lastSaved = useRef("");

  const saveHistory = useCallback((track: Track | null = current) => {
    const audio = audioRef.current;
    if (!track || !audio || audio.currentTime < 3 || lastSaved.current === track.id) return;
    lastSaved.current = track.id;
    fetch("/api/history", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songId: track.id, listenedSeconds: Math.floor(audio.currentTime) }),
    }).catch(() => undefined);
  }, [current]);

  const play = useCallback((track: Track) => {
    if (current && current.id !== track.id) saveHistory(current);
    lastSaved.current = "";
    setCurrent(track);
    setIsPlaying(true);
    setCurrentTime(0);
  }, [current, saveHistory]);

  useEffect(() => {
    if (!current || !audioRef.current) return;
    const audio = audioRef.current;
    audio.src = `/api/songs/${current.id}/stream`;
    audio.load();
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [current]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.paused) audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    else { saveHistory(current); audio.pause(); }
  }, [current, saveHistory]);

  const seek = useCallback((value: number) => {
    if (audioRef.current) audioRef.current.currentTime = value;
  }, []);

  return (
    <PlayerContext.Provider value={{ current, isPlaying, currentTime, duration, play, toggle, seek, audioRef }}>
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => { saveHistory(current); setIsPlaying(false); }}
      />
    </PlayerContext.Provider>
  );
}
