import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "@/components/Toast";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: {
    default: "SnapClip - AI 상품 영상 자동 생성",
    template: "%s | SnapClip",
  },
  description: "상품 사진 한 장이면, 15초 숏폼 광고가 나온다. AI가 만드는 프로급 상품 영상 — 사진 업로드부터 완성까지 단 30초.",
  keywords: ["AI 영상", "숏폼", "상품 영상", "자동 영상 생성", "쇼핑몰", "인스타그램 릴스", "틱톡"],
  openGraph: {
    title: "SnapClip - AI 상품 영상 자동 생성",
    description: "상품 사진 한 장이면, 15초 숏폼 광고가 나온다",
    url: "https://snapclip.app",
    siteName: "SnapClip",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "SnapClip" }],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SnapClip - AI 상품 영상 자동 생성",
    description: "상품 사진 한 장이면, 15초 숏폼 광고가 나온다",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://snapclip.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
      </head>
      <body className="antialiased bg-background text-foreground min-h-screen">
        <AuthProvider>
          <NavBar />
          <main className="pt-14">
            {children}
          </main>
          <Footer />
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
