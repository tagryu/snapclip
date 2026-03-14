"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { getUserCredits } from "@/lib/credits";
import ProgressAnimation from "@/components/ProgressAnimation";
import UpgradeModal from "@/components/UpgradeModal";
import VideoPlayer from "@/components/VideoPlayer";
import ShareButtons from "@/components/ShareButtons";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const templates = [
  { id: "simple", name: "심플", desc: "깔끔하고 미니멀한 구성", emoji: "◻️", color: "from-slate-200 to-slate-300" },
  { id: "trendy", name: "트렌디", desc: "SNS에서 핫한 스타일", emoji: "🔥", color: "from-orange-200 to-red-200" },
  { id: "luxury", name: "고급", desc: "프리미엄 브랜드 감성", emoji: "💎", color: "from-amber-200 to-yellow-200" },
  { id: "cute", name: "귀여운", desc: "팬시하고 귀여운 무드", emoji: "🧸", color: "from-pink-200 to-rose-200" },
  { id: "dynamic", name: "다이나믹", desc: "강렬하고 역동적인 연출", emoji: "⚡", color: "from-purple-200 to-blue-200" },
];

const ratios = [
  { id: "9:16", label: "9:16", desc: "릴스/숏츠", w: 36, h: 64 },
  { id: "1:1", label: "1:1", desc: "피드", w: 48, h: 48 },
  { id: "16:9", label: "16:9", desc: "유튜브", w: 64, h: 36 },
];

export default function CreatePage() {
  const { user } = useAuth();
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [progressValue, setProgressValue] = useState(0);
  const [progressStage, setProgressStage] = useState("");

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) return "JPG, PNG, WEBP 파일만 업로드 가능합니다.";
    if (file.size > MAX_FILE_SIZE) return `${file.name}의 크기가 10MB를 초과합니다.`;
    return null;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const remaining = 5 - images.length;
    if (remaining <= 0) {
      toast.error("최대 5장까지 업로드할 수 있습니다.");
      return;
    }

    const validFiles: { file: File; preview: string }[] = [];
    Array.from(files).slice(0, remaining).forEach((file) => {
      const err = validateFile(file);
      if (err) {
        toast.error(err);
      } else {
        validFiles.push({ file, preview: URL.createObjectURL(file) });
      }
    });
    setImages((prev) => [...prev, ...validFiles].slice(0, 5));
    if (validFiles.length > 0) setErrors((e) => ({ ...e, images: "" }));
  }, [images.length]);

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (images.length === 0) newErrors.images = "상품 이미지를 업로드해주세요.";
    if (!productName.trim()) newErrors.productName = "상품명을 입력해주세요.";
    if (productName.trim().length > 50) newErrors.productName = "상품명은 50자 이내로 입력해주세요.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImagesToStorage = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const img of images) {
      const ext = img.file.name.split(".").pop() || "jpg";
      const path = `uploads/${user?.id || "anonymous"}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, img.file, { contentType: img.file.type });

      if (error) {
        console.warn("Storage upload failed, using base64 fallback:", error.message);
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(img.file);
        });
        urls.push(base64);
      } else {
        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
        urls.push(publicUrl);
      }
    }
    return urls;
  };

  const handleGenerate = async () => {
    if (!validate()) return;

    if (user) {
      try {
        const credits = await getUserCredits(user.id);
        if (credits.credits_used >= credits.credits_limit) {
          setShowUpgrade(true);
          return;
        }
      } catch {
        // Continue anyway
      }
    }

    setIsGenerating(true);
    try {
      const imageUrls = await uploadImagesToStorage();

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user ? {} : {}),
        },
        body: JSON.stringify({
          productName,
          productPrice,
          productFeatures: tags.split(",").map((t) => t.trim()).filter(Boolean),
          images: imageUrls,
          template: selectedTemplate,
          aspectRatio: selectedRatio,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "영상 생성에 실패했습니다");
      }

      const data = await res.json();

      if (data.projectId) {
        let attempts = 0;
        const poll = setInterval(async () => {
          attempts++;
          try {
            const statusRes = await fetch(`/api/status/${data.projectId}`);
            const status = await statusRes.json();
            if (status.progress !== undefined) setProgressValue(status.progress);
            if (status.stage) setProgressStage(status.stage);

            if (status.status === "completed") {
              clearInterval(poll);
              setProgressValue(100);
              setGeneratedVideoUrl(status.outputUrl);
              setGeneratedCopy(status.copy || `"${productName}"의 특별함을 만나보세요. 지금 바로 확인하세요!`);
              setIsGenerating(false);
              setIsComplete(true);
              toast.success("영상이 완성되었어요! 🎉");
            } else if (status.status === "failed") {
              clearInterval(poll);
              throw new Error(status.error || "영상 생성에 실패했습니다");
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
        setTimeout(() => {
          setGeneratedCopy(`"${productName}"의 특별함을 만나보세요. 지금 바로 확인하세요!`);
          setIsGenerating(false);
          setIsComplete(true);
          toast.success("영상이 완성되었어요! 🎉");
        }, 5000);
      }
    } catch (error: unknown) {
      setIsGenerating(false);
      const message = error instanceof Error ? error.message : "오류가 발생했습니다";
      if (retryCount < 2) {
        toast.error(message);
        setRetryCount((c) => c + 1);
      } else {
        toast.error("여러 번 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  };

  const handleRegenerate = () => {
    setIsComplete(false);
    setGeneratedVideoUrl(undefined);
    setGeneratedCopy("");
  };

  if (isGenerating) {
    return <ProgressAnimation currentStage={progressStage} progress={progressValue > 0 ? progressValue : undefined} />;
  }

  if (isComplete) {
    return (
      <div className="min-h-screen px-4 py-10 bg-surface">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-8 text-center text-foreground">🎉 영상이 완성되었어요!</h1>

          <VideoPlayer src={generatedVideoUrl} watermark={!user} />

          <div className="bg-white border border-card-border rounded-2xl p-6 my-6">
            <h3 className="text-sm font-medium text-muted mb-2">AI 생성 카피</h3>
            <p className="text-lg font-medium leading-relaxed text-foreground">&ldquo;{generatedCopy}&rdquo;</p>
            <button
              onClick={() => { navigator.clipboard.writeText(generatedCopy); toast.success("카피가 복사되었습니다!"); }}
              className="mt-3 text-xs text-ig-blue hover:underline"
            >
              📋 카피 복사하기
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted mb-3">공유하기</h3>
            <ShareButtons videoUrl={generatedVideoUrl} title={productName} />
          </div>

          <div className="flex gap-3">
            <a
              href={generatedVideoUrl}
              download={`${productName || 'snapclip'}_video.mp4`}
              className="flex-1 py-3 rounded-xl bg-ig-blue text-white font-semibold hover:bg-ig-blue/90 transition-colors text-center"
            >
              📥 다운로드
            </a>
            <button
              onClick={handleRegenerate}
              className="flex-1 py-3 rounded-xl bg-surface border border-card-border text-foreground font-semibold hover:bg-card-border/30 transition-colors"
            >
              🔄 다시 만들기
            </button>
          </div>
          <button
            onClick={() => { setIsComplete(false); setImages([]); setProductName(""); setProductPrice(""); setTags(""); }}
            className="w-full mt-3 py-3 rounded-xl border border-card-border text-muted text-sm font-medium hover:text-foreground hover:bg-surface transition-colors"
          >
            처음부터 새로 만들기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-surface">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-foreground">영상 만들기</h1>
        <p className="text-muted text-sm mb-8">상품 사진을 업로드하고 스타일을 선택하세요</p>

        {!user && (
          <div className="mb-6 p-4 rounded-xl bg-ig-blue/5 border border-ig-blue/20 text-sm">
            <a href="/login" className="text-ig-blue font-semibold hover:underline">로그인</a>하면 생성한 영상을 저장하고 관리할 수 있어요.
          </div>
        )}

        {/* Image Upload */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold mb-3 text-foreground">
            상품 이미지 (최대 5장) <span className="text-red-500">*</span>
          </h2>
          <div
            role="button"
            tabIndex={0}
            aria-label="이미지 업로드 영역"
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") document.getElementById("file-input")?.click(); }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer bg-white ${
              errors.images ? "border-red-400 bg-red-50" :
              dragOver ? "border-ig-blue bg-ig-blue/5" : "border-card-border hover:border-ig-blue/50"
            }`}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              aria-label="이미지 파일 선택"
            />
            <div className="text-3xl mb-2">📷</div>
            <p className="text-sm text-foreground font-medium">클릭하거나 이미지를 드래그하세요</p>
            <p className="text-xs text-muted mt-1">JPG, PNG, WEBP (최대 10MB)</p>
          </div>
          {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-surface border border-card-border group">
                  <img src={img.preview} alt={`상품 이미지 ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    aria-label={`이미지 ${i + 1} 삭제`}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
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
          <h2 className="text-sm font-semibold mb-3 text-foreground">상품 정보</h2>
          <div className="space-y-3">
            <div>
              <input
                value={productName}
                onChange={(e) => { setProductName(e.target.value); setErrors((err) => ({ ...err, productName: "" })); }}
                placeholder="상품명 *"
                maxLength={50}
                aria-label="상품명"
                aria-invalid={!!errors.productName}
                className={`w-full px-4 py-3 rounded-xl bg-white border text-foreground placeholder:text-muted focus:outline-none focus:border-ig-blue focus:ring-1 focus:ring-ig-blue/20 transition-colors ${
                  errors.productName ? "border-red-400" : "border-card-border"
                }`}
              />
              {errors.productName && <p className="text-red-500 text-xs mt-1">{errors.productName}</p>}
            </div>
            <input
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              placeholder="가격 (예: 29,900원)"
              aria-label="가격"
              className="w-full px-4 py-3 rounded-xl bg-white border border-card-border text-foreground placeholder:text-muted focus:outline-none focus:border-ig-blue focus:ring-1 focus:ring-ig-blue/20 transition-colors"
            />
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="특징 태그 (예: 가볍다, 방수, 친환경)"
              aria-label="특징 태그"
              className="w-full px-4 py-3 rounded-xl bg-white border border-card-border text-foreground placeholder:text-muted focus:outline-none focus:border-ig-blue focus:ring-1 focus:ring-ig-blue/20 transition-colors"
            />
          </div>
        </section>

        {/* Template */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold mb-3 text-foreground">템플릿 선택</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3" role="radiogroup" aria-label="템플릿">
            {templates.map((t) => (
              <button
                key={t.id}
                role="radio"
                aria-checked={selectedTemplate === t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedTemplate === t.id
                    ? "border-ig-blue bg-ig-blue/5 shadow-md"
                    : "border-card-border bg-white hover:border-ig-blue/30"
                }`}
              >
                <div className={`w-full aspect-[9/16] rounded-lg bg-gradient-to-br ${t.color} mb-2 flex items-center justify-center text-2xl`}>
                  {t.emoji}
                </div>
                <p className="text-xs font-semibold text-foreground">{t.name}</p>
                <p className="text-[10px] text-muted mt-0.5 hidden sm:block">{t.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Ratio */}
        <section className="mb-10">
          <h2 className="text-sm font-semibold mb-3 text-foreground">비율 선택</h2>
          <div className="flex gap-3" role="radiogroup" aria-label="영상 비율">
            {ratios.map((r) => (
              <button
                key={r.id}
                role="radio"
                aria-checked={selectedRatio === r.id}
                onClick={() => setSelectedRatio(r.id)}
                className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                  selectedRatio === r.id
                    ? "border-ig-blue bg-ig-blue/5"
                    : "border-card-border bg-white hover:border-ig-blue/30"
                }`}
              >
                <div className="flex justify-center mb-2">
                  <div
                    className={`border-2 rounded ${selectedRatio === r.id ? "border-ig-blue" : "border-card-border"}`}
                    style={{ width: r.w * 0.5, height: r.h * 0.5 }}
                  />
                </div>
                <p className="text-sm font-semibold text-foreground">{r.label}</p>
                <p className="text-[10px] text-muted">{r.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Generate */}
        <button
          onClick={handleGenerate}
          disabled={images.length === 0}
          className="w-full py-4 rounded-xl bg-ig-blue text-white font-semibold text-lg hover:bg-ig-blue/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-ig-blue/20 focus:outline-none focus:ring-2 focus:ring-ig-blue focus:ring-offset-2"
        >
          ✨ 영상 만들기
        </button>

        <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
      </div>
    </div>
  );
}
