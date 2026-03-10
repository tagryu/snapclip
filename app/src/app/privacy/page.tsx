import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-3xl mx-auto prose prose-invert prose-sm">
        <h1 className="text-2xl font-bold mb-8">개인정보처리방침</h1>
        <p className="text-muted text-sm mb-8">시행일: 2025년 1월 1일</p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">1. 수집하는 개인정보</h2>
          <p className="text-muted leading-relaxed mb-2">SnapClip은 서비스 제공을 위해 다음 정보를 수집합니다:</p>
          <ul className="text-muted space-y-2 list-disc pl-5">
            <li><strong>필수 수집 항목:</strong> 이메일 주소, 이름 (소셜 로그인 시 제공되는 정보)</li>
            <li><strong>자동 수집 항목:</strong> 서비스 이용 기록, 접속 로그, IP 주소, 브라우저 정보</li>
            <li><strong>결제 시:</strong> 결제 정보 (결제 대행사를 통해 처리, 카드 정보 직접 저장하지 않음)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">2. 개인정보의 이용 목적</h2>
          <ul className="text-muted space-y-2 list-disc pl-5">
            <li>회원 식별 및 서비스 제공</li>
            <li>영상 생성 이력 관리</li>
            <li>결제 처리 및 환불</li>
            <li>서비스 개선 및 통계 분석</li>
            <li>고객 문의 응대</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">3. 업로드 이미지 처리</h2>
          <ul className="text-muted space-y-2 list-disc pl-5">
            <li>회원이 업로드한 상품 이미지는 영상 생성 목적으로만 사용됩니다.</li>
            <li>영상 생성 완료 후 원본 이미지는 서버에서 자동 삭제됩니다.</li>
            <li>생성된 영상은 회원의 계정에 보관되며, 회원 탈퇴 시 삭제됩니다.</li>
            <li>업로드 이미지는 AI 모델 학습에 사용되지 않습니다.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">4. 개인정보의 보유 및 파기</h2>
          <ul className="text-muted space-y-2 list-disc pl-5">
            <li><strong>회원 정보:</strong> 회원 탈퇴 시 즉시 파기 (법령에 의한 보존 의무 있는 경우 해당 기간까지 보관)</li>
            <li><strong>결제 기록:</strong> 전자상거래법에 따라 5년 보관</li>
            <li><strong>접속 로그:</strong> 통신비밀보호법에 따라 3개월 보관</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">5. 개인정보의 제3자 제공</h2>
          <p className="text-muted leading-relaxed">
            SnapClip은 원칙적으로 회원의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우 예외로 합니다:
          </p>
          <ul className="text-muted space-y-2 list-disc pl-5 mt-2">
            <li>회원의 사전 동의가 있는 경우</li>
            <li>법령에 의해 요구되는 경우</li>
            <li>결제 처리를 위한 결제 대행사 (토스페이먼츠) 제공</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">6. 이용자의 권리</h2>
          <ul className="text-muted space-y-2 list-disc pl-5">
            <li>개인정보 열람, 수정, 삭제 요청 권리</li>
            <li>개인정보 처리 정지 요청 권리</li>
            <li>회원 탈퇴 권리</li>
            <li>위 권리 행사는 서비스 내 설정 또는 이메일(support@snapclip.app)로 가능합니다.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">7. 쿠키 사용</h2>
          <p className="text-muted leading-relaxed">
            SnapClip은 로그인 세션 유지 및 서비스 이용 경험 개선을 위해 쿠키를 사용합니다. 브라우저 설정에서 쿠키를 거부할 수 있으나, 일부 서비스 이용에 제한이 있을 수 있습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">8. 문의</h2>
          <p className="text-muted leading-relaxed">
            개인정보 관련 문의사항은 아래로 연락해 주세요.
          </p>
          <ul className="text-muted space-y-1 list-none pl-0 mt-2">
            <li>📧 이메일: support@snapclip.app</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
