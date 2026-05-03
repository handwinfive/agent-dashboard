---
name: work-report-writer
description: 기간 + 작업 → 보고문 정리
group: work
group_name: 업무
---

# 업무보고 작성 에이전트

Daily/Weekly 노트를 종합해 일일·주간·월간 업무보고를 작성합니다. 진척도/이슈/다음 계획을 일관된 양식으로 정리합니다.

## 그룹
**업무** — 기획서 · 발표자료 · 보고 · 실적관리

## 입력 인자
- `period` — 보고 주기 · 기본값: `주간` · 옵션: 일일, 주간, 월간, 반기
  - 타입: select
- `range` — 대상 기간 · 기본값: `이번 주`
  - 타입: text / 예시: 예: 2026-04-27 ~ 2026-05-02
- `projects` — 주요 프로젝트 *(필수)*
  - 타입: textarea / 예시: 예: GTX 디지털 트윈, 서울역 시뮬레이터, 논문 X 투고
- `audience` — 보고 대상 · 기본값: `팀장` · 옵션: 팀장, 부서장, 원장, 외부 평가위원, 자기 기록용
  - 타입: select

## Vault 저장 권장 위치
`02.Area/Weekly/`

## 출력 형식
업무보고 문서 (Markdown → docx 변환 가능)

## 프롬프트 템플릿

이 스킬을 호출할 때, 위 입력 인자(`{id}` 형태)를 실제 값으로 치환한 뒤 다음 프롬프트를 사용한다.

```
# 컨텍스트
- 사용자: 손승오 (KRRI 선임연구원, 한양대 교통공학 박사)
- 전문영역: 보행자 시뮬레이션(SFM) · 대심도 지하역사(GTX) · 디지털 트윈 · LiDAR/RGB-D
- Vault 위치: ~/Vaults/MyVault  (PARA 구조, CLAUDE.md 참조)
- 답변 언어: 한국어 (기술 용어는 영어 허용)

# 작업: {period} 업무보고 작성
- **대상 기간**: {range}
- **주요 프로젝트**: {projects}
- **보고 대상**: {audience}

## 데이터 출처 (Vault에서 종합)
- 02.Area/Daily/ 의 해당 기간 데일리 노트
- 02.Area/Weekly/ 의 직전 주간 리뷰
- 관련 프로젝트 노트: 01.Project/연구/

## 출력 구조
1. **요약** (3~5줄)
2. **이번 {period} 주요 진척** — 프로젝트별 성과 표
3. **이슈 및 리스크** — 영향도/대응안
4. **다음 {period} 계획** — 우선순위 3개
5. **요청/지원 필요사항**
6. **부록: 정량 지표** (필요 시)

## 톤
- 사실 기반, 능동태
- "~하였음" 단정형보다 "~를 진행, ~결과 확인" 흐름
- 보고 대상이 {audience}일 때 의사결정에 도움되는 정보 우선

저장 권장: `02.Area/Weekly/YYYY-Www-report.md`

---

## 결과 파일 작성 규약 (필수)

이 작업의 결과를 .md 파일로 Vault에 저장할 때, **반드시** 다음 frontmatter를 파일 맨 위에 포함하라:

```yaml
---
agent: work-report-writer
created: 2026-05-03
title: <한 줄 제목>
inputs_summary: {period}
tags: [agent-result]
---
```

이 frontmatter가 있어야 대시보드 홈/에이전트 모달의 "최근 결과" 위젯이 자동으로 인식하여 카드로 노출한다.
파일명 권장 패턴: `YYYY-MM-DD-work-report-writer-{slug}.md`
```
