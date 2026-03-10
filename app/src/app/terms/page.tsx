import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-3xl mx-auto prose prose-invert prose-sm">
        <h1 className="text-2xl font-bold mb-8">이용약관</h1>
        <p className="text-muted text-sm mb-8">시행일: 2025년 1월 1일</p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">제1조 (목적)</h2>
          <p className="text-muted leading-relaxed">
            본 약관은 SnapClip(이하 &quot;서비스&quot;)이 제공하는 AI 기반 상품 영상 자동 생성 서비스의 이용 조건 및 절차, 회사와 회원 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">제2조 (정의)</h2>
          <ul className="text-muted space-y-2 list-disc pl-5">
            <li>&quot;서비스&quot;란 사용자가 업로드한 상품 이미지를 기반으로 AI가 숏폼 광고 영상을 자동 생성하는 웹 서비스를 말합니다.</li>
            <li>&quot;회원&quot;이란 본 약관에 동의하고 서비스에 가입한 자를 말합니다.</li>
            <li>&quot;크레딧&quot;이란 영상 생성에 사용되는 서비스 내 이용 단위를 말합니다.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">제3조 (서비스 이용)</h2>
          <ul className="text-muted space-y-2 list-disc pl-5">
            <li>서비스는 회원 가입 후 이용 가능하며, 무료 플랜으로 월 3개의 영상을 생성할 수 있습니다.</li>
            <li>유료 플랜 가입 시 추가 크레딧 및 고급 기능을 이용할 수 있습니다.</li>
            <li>생성된 영상의 저작권은 회원에게 귀속되나, AI 생성물의 특성상 유사한 결과물이 생성될 수 있습니다.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">제4조 (결제 및 환불)</h2>
          <ul className="text-muted space-y-2 list-disc pl-5">
            <li>유료 서비스는 월 정기 결제 방식으로 제공됩니다.</li>
            <li>결제 후 7일 이내 크레딧을 사용하지 않은 경우 전액 환불이 가능합니다.</li>
            <li>크레딧을 일부 사용한 경우 잔여 크레딧에 대한 일할 계산 환불이 가능합니다.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">제5조 (금지 행위)</h2>
          <p className="text-muted leading-relaxed mb-2">회원은 다음 행위를 해서는 안 됩니다:</p>
          <ul className="text-muted space-y-2 list-disc pl-5">
            <li>타인의 저작권을 침해하는 이미지 업로드</li>
            <li>불법적이거나 유해한 콘텐츠 생성 목적의 서비스 이용</li>
            <li>서비스의 기술적 보호 조치를 우회하는 행위</li>
            <li>자동화된 수단을 이용한 과도한 서비스 이용</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">제6조 (면책)</h2>
          <ul className="text-muted space-y-2 list-disc pl-5">
            <li>AI가 생성한 카피라이팅 및 영상 결과물의 정확성을 보장하지 않습니다.</li>
            <li>회원이 업로드한 이미지의 저작권 문제에 대해 회사는 책임을 지지 않습니다.</li>
            <li>천재지변, 서버 장애 등 불가항력에 의한 서비스 중단에 대해 책임을 지지 않습니다.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">제7조 (약관의 변경)</h2>
          <p className="text-muted leading-relaxed">
            회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지 후 7일이 경과한 시점부터 효력이 발생합니다.
          </p>
        </section>
      </div>
    </div>
  );
}
