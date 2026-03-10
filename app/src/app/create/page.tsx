"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import ProgressAnimation from "@/components/ProgressAnimation";
import UpgradeModal from "@/components/UpgradeModal";
import VideoPlayer from "@/components/VideoPlayer";
import ShareButtons from "@/components/ShareButtons";

const templates = [
  { id: "simple", name: "심플", desc: "깔끔하고 미니멀한 구성", emoji: "◻️", color: "from-slate-500 to-slate-700" },
  { id: "trendy", name: "트렌디", desc: "SNS에서 핫한 스타일", emoji: "🔥", color: "from-orange-500 to-red-500" },
  { id: "luxury", name: "고급", desc: "프리미엄 브랜드 감성", emoji: "💎", color: "from-amber-400 to-yellow-600" },
  { id: "cute", name: "귀여운", desc: "팬시하고 귀여운 무드", emoji: "🧸", color: "from-pink-400 to-rose-400" },
  { id: "dynamic", name: "다이나믹", desc: "강렬하고 역동적인 연출", emoji: "⚡", color: "from-purple-500 to-blue-500" },
];

const ratios = [
  { id: "9:16", label: "9:16", desc: "릴스/숏츠", w: 36, h: 64 },
  { id: "1:1", label: "1:1", desc: "피드", w: 48, h: 48 },
  { id: "16:9", label: "16:9", desc: "유튜브", w: 64, h: 36 },
];

export default function CreatePage() {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [tags, setTags] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("simple");
  const [selectedRatio, setSelectedRatio] = useState("9:16");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | undefined>();
  const [generatedCopy, setGeneratedCopy] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newImages = Array.from(files).slice(0, 5 - images.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages].slice(0, 5));
  }, [images.length]);

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleGenerate = async () => {
    if (images.length === 0) {
      toast.error("상품 이미지를 업로드해주세요");
      return;
    }
    if (!productName.trim()) {
      toast.error("상품명을 입력해주세요");
      return;
    }

    // TODO: Check credits from Supabase
    // const credits = await getUserCredits(userId);
    // if (credits.credits_used >= credits.credits_limit) {
    //   setShowUpgrade(true);
    //   return;
    // }

    setIsGenerating(true);
    try {
      // Convert images to base64 for API
      const imageData = await Promise.all(
        images.map(async (img) => {
          const reader = new FileReader();
          return new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(img.file);
          });
        })
      );

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          productPrice,
          productFeatures: tags.split(",").map((t) => t.trim()).filter(Boolean),
          images: imageData,
          template: selectedTemplate,
          aspectRatio: selectedRatio,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "영상 생성에 실패했습니다");
      }

      const data = await res.json();

      // Poll for status
      if (data.projectId) {
        let attempts = 0;
        const poll = setInterval(async () => {
          attempts++;
          try {
            const statusRes = await fetch(`/api/status/${data.projectId}`);
            const status = await statusRes.json();
            if (status.status === "completed") {
              clearInterval(poll);
              setGeneratedVideoUrl(status.outputUrl);
              setGeneratedCopy(status.copy || `"${productName}"의 특별함을 만나보세요. 지금 바로 확인하세요!`);
              setIsGenerating(false);
              setIsComplete(true);
              toast.success("영상이 완성되었어요! 🎉");
            } else if (status.status === "failed") {
              clearInterval(poll);
              throw new Error("영상 생성에 실패했습니다");
            }
            if (attempts > 120) {
              clearInterval(poll);
              throw new Error("시간이 초과되었습니다");
            }
          } catch (e) {
            clearInterval(poll);
            setIsGenerating(false);
            toast.error(e instanceof Error ? e.message : "오류가 발생했습니다");
          }
        }, 2000);
      } else {
        // Fallback: demo mode
        setTimeout(() => {
          setGeneratedCopy(`"${productName}"의 특별함을 만나보세요. 지금 바로 확인하세요!`);
          setIsGenerating(false);
          setIsComplete(true);
          toast.success("영상이 완성되었어요! 🎉");
        }, 5000);
      }
    } catch (error: any) {
      setIsGenerating(false);
      if (retryCount < 2) {
        toast.error(
          <div>
            <p>{error.message}</p>
            <button onClick={() => { setRetryCount((c) => c + 1); handleGenerate(); }} className="underline text-xs mt-1">
              다시 시도
            </button>
          </div>
        );
      } else {
        toast.error("여러 번 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  };

  const handleRegenerate = () => {
    setIsComplete(false);
    setGeneratedVideoUrl(undefined);
    setGeneratedCopy("");
    // Keep the form data so user can adjust and regenerate
  };

  if (isGenerating) {
    return <ProgressAnimation />;
  }

  if (isComplete) {
    return (
      <div className="min-h-screen px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-8 text-center">🎉 영상이 완성되었어요!</h1>

          <VideoPlayer src={generatedVideoUrl} watermark={true /* TODO: check plan */} />

          <div className="bg-card border border-card-border rounded-2xl p-6 my-6">
            <h3 className="text-sm font-medium text-muted mb-2">AI 생성 카피</h3>
            <p className="text-lg font-medium leading-relaxed">&ldquo;{generatedCopy}&rdquo;</p>
          </div>

          {/* Share */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted mb-3">공유하기</h3>
            <ShareButtons videoUrl={generatedVideoUrl} title={productName} />
          </div>

          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity">
              📥 다운로드
            </button>
            <button
              onClick={handleRegenerate}
              className="flex-1 py-3 rounded-xl bg-card-border text-foreground font-medium hover:bg-card-border/80 transition-colors"
            >
              🔄 다시 만들기
            </button>
          </div>
          <button
            onClick={() => { setIsComplete(false); setImages([]); setProductName(""); setProductPrice(""); setTags(""); }}
            className="w-full mt-3 py-3 rounded-xl border border-card-border text-muted text-sm font-medium hover:text-foreground hover:border-card-border/80 transition-colors"
          >
            처음부터 새로 만들기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">영상 만들기</h1>
        <p className="text-muted text-sm mb-8">상품 사진을 업로드하고 스타일을 선택하세요</p>

        {/* Image Upload */}
        <section className="mb-8">
          <h2 className="text-sm font-medium mb-3 text-muted">상품 이미지 (최대 5장)</h2>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
              dragOver ? "border-accent-purple bg-accent-purple/5" : "border-card-border hover:border-card-border/80"
            }`}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input id="file-input" type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            <div className="text-3xl mb-2">📷</div>
            <p className="text-sm text-muted">클릭하거나 이미지를 드래그하세요</p>
            <p className="text-xs text-muted/50 mt-1">JPG, PNG, WEBP (최대 10MB)</p>
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-card border border-card-border group">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Product Info */}
        <section className="mb-8">
          <h2 className="text-sm font-medium mb-3 text-muted">상품 정보</h2>
          <div className="space-y-3">
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="상품명 *"
              className="w-full px-4 py-3 rounded-xl bg-card border border-card-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent-purple transition-colors"
            />
            <input
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              placeholder="가격 (예: 29,900원)"
              className="w-full px-4 py-3 rounded-xl bg-card border border-card-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent-purple transition-colors"
            />
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="특징 태그 (예: 가볍다, 방수, 친환경)"
              className="w-full px-4 py-3 rounded-xl bg-card border border-card-border text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent-purple transition-colors"
            />
          </div>
        </section>

        {/* Template */}
        <section className="mb-8">
          <h2 className="text-sm font-medium mb-3 text-muted">템플릿 선택</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedTemplate === t.id
                    ? "border-accent-purple bg-accent-purple/10 shadow-lg shadow-purple-500/10"
                    : "border-card-border bg-card hover:border-card-border/80"
                }`}
              >
                <div className={`w-full aspect-[9/16] rounded-lg bg-gradient-to-br ${t.color} mb-2 flex items-center justify-center text-2xl`}>
                  {t.emoji}
                </div>
                <p className="text-xs font-medium">{t.name}</p>
                <p className="text-[10px] text-muted mt-0.5 hidden sm:block">{t.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Ratio */}
        <section className="mb-10">
          <h2 className="text-sm font-medium mb-3 text-muted">비율 선택</h2>
          <div className="flex gap-3">
            {ratios.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRatio(r.id)}
                className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                  selectedRatio === r.id
                    ? "border-accent-purple bg-accent-purple/10"
                    : "border-card-border bg-card hover:border-card-border/80"
                }`}
              >
                <div className="flex justify-center mb-2">
                  <div
                    className={`border-2 rounded ${selectedRatio === r.id ? "border-accent-purple" : "border-card-border"}`}
                    style={{ width: r.w * 0.5, height: r.h * 0.5 }}
                  />
                </div>
                <p className="text-sm font-medium">{r.label}</p>
                <p className="text-[10px] text-muted">{r.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Generate */}
        <button
          onClick={handleGenerate}
          disabled={images.length === 0}
          className="w-full py-4 rounded-xl gradient-bg text-white font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
        >
          ✨ 영상 만들기
        </button>

        <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
      </div>
    </div>
  );
}
