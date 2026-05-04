---
name: daily-curator
description: 오늘의 데일리 노트 자동 초안
group: knowledge
group_name: 지식관리
---

# 데일리 큐레이터

어제 데일리 노트의 이월 항목 + 진행 중 프로젝트 + 입력 초점을 종합해 CLAUDE.md 데일리 템플릿에 따른 데일리 노트를 생성한다.

## 그룹
**지식관리** — Vault 데일리·주간·논문요약 — km-master 하위 하네스

## 입력 인자
- `date` — 대상 날짜 · 기본값: `오늘`
  - 타입: text / 예시: YYYY-MM-DD 또는 "오늘"
- `focus` — 오늘의 초점(선택)
  - 타입: textarea / 예시: 미입력 시 어제 이월에서 자동 추출. 예: GTX 보고서 마감 / 논문 X 리뷰
- `mood` — 컨디션·메모(선택)
  - 타입: text / 예시: 예: 오전 회의 3건 / 코어타임 14-17시

## Vault 저장 권장 위치
`02.Area/B. 일정관리/Daily/`

## 출력 형식
데일리 노트 markdown (frontmatter 포함, 즉시 Vault에 저장 가능)

## 프롬프트 템플릿

이 스킬을 호출할 때, 위 입력 인자(`{id}` 형태)를 실제 값으로 치환한 뒤 다음 프롬프트를 사용한다.

```
# 컨텍스트
- 사용자: 손승오 (KRRI 선임연구원, 한양대 교통공학 박사)
- 전문영역: 보행자 시뮬레이션(SFM) · 대심도 지하역사(GTX) · 디지털 트윈 · LiDAR/RGB-D
- Vault 위치: ~/Vaults/MyVault  (PARA 구조, CLAUDE.md 참조)
- 답변 언어: 한국어 (기술 용어는 영어 허용)

# 작업: 데일리 노트 생성

대상 날짜: {date}
사용자 입력 초점: {focus}
컨디션·메모: {mood}

## 절차

1. **날짜 정규화**: "오늘"이면 시스템 today를 YYYY-MM-DD로. 요일도 한글로 (예: 월요일).

2. **데이터 수집** (가능한 범위, 실패해도 계속 진행)
   - 어제 데일리 노트: `02.Area/B. 일정관리/Daily/<어제>.md`
     - "🔁 내일로 이월" 섹션의 미완료 [ ] 항목 추출
   - 진행 중 프로젝트 인덱스: `01.Project/*/00. README.md` 또는 최상위 노트 (있으면)
   - 오늘 캘린더 일정: 가능한 경우, 없으면 비워둠

3. **CLAUDE.md 데일리 템플릿 준수**

```markdown
# YYYY-MM-DD (요일)

> _컨디션: <컨디션 메모>_   ← 입력이 있을 때만

> _진행 중: <프로젝트 1~2개 요약>_   ← 컨텍스트 힌트

## 🎯 오늘의 초점 (3개 이내)
- [ ] ...
- [ ] ...
- [ ] ...

## 📝 작업 로그
_(아침에는 비움, 저녁에 채움)_

## 💡 떠오른 생각

## 📚 오늘 읽은 것

## 🔁 내일로 이월
_(없으면: "이월 없음")_
```

4. **초점 결정 우선순위**
   - (a) 사용자 입력 `focus`가 있으면 그것을 그대로 분해해서 3개 이내 [ ]로
   - (b) 없으면 어제 이월 항목 중 우선순위 상위 3개
   - (c) 둘 다 없으면 빈 [ ] 3줄만 (사용자가 채우도록)

5. **frontmatter (필수)**
   파일 맨 위에 다음 frontmatter 포함:

```yaml
---
agent: daily-curator
created: <YYYY-MM-DD>
title: <YYYY-MM-DD> 데일리 노트
inputs_summary: <focus 첫 줄 또는 "데일리 자동 생성">
tags: [agent-result, daily]
---
```

6. **저장 위치**: `02.Area/B. 일정관리/Daily/<YYYY-MM-DD>.md`

## 출력
- 완성된 데일리 노트 markdown 한 덩어리만 출력 (설명 X)
- 이월 항목이 없으면 그 사실을 `이월 없음`으로 명시
- 사용자가 그대로 Vault에 저장하거나 1~2줄 다듬기만 하면 되도록

---

## 결과 파일 작성 규약 (필수)

이 작업의 결과를 .md 파일로 Vault에 저장할 때, **반드시** 다음 frontmatter를 파일 맨 위에 포함하라:

```yaml
---
agent: daily-curator
created: 2026-05-04
title: <한 줄 제목>
inputs_summary: {date}
tags: [agent-result]
---
```

이 frontmatter가 있어야 대시보드 홈/에이전트 모달의 "최근 결과" 위젯이 자동으로 인식하여 카드로 노출한다.
파일명 권장 패턴: `YYYY-MM-DD-daily-curator-{slug}.md`
```
