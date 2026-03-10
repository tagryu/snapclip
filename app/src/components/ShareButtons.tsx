"use client";

import toast from "react-hot-toast";

interface Props {
  videoUrl?: string;
  title?: string;
}

export default function ShareButtons({ videoUrl, title = "SnapClip으로 만든 영상" }: Props) {
  const shareUrl = videoUrl || (typeof window !== "undefined" ? window.location.href : "");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("링크가 복사되었어요!");
    } catch {
      toast.error("복사에 실패했어요");
    }
  };

  const openInstagram = () => {
    // Instagram doesn't support direct share via URL; open app
    window.open("instagram://camera", "_blank");
    toast("인스타그램에서 영상을 업로드해주세요", { icon: "📸" });
  };

  const openTikTok = () => {
    window.open("https://www.tiktok.com/upload", "_blank");
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={copyLink}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-card-border text-foreground text-sm font-medium hover:bg-card-border/80 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
        링크 복사
      </button>
      <button
        onClick={openInstagram}
        className="flex items-center justify-center w-11 h-11 rounded-xl bg-card-border hover:bg-card-border/80 transition-colors"
        title="인스타그램"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      </button>
      <button
        onClick={openTikTok}
        className="flex items-center justify-center w-11 h-11 rounded-xl bg-card-border hover:bg-card-border/80 transition-colors"
        title="틱톡"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48v-7.15a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-.81-.04v2.65a8.16 8.16 0 01-4.77-1.52v7.15A6.34 6.34 0 016.49 15.2a6.34 6.34 0 013.86-5.84v3.5a2.89 2.89 0 00-.79-.1 2.89 2.89 0 00-2.89 2.89A2.89 2.89 0 009.56 18.5a2.89 2.89 0 002.88-2.5V2h3.45v.44a4.83 4.83 0 003.77 4.25z" />
        </svg>
      </button>
    </div>
  );
}
