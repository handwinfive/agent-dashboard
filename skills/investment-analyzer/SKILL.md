---
name: investment-analyzer
description: 종목 → 펀더멘털 + 기술 트리거 점검
group: investing
group_name: 투자
---

# 투자분석 에이전트

CAN SLIM/SEPA/VCP(나스닥) 또는 Graham/Magic Formula(KOSPI) 관점에서 종목을 점검합니다. 매수·매도 추천은 하지 않습니다.

## 그룹
**투자** — Nasdaq · KOSPI 분석과 브리핑

## 입력 인자
- `ticker` — 종목 티커 *(필수)*
  - 타입: text / 예시: 예: NVDA, MRVL, 삼성전자
- `market` — 시장 · 기본값: `Nasdaq` · 옵션: Nasdaq, KOSPI
  - 타입: select
- `tier` — 티어 분류 · 기본값: `T1` · 옵션: T1 (코어), T2 (사이클 예외), T3, 신규 후보
  - 타입: select
- `context` — 관찰 맥락
  - 타입: textarea / 예시: 예: 어닝 직후, 베이스 형성 6주, RS 라인 신고가

## Vault 저장 권장 위치
`02.Area/투자/Nasdaq/`

## 출력 형식
체크리스트 기반 점검 노트

## 프롬프트 템플릿

이 스킬을 호출할 때, 위 입력 인자(`{id}` 형태)를 실제 값으로 치환한 뒤 다음 프롬프트를 사용한다.

```
# 컨텍스트
- 사용자: 손승오 (KRRI 선임연구원, 한양대 교통공학 박사)
- 전문영역: 보행자 시뮬레이션(SFM) · 대심도 지하역사(GTX) · 디지털 트윈 · LiDAR/RGB-D
- Vault 위치: ~/Vaults/MyVault  (PARA 구조, CLAUDE.md 참조)
- 답변 언어: 한국어 (기술 용어는 영어 허용)

# 작업: 투자 분석 (트리거 충족 여부 점검)
**중요 규칙**: 매수/매도를 추천하지 않는다. 트리거 충족 여부와 위험 요소만 객관적으로 정리한다.

- **티커**: {ticker}
- **시장**: {market}
- **티어**: {tier}
- **관찰 맥락**: {context}
- **분석 프레임워크**: Graham Safety Filter + Magic Formula (Joel Greenblatt)

## 출력 구성
1. **종목 한줄 요약** (사업 모델 + 최근 변화)
2. **펀더멘털 체크** (EPS 성장률, 매출, 마진, 부채)
3. **기술적 트리거** (베이스 패턴, RS, 거래량, 핵심 지지/저항)
4. **복합 트리거 점검표** | 항목 | 충족 | 비고 |
5. **리스크 요인** (3개)
6. **포지션 사이징 시 고려사항** (티어별 표준 vs 현 상황)
7. **다음 관찰 시점**

데이터는 가능한 한 최신을 가정하되, 확실치 않은 수치는 명시적으로 `(확인 필요)` 표기.
저장 권장: `02.Area/투자/Nasdaq/` 또는 `02.Area/투자/KOSPI/`

---

## 결과 파일 작성 규약 (필수)

이 작업의 결과를 .md 파일로 Vault에 저장할 때, **반드시** 다음 frontmatter를 파일 맨 위에 포함하라:

```yaml
---
agent: investment-analyzer
created: 2026-05-03
title: <한 줄 제목>
inputs_summary: {ticker}
tags: [agent-result]
---
```

이 frontmatter가 있어야 대시보드 홈/에이전트 모달의 "최근 결과" 위젯이 자동으로 인식하여 카드로 노출한다.
파일명 권장 패턴: `YYYY-MM-DD-investment-analyzer-{slug}.md`
```
