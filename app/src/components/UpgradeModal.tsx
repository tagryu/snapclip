"use client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  creditsUsed?: number;
  creditsLimit?: number;
}

export default function UpgradeModal({ isOpen, onClose, creditsUsed = 0, creditsLimit = 0 }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95">
        {/* Close */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 mb-4 shadow-lg">
            <span className="text-3xl">💎</span>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">크레딧이 부족해요</h2>
          <p className="text-gray-600">
            크레딧을 충전하고 더 많은 영상을 만들어보세요!
          </p>
        </div>

        {/* Current Status */}
        <div className="bg-gradient-to-r from-orange-50 via-pink-50 to-purple-50 rounded-xl p-4 mb-6 border border-pink-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">보유 크레딧</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              {creditsLimit}
            </span>
          </div>
          <div className="text-xs text-gray-500 text-center">
            영상을 만들려면 최소 1크레딧이 필요합니다
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <a
            href="/pricing"
            className="block w-full py-3 px-6 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white text-center font-semibold hover:opacity-90 transition-all shadow-md"
          >
            💎 크레딧 충전하기
          </a>
          <button
            onClick={onClose}
            className="block w-full py-3 px-6 rounded-xl border border-gray-300 text-gray-700 text-center font-semibold hover:bg-gray-50 transition-all"
          >
            나중에
          </button>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-6 pt-6 border-t border-gray-200">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            안전한 결제
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            TossPayments
          </span>
        </div>
      </div>
    </div>
  );
}
