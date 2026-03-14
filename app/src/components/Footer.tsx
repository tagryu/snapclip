import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-card-border px-4 py-10 mt-20 bg-surface">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent font-bold text-lg">SnapClip</span>
            <span className="text-xs text-muted">AI 상품 영상 자동 생성 서비스</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              이용약관
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              개인정보처리방침
            </Link>
            <a href="mailto:support@snapclip.app" className="hover:text-foreground transition-colors">
              문의하기
            </a>
          </div>
        </div>
        <div className="mt-6 text-center text-xs text-muted">
          © {new Date().getFullYear()} SnapClip. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
