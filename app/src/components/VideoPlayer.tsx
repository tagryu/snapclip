"use client";

import { useRef, useState, useEffect } from "react";

interface Props {
  src?: string;
  poster?: string;
  watermark?: boolean;
}

export default function VideoPlayer({ src, poster, watermark = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      setCurrentTime(v.currentTime);
      setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
    };
    const onMeta = () => setDuration(v.duration);
    const onEnd = () => setPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("ended", onEnd);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = () => {
    if (!videoRef.current || !src) return;
    if (playing) videoRef.current.pause();
    else videoRef.current.play();
    setPlaying(!playing);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * duration;
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black group">
      {src ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full aspect-[9/16] max-h-[500px] object-contain mx-auto"
          playsInline
        />
      ) : (
        <div className="w-full aspect-[9/16] max-h-[500px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">▶️</div>
            <p className="text-muted text-sm">미리보기 영상</p>
          </div>
        </div>
      )}

      {/* Watermark overlay */}
      {watermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white/20 text-4xl font-bold rotate-[-30deg] select-none">SnapClip</span>
        </div>
      )}

      {/* Play button overlay */}
      {src && !playing && (
        <button
          onClick={toggle}
          className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}

      {/* Controls */}
      {src && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Progress bar */}
          <div className="h-1 bg-white/20 rounded-full cursor-pointer mb-2" onClick={seek}>
            <div className="h-full gradient-bg rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <button onClick={toggle} className="text-white">
              {playing ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <span className="text-xs text-white/70">{fmt(currentTime)} / {fmt(duration)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
