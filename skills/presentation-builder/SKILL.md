---
name: presentation-builder
description: 주제 → pptx 슬라이드 구조
group: work
group_name: 업무
---

# 발표자료 작성 에이전트

발표 시간/청중에 맞춰 슬라이드 개요와 각 슬라이드의 메시지·시각 요소·발표 노트를 설계합니다.

## 그룹
**업무** — 기획서 · 발표자료 · 보고 · 실적관리

## 입력 인자
- `topic` — 발표 주제 *(필수)*
  - 타입: text / 예시: 예: GTX 디지털 트윈 중간 진척 보고
- `duration` — 발표 시간(분) · 기본값: `15`
  - 타입: text
- `audience` — 청중 · 기본값: `사내 보고` · 옵션: 사내 보고, 국토부 평가위원, 학회 발표, 산업계 미팅, 미국 대학 세미나
  - 타입: select
- `keyPoints` — 꼭 담아야 할 메시지 *(필수)*
  - 타입: textarea / 예시: 3~5개 핵심 메시지

## Vault 저장 권장 위치
`01.Project/A. (국가R&D) 환승역사/`

## 출력 형식
슬라이드 개요 + 발표 노트

## 프롬프트 템플릿

이 스킬을 호출할 때, 위 입력 인자(`{id}` 형태)를 실제 값으로 치환한 뒤 다음 프롬프트를 사용한다.

```
# 컨텍스트
- 사용자: 손승오 (KRRI 선임연구원, 한양대 교통공학 박사)
- 전문영역: 보행자 시뮬레이션(SFM) · 대심도 지하역사(GTX) · 디지털 트윈 · LiDAR/RGB-D
- Vault 위치: ~/Vaults/MyVault  (PARA 구조, CLAUDE.md 참조)
- 답변 언어: 한국어 (기술 용어는 영어 허용)

# 작업: 발표자료 슬라이드 구조 설계
- **주제**: {topic}
- **발표 시간**: {duration}분 → 권장 슬라이드 수: NaN장 내외
- **청중**: {audience}
- **핵심 메시지**:
{keyPoints}

## 출력 구성
1. **스토리라인 한 단락** — 청중이 발표 후 기억할 한 문장
2. **슬라이드 개요표** | # | 제목 | 메시지 | 시각요소 | 발표시간 |
3. **각 슬라이드 상세** — 제목 / 본문 불릿 / 시각화 제안(차트·도표·이미지) / 발표 노트(말할 내용)
4. **Q&A 예상 질문 5개와 답변 키워드**
5. **다음 단계** — pptx 변환 명령 예시 (Cowork pptx skill 활용)

저장 권장: `01.Project/A. (국가R&D) 환승역사/YYYY-MM-DD-{slug}-deck.md`

---

## 결과 파일 작성 규약 (필수)

이 작업의 결과를 .md 파일로 Vault에 저장할 때, **반드시** 다음 frontmatter를 파일 맨 위에 포함하라:

```yaml
---
agent: presentation-builder
created: 2026-05-03
title: <한 줄 제목>
inputs_summary: {topic}
tags: [agent-result]
---
```

이 frontmatter가 있어야 대시보드 홈/에이전트 모달의 "최근 결과" 위젯이 자동으로 인식하여 카드로 노출한다.
파일명 권장 패턴: `YYYY-MM-DD-presentation-builder-{slug}.md`
```
