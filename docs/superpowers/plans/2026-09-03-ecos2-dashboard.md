# ECOS2 Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 ECOS 화면과 같은 단일 페이지에 신규 경제지표 조회, 로컬 관리자 설정, 차트 및 엑셀 다운로드를 제공한다.

**Architecture:** 기존 정적 GitHub Pages 구조를 확장해 `ecos2.html`이 동일 출처의 사전 생성 JSON을 조회하게 한다. 데이터 수집기는 기존 저장소 비밀값을 재사용하고 일·월·분기·연간 주기를 정규화하며, 관리자 설정은 공개 카탈로그 범위에서 `localStorage`로 관리한다.

**Tech Stack:** HTML, CSS, vanilla JavaScript, PowerShell, GitHub Actions, 기존 브라우저용 XLSX 모듈

**Spec:** `docs/superpowers/specs/2026-09-03-ecos2-dashboard-design.md`

## Global Constraints

- 공개 경로는 `/stitch/ecos2.html`이다.
- ECOS API 키를 HTML, JavaScript, JSON 또는 브라우저 요청에 포함하지 않는다.
- 기존 `ecos.html`의 기능과 배포를 훼손하지 않는다.
- 관리자 변경은 해당 브라우저에만 저장한다.
- 기존 프로젝트의 패키지 관리자, 잠금 파일, GitHub Pages 배포 구조를 보존한다.

---

### Task 1: ECOS2 데이터 카탈로그와 주기 정규화

**Files:**
- Create: `scripts/ecos2-series.json`
- Modify: `scripts/fetch-ecos-data.ps1`
- Create: `scripts/verify-ecos2-data.ps1`

**Interfaces:**
- Consumes: `ECOS_API_KEY`, 카탈로그의 `id`, `statCode`, `cycle`, `items`
- Produces: `public/ecos2-data/manifest.json`, 항목별 JSON 스냅샷

- [ ] **Step 1: 검증 스크립트에 D/M/Q/A 기간 형식과 필수 카탈로그 필드 검사를 작성한다.**
- [ ] **Step 2: 검증 스크립트를 실행해 아직 없는 카탈로그 때문에 실패함을 확인한다.**
- [ ] **Step 3: 여섯 통계 묶음과 세부 지표를 카탈로그에 작성하고 수집기에 출력 디렉터리·분기·연간 주기 지원을 추가한다.**
- [ ] **Step 4: 커밋된 스냅샷을 대상으로 검증 스크립트가 통과하는지 확인한다.**
- [ ] **Step 5: `feat: add ecos2 data catalog`로 커밋한다.**

### Task 2: 단일 페이지 조회 화면과 관리자 설정

**Files:**
- Create: `public/ecos2.html`
- Create: `public/ecos2.css`
- Create: `public/ecos2.js`
- Create: `scripts/verify-ecos2-ui.ps1`

**Interfaces:**
- Consumes: `./ecos2-data/manifest.json`, 항목별 JSON, `ecos2.admin.v1` localStorage 값
- Produces: 날짜 필터, 카드, 차트, 전치 표, 관리자 패널, COPY 동작

- [ ] **Step 1: 필수 DOM id, 접근성 이름, 관리자 설정 키, 상대 데이터 경로를 검사하는 UI 검증을 작성한다.**
- [ ] **Step 2: 새 페이지가 없어 검증이 실패함을 확인한다.**
- [ ] **Step 3: 기존 디자인 토큰을 확장한 HTML/CSS와 날짜·카드·차트·표 렌더링을 구현한다.**
- [ ] **Step 4: 표시/숨김, 순서 이동, 명칭 변경, 기본 선택, 초기화, JSON 내보내기/가져오기를 구현한다.**
- [ ] **Step 5: 결과 표를 최신일자 쪽으로 자동 스크롤하고 반응형·키보드 동작을 검증한다.**
- [ ] **Step 6: `feat: build ecos2 dashboard and admin panel`로 커밋한다.**

### Task 3: 개별 및 전체 엑셀 다운로드

**Files:**
- Create: `public/ecos2-xlsx.js`
- Modify: `public/ecos2.html`
- Create: `scripts/verify-ecos2-xlsx.py`

**Interfaces:**
- Consumes: 화면에서 조회된 정규화 데이터 배열
- Produces: 개별 XLSX 및 여섯 시트의 통합 XLSX, 실제 셀 참조 차트

- [ ] **Step 1: 시트명, 전치 행열, 날짜 축 간격, 범례 및 셀 참조를 검사하는 테스트를 작성한다.**
- [ ] **Step 2: 엑셀 모듈이 없어 테스트가 실패함을 확인한다.**
- [ ] **Step 3: 기존 엑셀 생성 모듈을 재사용해 개별/통합 파일과 연동 차트를 구현한다.**
- [ ] **Step 4: 데이터가 적거나 많은 경우 모두 유효한 워크북이 생성되는지 검사한다.**
- [ ] **Step 5: `feat: add ecos2 excel exports`로 커밋한다.**

### Task 4: 배포 통합과 최종 검증

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes: 기존 `ECOS_API_KEY` GitHub 저장소 비밀값
- Produces: GitHub Pages의 `/stitch/ecos2.html`

- [ ] **Step 1: 배포 전 데이터 검증이 새 카탈로그와 스냅샷을 포함하도록 워크플로를 수정한다.**
- [ ] **Step 2: 로컬 정적 검증과 프로덕션 빌드를 실행한다.**
- [ ] **Step 3: 기존 `ecos.html` 및 신규 `ecos2.html`이 모두 빌드 산출물에 포함되는지 확인한다.**
- [ ] **Step 4: `feat: publish ecos2 dashboard`로 커밋한다.**
- [ ] **Step 5: 원격 저장소에 반영하고 GitHub Pages 배포 완료 후 공개 주소를 확인한다.**

