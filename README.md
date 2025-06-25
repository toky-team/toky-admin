# TOKY Admin

## Description
정기전 승부예측 서비스 `TOKY`의 관리자 대시보드 레포지토리입니다.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn dev

# build
$ yarn build

# preview
$ yarn preview
```

## Deploy

TBD

## Architecture

본 프로젝트는 Feature-Sliced Design 아키텍처를 기반으로 하며, 기능별 모듈화와 관심사의 분리를 통해 유지보수성과 확장성을 고려한 구조로 설계되었습니다.

각 기능은 다음과 같은 계층으로 구성됩니다:

### Feature Layer
- 비즈니스 로직과 상태 관리를 담당합니다.
- 각 기능별 타입 정의, 서비스, 훅, 컴포넌트를 포함합니다.
- 독립적이고 재사용 가능한 기능 단위로 구성됩니다.

### Shared Layer  
- 여러 기능에서 공통으로 사용되는 모듈들을 제공합니다.
- UI 컴포넌트, 공통 라이브러리, 유틸리티 함수 등을 포함합니다.
- 비즈니스 로직에 의존하지 않는 순수한 공통 모듈입니다.

### Pages Layer
- 라우팅과 페이지 레벨 컴포넌트를 관리합니다.
- 여러 Feature를 조합하여 완전한 페이지를 구성합니다.
- URL과 직접적으로 매핑되는 컴포넌트들을 포함합니다.

### App Layer
- 전역 설정, 라우터 설정, 전역 상태 등을 관리합니다.
- 애플리케이션의 진입점과 전역 설정을 담당합니다.

## Directory Structure

디렉토리 구조는 다음과 같습니다.

```bash
src/
├── features/                       # 기능별 모듈 모음
│   ├── auth/                       # 'auth' 기능
│   │   ├── components/             # 인증 관련 컴포넌트
│   │   ├── hooks/                  # 커스텀 훅
│   │   ├── service/                # API 서비스
│   │   ├── store/                  # 상태 관리 (Zustand)
│   │   └── types/                  # 타입 정의
│   │
│   ├── score/                      # 'score' 기능
│   │   ├── components/             # 점수 관리 컴포넌트
│   │   ├── hooks/                  # 점수 관련 훅
│   │   ├── service/                # 점수 API 서비스
│   │   └── types/                  # 점수 관련 타입
│   │
│   └── other-feature/
│       └── ...                     # 동일한 구조
│
├── shared/                         # 공통 모듈
│   ├── components/                 # 재사용 가능한 컴포넌트
│   ├── ui/                         # 기본 UI 컴포넌트
│   ├── widgets/                    # 복합 위젯 컴포넌트
│   ├── layouts/                    # 레이아웃 컴포넌트
│   ├── lib/                        # 공통 라이브러리 및 유틸리티
│   │   └── api.ts                  # Axios 인스턴스 및 인터셉터
│   └── styles/                     # 전역 스타일
│
├── pages/                          # 페이지 컴포넌트
│   ├── home/                       # 홈 페이지
│   │   └── home.page.tsx
│   ├── login/                      # 로그인 관련 페이지
│   │   ├── login.page.tsx
│   │   └── login-callback.page.tsx
│   └── score/                      # 점수 관리 페이지
│       └── score.page.tsx
│
├── App.tsx                         # 애플리케이션 루트 컴포넌트
└── main.tsx                        # 애플리케이션 진입점
```


## Technology Stack

React, Vite, Zustand, Axios, Tailwind


## Feature List (계속 추가 예정)

- 대시보드
  - 서버 상태 확인
  - 유저 수 현황 확인

- 경기 점수
  - 경기 상태 변경
  - 점수 업데이트