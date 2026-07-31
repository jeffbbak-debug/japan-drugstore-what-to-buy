# 일본 드럭스토어 뭐사지?

React + Vite 프론트엔드와 Node.js + Express 백엔드로 구성된 MVP입니다.

## 주요 기능

- 인기 상품 목록
- 카테고리 필터
- 상품명·증상·매장 검색
- 상품 상세
- 구매 가능 매장 표시
- 피드형 광고 Mock
- 하단 고정 토스 배너 Mock
- 로딩·오류·빈 결과 처리
- API 재시도
- 서버 캐시 헤더
- 헬스체크 API

## 실행 방법

### 1. 백엔드

```bash
cd backend
npm install
npm run dev
```

기본 주소: http://localhost:4000

### 2. 프론트엔드

새 터미널에서:

```bash
cd frontend
npm install
npm run dev
```

기본 주소: http://localhost:5173

## 환경변수

프론트엔드 `.env.example`을 복사해 `.env`로 만들 수 있습니다.

```env
VITE_API_BASE_URL=http://localhost:4000
```

백엔드 `.env.example`:

```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
```

## 토스 광고 적용 시

현재 `FeedAd`와 `BottomAd`는 Mock 컴포넌트입니다.
실제 앱인토스 광고 SDK 적용 시 해당 컴포넌트 내부만 교체하면 됩니다.
