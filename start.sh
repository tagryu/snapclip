#!/bin/bash
# SnapClip — 프론트엔드(3000) + 서버(4000) 동시 실행

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  echo ""
  echo "🛑 Shutting down..."
  kill $SERVER_PID $APP_PID 2>/dev/null
  wait $SERVER_PID $APP_PID 2>/dev/null
  echo "✅ All processes stopped."
}
trap cleanup EXIT INT TERM

echo "🚀 Starting SnapClip..."

# Server (port 4000)
echo "📦 Starting server on :4000..."
cd "$ROOT_DIR/server"
npm run dev &
SERVER_PID=$!

# Frontend (port 3000)
echo "🌐 Starting frontend on :3000..."
cd "$ROOT_DIR/app"
npm run dev &
APP_PID=$!

echo ""
echo "✅ SnapClip is running!"
echo "   Frontend: http://localhost:3000"
echo "   Server:   http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop."

wait
