"use client";

import { useState, useEffect } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

interface CreditPackage {
  credits: number;
  price: number;
  pricePerCredit: number;
  discount: number;
  popular?: boolean;
}

const packages: CreditPackage[] = [
  {
    credits: 5,
    price: 15000,
    pricePerCredit: 3000,
    discount: 0,
  },
  {
    credits: 20,
    price: 50000,
    pricePerCredit: 2500,
    discount: 17,
    popular: true,
  },
  {
    credits: 50,
    price: 100000,
    pricePerCredit: 2000,
    discount: 33,
  },
];

export default function PricingPage() {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async (pkg: CreditPackage) => {
    setIsLoading(true);
    setSelectedPackage(pkg);

    try {
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const orderName = `${pkg.credits}크레딧 충전`;

      // Get payment widget and request payment
      const payment = tossPayments.payment({
        customerKey: `customer_${Date.now()}`,
      });
      
      await payment.requestPayment({
        method: "CARD",
        amount: {
          currency: "KRW",
          value: pkg.price,
        },
        orderId,
        orderName,
        successUrl: `${window.location.origin}/payments/success`,
        failUrl: `${window.location.origin}/payments/fail`,
        customerName: "SnapClip 사용자",
      });
    } catch (error) {
      console.error("결제 오류:", error);
      alert("결제 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
      setSelectedPackage(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="px-4 pt-20 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-600 shadow-sm">
            <span className="w-2 h-2 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-full" />
            크레딧 충전제
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6 text-balance text-gray-900">
            필요한 만큼만,
            <br />
            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              크레딧 충전
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto text-balance leading-relaxed">
            1크레딧 = 1영상
            <br />
            월정액 부담 없이, 필요할 때 충전해서 사용하세요
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.credits}
                className={`relative rounded-2xl p-8 transition-all ${
                  pkg.popular
                    ? "bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 text-white border-0 shadow-2xl md:scale-105 md:-mt-4 md:mb-4"
                    : "bg-white border-2 border-gray-200 hover:border-pink-300 hover:shadow-lg"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-4 py-2 text-xs font-bold rounded-full bg-white text-pink-600 shadow-md">
                    🔥 가장 인기
                  </div>
                )}
                
                {pkg.discount > 0 && (
                  <div className={`absolute top-6 right-6 px-3 py-1 text-xs font-bold rounded-full ${
                    pkg.popular 
                      ? "bg-white/20 text-white" 
                      : "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white"
                  }`}>
                    {pkg.discount}% 할인
                  </div>
                )}
                
                <div className="mb-8">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-5xl font-bold ${pkg.popular ? "text-white" : "text-gray-900"}`}>
                      {pkg.credits}
                    </span>
                    <span className={`text-2xl font-semibold ${pkg.popular ? "text-white/90" : "text-gray-600"}`}>
                      크레딧
                    </span>
                  </div>
                  <p className={`text-sm ${pkg.popular ? "text-white/80" : "text-gray-500"}`}>
                    = {pkg.credits}개 영상 생성
                  </p>
                </div>
                
                <div className="mb-8">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-3xl font-bold ${pkg.popular ? "text-white" : "text-gray-900"}`}>
                      ₩{pkg.price.toLocaleString()}
                    </span>
                  </div>
                  <p className={`text-sm ${pkg.popular ? "text-white/80" : "text-gray-600"}`}>
                    개당 ₩{pkg.pricePerCredit.toLocaleString()}
                  </p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className={`flex items-center gap-3 text-sm ${pkg.popular ? "text-white/95" : "text-gray-700"}`}>
                    <svg className={`w-5 h-5 shrink-0 ${pkg.popular ? "text-white" : "text-pink-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    워터마크 제거
                  </li>
                  <li className={`flex items-center gap-3 text-sm ${pkg.popular ? "text-white/95" : "text-gray-700"}`}>
                    <svg className={`w-5 h-5 shrink-0 ${pkg.popular ? "text-white" : "text-pink-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    1080p 고화질
                  </li>
                  <li className={`flex items-center gap-3 text-sm ${pkg.popular ? "text-white/95" : "text-gray-700"}`}>
                    <svg className={`w-5 h-5 shrink-0 ${pkg.popular ? "text-white" : "text-pink-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    모든 템플릿 사용
                  </li>
                  <li className={`flex items-center gap-3 text-sm ${pkg.popular ? "text-white/95" : "text-gray-700"}`}>
                    <svg className={`w-5 h-5 shrink-0 ${pkg.popular ? "text-white" : "text-pink-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    상업적 이용 가능
                  </li>
                </ul>
                
                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={isLoading && selectedPackage === pkg}
                  className={`w-full py-4 rounded-xl text-base font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    pkg.popular
                      ? "bg-white text-pink-600 hover:bg-pink-50 shadow-md"
                      : "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white hover:opacity-90 shadow-sm hover:shadow-md"
                  }`}
                >
                  {isLoading && selectedPackage === pkg ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      처리 중...
                    </span>
                  ) : (
                    "크레딧 충전하기"
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 md:py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              크레딧으로 이런 걸 할 수 있어요
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">AI 숏폼 영상 생성</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                상품 사진 한 장으로 15초 숏폼 광고 영상 제작
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">다양한 템플릿</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                패션, 뷰티, 전자제품 등 업종별 맞춤 템플릿
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">즉시 다운로드</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                생성 완료된 영상은 1080p로 바로 다운로드
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">자주 묻는 질문</h2>
          </div>
          
          <div className="space-y-4">
            <details className="group bg-gray-50 rounded-xl p-6 cursor-pointer border border-gray-200 hover:border-gray-300 transition-colors">
              <summary className="flex items-center justify-between font-semibold text-gray-900 list-none">
                <span>크레딧은 언제까지 사용할 수 있나요?</span>
                <span className="ml-4 text-gray-400 group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
              </summary>
              <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                충전한 크레딧은 유효기간이 없습니다. 언제든지 원하실 때 사용하실 수 있습니다.
              </p>
            </details>
            
            <details className="group bg-gray-50 rounded-xl p-6 cursor-pointer border border-gray-200 hover:border-gray-300 transition-colors">
              <summary className="flex items-center justify-between font-semibold text-gray-900 list-none">
                <span>환불이 가능한가요?</span>
                <span className="ml-4 text-gray-400 group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
              </summary>
              <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                결제 후 7일 이내 크레딧을 사용하지 않았다면 전액 환불이 가능합니다. 부분 사용 시에는 잔여분 일할 계산 환불을 지원합니다.
              </p>
            </details>
            
            <details className="group bg-gray-50 rounded-xl p-6 cursor-pointer border border-gray-200 hover:border-gray-300 transition-colors">
              <summary className="flex items-center justify-between font-semibold text-gray-900 list-none">
                <span>1크레딧으로 영상을 몇 개 만들 수 있나요?</span>
                <span className="ml-4 text-gray-400 group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
              </summary>
              <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                1크레딧 = 1개의 영상입니다. 영상 하나를 생성할 때마다 1크레딧이 차감됩니다.
              </p>
            </details>
            
            <details className="group bg-gray-50 rounded-xl p-6 cursor-pointer border border-gray-200 hover:border-gray-300 transition-colors">
              <summary className="flex items-center justify-between font-semibold text-gray-900 list-none">
                <span>결제 수단은 무엇이 있나요?</span>
                <span className="ml-4 text-gray-400 group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
              </summary>
              <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                토스페이먼츠를 통해 신용카드, 체크카드, 계좌이체, 간편결제(카카오페이, 네이버페이 등) 모두 가능합니다.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 md:py-24 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            지금 바로 시작하세요
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            첫 가입 시 1크레딧 무료 제공
          </p>
          <a
            href="/create"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white font-semibold text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
          >
            <span>영상 만들기</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
