---
name: simulation-research
description: SFM · 디지털 트윈 연구 보조
group: research
group_name: 연구 / 논문
---

# 시뮬레이션 연구 에이전트

보행자 시뮬레이션 모델 설계, 파라미터 탐색, 실측 데이터(LiDAR/RGB-D) 비교 분석을 도와줍니다.

## 그룹
**연구 / 논문** — KRRI 연구 · 논문 · 시뮬레이션 보조

## 입력 인자
- `goal` — 연구 목표 *(필수)*
  - 타입: textarea / 예시: 예: GTX 삼성역 환승통로의 양방향 보행 흐름 모델 캘리브레이션
- `model` — 베이스 모델 · 기본값: `Social Force Model` · 옵션: Social Force Model, Cellular Automata, Continuum Model, SFM-DL Hybrid, 기타
  - 타입: select
- `data` — 가용 데이터
  - 타입: textarea / 예시: 예: LiDAR 궤적 데이터 2주분, RGB-D 카메라 4대 동기화
- `kpi` — 평가 지표 · 기본값: `flow rate · density · travel time`
  - 타입: text / 예시: flow rate, density, travel time, level of service 등

## Vault 저장 권장 위치
`01.Project/연구/`

## 출력 형식
실험 설계 + 코드 스켈레톤

## 프롬프트 템플릿

이 스킬을 호출할 때, 위 입력 인자(`{id}` 형태)를 실제 값으로 치환한 뒤 다음 프롬프트를 사용한다.

```
# 컨텍스트
- 사용자: 손승오 (KRRI 선임연구원, 한양대 교통공학 박사)
- 전문영역: 보행자 시뮬레이션(SFM) · 대심도 지하역사(GTX) · 디지털 트윈 · LiDAR/RGB-D
- Vault 위치: ~/Vaults/MyVault  (PARA 구조, CLAUDE.md 참조)
- 답변 언어: 한국어 (기술 용어는 영어 허용)

# 작업: 시뮬레이션 연구 보조
- **연구 목표**: {goal}
- **베이스 모델**: {model}
- **가용 데이터**: {data}
- **평가 지표**: {kpi}

## 응답 구성
1. **문제 정식화** (수식 1~2개)
2. **실험 설계** (시나리오 3개, 변수 표)
3. **파이프라인 코드 스켈레톤** (Python, 주석 충실, 50~80줄)
4. **데이터 전처리 체크리스트** (LiDAR/RGB-D 동기화, 노이즈, 좌표계)
5. **검증 전략** (unit test · 실측 비교 · sensitivity analysis)
6. **잠재 리스크와 대안**

저장 권장: `01.Project/연구/` (실험 노트 형식)

---

## 결과 파일 작성 규약 (필수)

이 작업의 결과를 .md 파일로 Vault에 저장할 때, **반드시** 다음 frontmatter를 파일 맨 위에 포함하라:

```yaml
---
agent: simulation-research
created: 2026-05-03
title: <한 줄 제목>
inputs_summary: {goal}
tags: [agent-result]
---
```

이 frontmatter가 있어야 대시보드 홈/에이전트 모달의 "최근 결과" 위젯이 자동으로 인식하여 카드로 노출한다.
파일명 권장 패턴: `YYYY-MM-DD-simulation-research-{slug}.md`
```
