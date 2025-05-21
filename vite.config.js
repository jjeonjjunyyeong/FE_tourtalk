import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    // 파일 업로드 경로
    __API_BASE_URL__: JSON.stringify('http://localhost:8080'), 
  },
  server: {
    port: 5173
  },
  // esbuild 설정 (필요한 경우)
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  }
});


// Vite 개발 서버 설정
// 1. port
// 기본값: 5173
// 설명: 개발 서버가 열릴 포트를 설정합니다.

// 2. host
// 기본값: 'localhost'
// 설명:
// host: true → 0.0.0.0으로 모든 네트워크 인터페이스에서 접근 가능 (ex: 모바일 테스트).
// host: '0.0.0.0' → 동일한 의미.

// 3. open
// 기본값: false
// 설명: 서버 시작 시 브라우저를 자동으로 엽니다.

//  4. https
// 기본값: false
// 설명: 개발 서버를 HTTPS로 실행. 인증서 정보까지 설정하면 자체 서명된 HTTPS 사용 가능.

// 5. cors
// 기본값: false
// 설명: CORS 허용 여부 설정. true로 하면 모든 출처에 대해 허용.

// 6. strictPort
// 기본값: false
// 설명: 설정한 포트가 사용 중이면 오류를 발생시킬지 여부.
// true → 포트 충돌 시 실패
// false → 자동으로 다음 포트로 이동

// 7. proxy
// 설명: 프론트엔드에서 백엔드 API 호출을 중계해주는 프록시 설정.

//  8. hmr (Hot Module Replacement)
// 기본값: 자동 감지
// 설명: HMR 설정 세부 제어. WebSocket 포트 지정 등.

// 9. watch
// 설명: 파일 변경 감지 관련 옵션 (chokidar 사용).

// 10. middlewareMode
// 설명: Vite를 미들웨어로 사용할지 설정.

// 11. fs (File System Serve Options)
// 설명: 개발 서버에서 접근 가능한 디렉토리 제한 등 설정

// 12. origin
// 설명: 개발 서버의 공개 URL을 명시적으로 설정

//  13. headers
// 설명: 개발 서버 응답에 포함할 HTTP 헤더 설정