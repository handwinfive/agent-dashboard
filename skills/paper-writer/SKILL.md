---
name: paper-writer
description: 아이디어 → 논문 섹션 학술 초안
group: research
group_name: 연구 / 논문
---

# 논문작성 에이전트

Nature/IEEE 스타일 가이드를 따라 Abstract/Introduction/Methods/Results/Discussion 등 섹션 초안을 작성합니다.

## 그룹
**연구 / 논문** — KRRI 연구 · 논문 · 시뮬레이션 보조

## 입력 인자
- `title` — 가제 *(필수)*
  - 타입: text / 예시: 예: SFM-DL 하이브리드 보행자 시뮬레이터의 GTX 환승센터 적용
- `section` — 작성 섹션 · 기본값: `Introduction` · 옵션: Abstract, Introduction, Related Work, Methods, Experiments, Results, Discussion, Conclusion
  - 타입: select
- `core` — 핵심 메시지 *(필수)*
  - 타입: textarea / 예시: 이 섹션에서 독자에게 전달하고 싶은 한두 문장
- `venue` — 타겟 저널/학회 · 기본값: `IEEE T-ITS`
  - 타입: text / 예시: IEEE T-ITS / Trans. Res. Part C / Nature Communications
- `wordCount` — 목표 분량(단어) · 기본값: `600`
  - 타입: text

## Vault 저장 권장 위치
`01.Project/연구/`

## 출력 형식
논문 섹션 초안 + 인용 권장 자료

## 프롬프트 템플릿

이 스킬을 호출할 때, 위 입력 인자(`{id}` 형태)를 실제 값으로 치환한 뒤 다음 프롬프트를 사용한다.

```
# 컨텍스트
- 사용자: 손승오 (KRRI 선임연구원, 한양대 교통공학 박사)
- 전문영역: 보행자 시뮬레이션(SFM) · 대심도 지하역사(GTX) · 디지털 트윈 · LiDAR/RGB-D
- Vault 위치: ~/Vaults/MyVault  (PARA 구조, CLAUDE.md 참조)
- 답변 언어: 한국어 (기술 용어는 영어 허용)

# 작업: 논문 섹션 초안 작성
- **타겟 저널/학회**: {venue}
- **논문 가제**: {title}
- **작성 섹션**: {section}
- **핵심 메시지**: {core}
- **목표 분량**: 약 {wordCount} words

## 작성 지침
1. **{venue}** 스타일 가이드 준수 (능동·간결, passive 남용 자제, 과도한 부사 금지)
2. 첫 문장에서 섹션의 의의를 명확히, 마지막 문장에서 다음 섹션으로 자연스러운 흐름
3. 미국 학계 관점에서 인용해야 할 핵심 reference 5편을 [Author Year] 형태로 제시 (실제 존재 여부는 사용자가 후속 검증)
4. 한국어로 초안을 쓰되, 그대로 영어로 번역 가능한 문체

## 출력 형식
- **영문 초안** (단락 구조 명확)
- **한글 요지** (3~4문장)
- **인용 후보 목록** (저자·연도·이유 한 줄)
- **검토 포인트** (작성 후 사용자가 확인할 항목 3개)

저장 권장: `01.Project/연구/`

---

## 결과 파일 작성 규약 (필수)

이 작업의 결과를 .md 파일로 Vault에 저장할 때, **반드시** 다음 frontmatter를 파일 맨 위에 포함하라:

```yaml
---
agent: paper-writer
created: 2026-05-03
title: <한 줄 제목>
inputs_summary: {title}
tags: [agent-result]
---
```

이 frontmatter가 있어야 대시보드 홈/에이전트 모달의 "최근 결과" 위젯이 자동으로 인식하여 카드로 노출한다.
파일명 권장 패턴: `YYYY-MM-DD-paper-writer-{slug}.md`
```
