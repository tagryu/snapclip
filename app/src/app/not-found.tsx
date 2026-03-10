export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <span className="text-6xl mb-6">🔍</span>
      <h1 className="text-2xl font-bold mb-2">페이지를 찾을 수 없어요</h1>
      <p className="text-muted text-sm mb-6">요청하신 페이지가 존재하지 않습니다</p>
      <a href="/" className="px-6 py-3 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity">
        홈으로 돌아가기
      </a>
    </div>
  );
}
