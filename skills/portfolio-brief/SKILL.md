---
name: portfolio-brief
description: CLAUDE.md 규약 기반 5단계 브리핑
group: investing
group_name: 투자
---

# 투자현황 브리핑 에이전트

시장 환경 → 티어별 보유 → 트리거 체크 → 신규 후보 → 실행 플랜 순서로 일일/주간 브리핑을 작성합니다.

## 그룹
**투자** — Nasdaq · KOSPI 분석과 브리핑

## 입력 인자
- `period` — 브리핑 주기 · 기본값: `일일` · 옵션: 일일, 주간
  - 타입: select
- `market` — 대상 시장 · 기본값: `Nasdaq` · 옵션: Nasdaq, KOSPI, 두 시장 모두
  - 타입: select
- `holdings` — 현재 보유 종목 *(필수)* · 기본값: `T1 (코어): NVDA, GOOGL, AVGO
T2 (사이클 예외): MRVL, MU
T3: NFLX
신규: CRDO`
  - 타입: textarea / 예시: T1: NVDA, GOOGL, AVGO
T2: MRVL, MU
T3: NFLX
신규: CRDO
- `concerns` — 특별 관심사
  - 타입: textarea / 예시: 예: 어닝 임박 종목, 신고가 후보, 손절 후보

## Vault 저장 권장 위치
`02.Area/투자/Nasdaq/`

## 출력 형식
5단계 구조 브리핑 노트

## 프롬프트 템플릿

이 스킬을 호출할 때, 위 입력 인자(`{id}` 형태)를 실제 값으로 치환한 뒤 다음 프롬프트를 사용한다.

```
# 컨텍스트
- 사용자: 손승오 (KRRI 선임연구원, 한양대 교통공학 박사)
- 전문영역: 보행자 시뮬레이션(SFM) · 대심도 지하역사(GTX) · 디지털 트윈 · LiDAR/RGB-D
- Vault 위치: ~/Vaults/MyVault  (PARA 구조, CLAUDE.md 참조)
- 답변 언어: 한국어 (기술 용어는 영어 허용)

# 작업: {period} 투자 브리핑

CLAUDE.md 규약에 따라 정확히 5단계 구조로 작성한다.

- **대상 시장**: {market}
- **현재 보유 종목**:
{holdings}
- **특별 관심사**: {concerns}

## 5단계 구조 (반드시 이 순서)
1. **시장 환경** — 인덱스 (S&P, Nasdaq, KOSPI), 원유, VIX, 금리, 지정학 이벤트
2. **티어별 보유 종목** — T1/T2/T3별 현재 상태, 차트 위치, 직전 어닝 요약
3. **매수 트리거 체크 (복합 트리거)** — 종목별 충족/미충족 점검
4. **신규 후보 / 관망 종목** — 새로 등장한 베이스, 관망 중인 종목
5. **실행 플랜** — 오늘/이번 주 모니터링 항목과 알림 설정 제안

## 규칙 (필수)
- **매수/매도 추천 금지** — 트리거 충족 여부만 객관적 기술
- **기존 포지션과 충돌 시 명시적 경고**
- **확실치 않은 수치**는 `(확인 필요)` 라벨

저장 권장: `02.Area/투자/Nasdaq/YYYY-MM-DD-brief.md`
```
