---
name: paper-summarizer
description: 논문 PDF/DOI/URL → 한국어 요약 + 연구 연결점
group: knowledge
group_name: 지식관리
---

# 논문 요약기

논문 한 편의 핵심 5문장, 한국어 요약, 손승오의 SFM × GTX × 디지털 트윈 연구 정체성과의 연결점을 정리한다. Gemini Deep Research 권장.

## 그룹
**지식관리** — Vault 데일리·주간·논문요약 — km-master 하위 하네스

## 입력 인자
- `source` — 논문 출처 *(필수)*
  - 타입: textarea / 예시: PDF 경로 / DOI / URL / 또는 본문 직접 붙여넣기
- `focus` — 특히 알고 싶은 점(선택)
  - 타입: textarea / 예시: 예: 캘리브레이션 방법, 데이터셋 규모, 한계점
- `tone` — 요약 깊이 · 기본값: `표준` · 옵션: 짧게 (300자), 표준, 정밀 (방법론 포함)
  - 타입: select

## Vault 저장 권장 위치
`03.Resource/Reading/`

## 출력 형식
논문 요약 markdown (frontmatter 포함, 03.Resource/Reading/ 저장 가능)

## 프롬프트 템플릿

이 스킬을 호출할 때, 위 입력 인자(`{id}` 형태)를 실제 값으로 치환한 뒤 다음 프롬프트를 사용한다.

```
# 컨텍스트
- 사용자: 손승오 (KRRI 선임연구원, 한양대 교통공학 박사)
- 전문영역: 보행자 시뮬레이션(SFM) · 대심도 지하역사(GTX) · 디지털 트윈 · LiDAR/RGB-D
- Vault 위치: ~/Vaults/MyVault  (PARA 구조, CLAUDE.md 참조)
- 답변 언어: 한국어 (기술 용어는 영어 허용)

# 작업: 논문 요약 + 연구 연결점

## 입력
- 출처: {source}
- 사용자 관심 포인트: {focus}
- 요약 깊이: {tone}

## 절차

1. **메타데이터 추출**: 제목, 저자, 발표 venue, 연도, DOI(있으면). 출처가 URL/DOI인데 접근 불가하면 명시.

2. **핵심 5문장**: 논문 한 편을 읽지 않은 사람이 5문장만으로 핵심을 파악할 수 있도록.
   - 1문장: 무엇을 풀려고 하는가 (문제)
   - 2문장: 기존 방법의 한계
   - 3문장: 이 논문의 접근
   - 4문장: 핵심 결과 (수치 1~2개)
   - 5문장: 시사점/한계

3. **한국어 요약** ({tone} 깊이)
   - 짧게: 300자 내, 결론 중심
   - 표준: 600~800자, 방법·결과 균형
   - 정밀: 1500자 내, 방법론·실험 셋업·한계 포함

4. **연구 정체성 연결점** (가장 중요)
   - 손승오의 축: **SFM × GTX/대심도 지하역사 × LiDAR/RGB-D × AI 디지털 트윈**
   - 이 논문이 위 축 중 어디에 닿는가? 닿는다면 어떻게 활용 가능한가?
   - 손승오의 진행 중 프로젝트(GTX 환승센터 디지털 트윈, 서울역 디지털 트윈)와의 직접 연결 1~2개
   - 닿지 않으면 솔직히 "직접 연결 약함"이라고 명시

5. **인용/참고 후보**
   - 이 논문이 인용한 references 중 손승오가 추가로 봐야 할 1~3편
   - DOI 또는 제목 형태로

6. **저장 frontmatter**

```yaml
---
agent: paper-summarizer
created: <YYYY-MM-DD>
title: <논문 제목>
authors: <저자>
venue: <저널/학회>
year: <연도>
doi: <DOI>
tags: [agent-result, paper, reading]
relevance: <high/medium/low>   # 연구 정체성 연결도
---
```

7. **저장 위치 제안**: `03.Resource/Reading/<YYYY-MM-DD>-<slug>.md` (slug는 영문 키워드 3~4단어 kebab-case)

## 출력
- 완성된 markdown 한 덩어리 (frontmatter + 본문)
- 출처가 PDF 파일 경로지만 접근이 안 될 경우 그 사실을 첫 줄에 명시하고 메타데이터/요약은 사용자에게 텍스트 붙여넣기 요청

---

## 결과 파일 작성 규약 (필수)

이 작업의 결과를 .md 파일로 Vault에 저장할 때, **반드시** 다음 frontmatter를 파일 맨 위에 포함하라:

```yaml
---
agent: paper-summarizer
created: 2026-05-04
title: <한 줄 제목>
inputs_summary: {source}
tags: [agent-result]
---
```

이 frontmatter가 있어야 대시보드 홈/에이전트 모달의 "최근 결과" 위젯이 자동으로 인식하여 카드로 노출한다.
파일명 권장 패턴: `YYYY-MM-DD-paper-summarizer-{slug}.md`
```
