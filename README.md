# 해외공시 AI 번역 솔루션

## 기술 스택

- **Frontend**: React 19, Next.js 15, TypeScript 5
- **스타일링**: TailwindCSS 4
- **데이터 관리**: React Hooks
- **날짜 처리**: date-fns, date-fns-tz
- **무한 스크롤**: react-window, react-window-infinite-loader

## 프로젝트 구조

```
src/
├── app/                # Next.js App Router 구조
│   ├── api/            # API 라우트 핸들러
│   └── page.tsx        # 메인 페이지 (ISR 적용)
├── components/         # React 컴포넌트
│   └── disclosure/     # 공시 관련 컴포넌트
├── data/               # 정적 데이터 및 매핑
├── hooks/              # 커스텀 React 훅
├── services/           # API 서비스
├── types/              # TypeScript 타입 정의
└── utils/              # 유틸리티 함수
```

## 시작하기

### 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (Turbopack 사용)
npm run dev
```

개발 서버가 실행되면 [http://localhost:3000](http://localhost:3000)에서 애플리케이션을 확인할 수 있습니다.

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

## 아키텍처 특징

- **ISR 방식**: 초기 페이지 로드는 서버에서 정적으로 생성하고, 필터링 및 페이지네이션은 클라이언트에서 처리
- **관심사 분리**: 데이터 가져오기, 상태 관리, UI 렌더링 로직을 명확히 분리
- **타입 안전성**: TypeScript를 활용한 엄격한 타입 체크
