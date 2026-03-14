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
  { id: "simple", name: "심플", desc: "깔끔하고 미니멀한 구성", emoji: "◻️" },
  { id: "trendy", name: "트렌디", desc: "SNS에서 핫한 스타일", emoji: "🔥" },
  { id: "luxury", name: "고급", desc: "프리미엄 브랜드 감성", emoji: "💎" },
  { id: "cute", name: "귀여운", desc: "팬시하고 귀여운 무드", emoji: "🧸" },
  { id: "dynamic", name: "다이나믹", desc: "강렬하고 역동적인 연출", emoji: "⚡" },
];

const ratios = [
  { id: "9:16", label: "9:16", desc: "릴스/숏츠", icon: "📱", w: 36, h: 64 },
  { id: "1:1", label: "1:1", desc: "피드", icon: "🖼️", w: 48, h: 48 },
  { id: "16:9", label: "16:9", desc: "유튜브", icon: "🖥️", w: 64, h: 36 },
];

export default function CreatePage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
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
    if (validFiles.length > 0) {
      setErrors((e) => ({ ...e, images: "" }));
      if (currentStep === 1) setCurrentStep(2);
    }
  }, [images.length, currentStep]);

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
      <div className="min-h-screen px-4 py-12 bg-white">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 mb-6">
              <span className="text-4xl">🎉</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">영상이 완성되었어요!</h1>
            <p className="text-gray-600">이제 다운로드하고 공유하세요</p>
          </div>

          <VideoPlayer src={generatedVideoUrl} watermark={!user} />

          {/* AI Copy */}
          <div className="bg-white rounded-2xl p-6 my-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">✨ AI 생성 카피</span>
            </div>
            <p className="text-lg font-medium leading-relaxed text-gray-900 mb-4">&ldquo;{generatedCopy}&rdquo;</p>
            <button
              onClick={() => { navigator.clipboard.writeText(generatedCopy); toast.success("카피가 복사되었습니다!"); }}
              className="text-sm text-pink-600 hover:text-pink-700 transition-colors inline-flex items-center gap-1"
            >
              <span>📋</span> 카피 복사하기
            </button>
          </div>

          {/* Share */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">공유하기</h3>
            <ShareButtons videoUrl={generatedVideoUrl} title={productName} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-3">
            <a
              href={generatedVideoUrl}
              download={`${productName || 'snapclip'}_video.mp4`}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-all text-center inline-flex items-center justify-center gap-2 shadow-sm"
            >
              <span>📥</span> 다운로드
            </a>
            <button
              onClick={handleRegenerate}
              className="flex-1 py-4 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>🔄</span> 다시 만들기
            </button>
          </div>
          
          <button
            onClick={() => { setIsComplete(false); setImages([]); setProductName(""); setProductPrice(""); setTags(""); setCurrentStep(1); }}
            className="w-full py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 text-sm font-medium hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            처음부터 새로 만들기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
            영상 <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">만들기</span>
          </h1>
          <p className="text-gray-600">상품 사진을 업로드하고 스타일을 선택하세요</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all ${
                currentStep >= step 
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white" 
                  : "bg-white border border-gray-200 text-gray-400"
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-12 md:w-20 h-0.5 mx-1 transition-all ${
                  currentStep > step ? "bg-gradient-to-r from-pink-500 to-purple-600" : "bg-gray-200"
                }`} />
              )}
            </div>
          ))}
        </div>

        {!user && (
          <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 text-sm text-center">
            <a href="/login" className="text-pink-600 font-semibold hover:text-pink-700 transition-colors">로그인</a>
            <span className="text-gray-600">하면 생성한 영상을 저장하고 관리할 수 있어요</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Upload & Info */}
          <div className="space-y-6">
            {/* Step 1: Image Upload */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 text-pink-600 text-sm font-bold border border-pink-200">
                  1
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  상품 이미지 <span className="text-red-500">*</span>
                </h2>
              </div>
              
              <div
                role="button"
                tabIndex={0}
                aria-label="이미지 업로드 영역"
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") document.getElementById("file-input")?.click(); }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                  errors.images 
                    ? "border-red-300 bg-red-50" 
                    : dragOver 
                    ? "border-pink-500 bg-pink-50" 
                    : "border-gray-300 bg-white hover:border-pink-400"
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
                <div className="text-5xl mb-4">📷</div>
                <p className="text-gray-900 font-medium mb-2">클릭하거나 이미지를 드래그하세요</p>
                <p className="text-sm text-gray-500">JPG, PNG, WEBP (최대 10MB, 5장)</p>
              </div>
              
              {errors.images && <p className="text-red-500 text-sm mt-2">⚠️ {errors.images}</p>}
              
              {images.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-white border border-gray-200 group">
                      <img src={img.preview} alt={`상품 이미지 ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        aria-label={`이미지 ${i + 1} 삭제`}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-gray-900/70 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-gray-900"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Step 2: Product Info */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all border ${
                  currentStep >= 2 ? "bg-gradient-to-r from-pink-50 to-purple-50 text-pink-600 border-pink-200" : "bg-white text-gray-400 border-gray-200"
                }`}>
                  2
                </div>
                <h2 className="text-lg font-semibold text-gray-900">상품 정보</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <input
                    value={productName}
                    onChange={(e) => { setProductName(e.target.value); setErrors((err) => ({ ...err, productName: "" })); }}
                    onFocus={() => setCurrentStep(Math.max(currentStep, 2))}
                    placeholder="상품명 *"
                    maxLength={50}
                    aria-label="상품명"
                    aria-invalid={!!errors.productName}
                    className={`w-full px-4 py-3.5 rounded-xl bg-white border text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all ${
                      errors.productName ? "border-red-300" : "border-gray-200"
                    }`}
                  />
                  {errors.productName && <p className="text-red-500 text-sm mt-1">⚠️ {errors.productName}</p>}
                </div>
                
                <input
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="가격 (예: 29,900원)"
                  aria-label="가격"
                  className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all"
                />
                
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="특징 태그 (예: 가볍다, 방수, 친환경)"
                  aria-label="특징 태그"
                  className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all"
                />
              </div>
            </section>
          </div>

          {/* Right: Template & Ratio */}
          <div className="space-y-6">
            {/* Step 3: Template */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all border ${
                  currentStep >= 3 ? "bg-gradient-to-r from-pink-50 to-purple-50 text-pink-600 border-pink-200" : "bg-white text-gray-400 border-gray-200"
                }`}>
                  3
                </div>
                <h2 className="text-lg font-semibold text-gray-900">템플릿 & 비율</h2>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-6" role="radiogroup" aria-label="템플릿">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    role="radio"
                    aria-checked={selectedTemplate === t.id}
                    onClick={() => { setSelectedTemplate(t.id); setCurrentStep(Math.max(currentStep, 3)); }}
                    className={`p-3 rounded-xl text-center transition-all border ${
                      selectedTemplate === t.id
                        ? "bg-gradient-to-r from-pink-50 to-purple-50 border-pink-500 shadow-sm"
                        : "bg-white border-gray-200 hover:border-pink-300"
                    }`}
                  >
                    <div className={`w-full aspect-[9/16] rounded-lg bg-gray-100 mb-2 flex items-center justify-center text-2xl border ${
                      selectedTemplate === t.id ? "border-pink-200" : "border-gray-200"
                    }`}>
                      {t.emoji}
                    </div>
                    <p className="text-xs font-semibold text-gray-900">{t.name}</p>
                  </button>
                ))}
              </div>

              {/* Ratio */}
              <div className="flex gap-3" role="radiogroup" aria-label="영상 비율">
                {ratios.map((r) => (
                  <button
                    key={r.id}
                    role="radio"
                    aria-checked={selectedRatio === r.id}
                    onClick={() => setSelectedRatio(r.id)}
                    className={`flex-1 p-4 rounded-xl text-center transition-all border ${
                      selectedRatio === r.id
                        ? "bg-gradient-to-r from-pink-50 to-purple-50 border-pink-500"
                        : "bg-white border-gray-200 hover:border-pink-300"
                    }`}
                  >
                    <div className="flex justify-center mb-3">
                      <div
                        className={`border-2 rounded transition-all ${selectedRatio === r.id ? "border-pink-500" : "border-gray-300"}`}
                        style={{ width: r.w * 0.4, height: r.h * 0.4 }}
                      />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">{r.icon} {r.label}</p>
                    <p className="text-[10px] text-gray-500">{r.desc}</p>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-10">
          <button
            onClick={handleGenerate}
            disabled={images.length === 0}
            className="w-full py-5 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white font-bold text-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 inline-flex items-center justify-center gap-2 shadow-lg"
          >
            <span>✨</span>
            <span>영상 만들기</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
      </div>
    </div>
  );
}
