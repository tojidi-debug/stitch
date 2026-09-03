# Stitch UI Update
This repository contains the latest UI components generated from Stitch designs.

## ECOS 통계 조회

GitHub Pages 배포 후 /stitch/ecos.html에서 사용할 수 있습니다.

- `ecos.html`: 환율·금리·기준금리·예대금리·소비자물가·생산자물가 조회
- `ecos2.html`: 주가지수·경제성장률·수출입물가·생활물가·국내공급물가 조회 및 브라우저별 관리자 설정

두 페이지는 GitHub Pages의 정적 파일로 동작합니다. GitHub Actions가 저장소 비밀값 `ECOS_API_KEY`로 ECOS 데이터를 미리 수집하므로 API 키는 공개 HTML과 JavaScript에 포함되지 않습니다.
