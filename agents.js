/* ==============================================================
   AGENT REGISTRY  (Agent Workbench)
   ──────────────────────────────────────────────────────────────
   - 9개 업무지원 에이전트 정의 (3그룹: 연구/논문 · 투자 · 업무)
   - 각 에이전트: 입력 폼 스키마 + 프롬프트 빌더 + Vault 경로 힌트
   - AgentLayer  : localStorage 기반 실행 이력 저장
   - AgentModule : 카드 렌더, 모달 입력, 프롬프트 생성·복사
   ============================================================== */

/* ───────── 그룹 정의 ───────── */
const AGENT_GROUPS = [
  { id: 'research',  name: '연구 / 논문', icon: 'flask-conical', color: 'blue',
    description: 'KRRI 연구 · 논문 · 시뮬레이션 보조' },
  { id: 'investing', name: '투자',         icon: 'trending-up',   color: 'green',
    description: 'Nasdaq · KOSPI 분석과 브리핑' },
  { id: 'work',      name: '업무',         icon: 'briefcase',     color: 'purple',
    description: '기획서 · 발표자료 · 보고 · 실적관리' }
];

/* ───────── Vault 표준 경로 (실제 Vault 구조 반영) ─────────
   CLAUDE.md의 가상 경로와 실제 폴더명이 다르므로, 실제 구조 기준으로
   매핑한다 (예: '02.Area/E. 투자 및 자산관리/').                  */
const VAULT_PATHS = {
  root:           '~/Vaults/MyVault',
  daily:          '02.Area/B. 일정관리/',
  weekly:         '02.Area/B. 일정관리/',
  research:       '01.Project/A. (국가R&D) 환승역사/',
  area_research:  '02.Area/A. 논문연구 주제 정리/',
  reading:        '03.Resource/',
  nasdaq:         '02.Area/E. 투자 및 자산관리/Daily Brief/',
  kospi:          '02.Area/E. 투자 및 자산관리/Daily Brief/',
  investing_root: '02.Area/E. 투자 및 자산관리/',
  attachments:    '04.Archive/Attachments/'
};

/* ───────── 에이전트 결과 파일 스캔 대상 폴더 ─────────
   ObsidianSync.scanAgentResults() 가 이 경로들을 depth 3까지 재귀
   순회하여 frontmatter에 `agent: <id>` 가 있는 .md 파일을 인식한다.
   상위 폴더만 지정하면 하위 모든 .md가 자동 검색된다.              */
const AGENT_RESULT_DIRS = [
  '01.Project/',
  '02.Area/A. 논문연구 주제 정리/',
  '02.Area/B. 일정관리/',
  '02.Area/E. 투자 및 자산관리/',
  '03.Resource/'
];

/* ───────── 공통 프롬프트 헤더 (모든 에이전트 공통 컨텍스트) ───────── */
const COMMON_PROMPT_HEADER = `# 컨텍스트
- 사용자: 손승오 (KRRI 선임연구원, 한양대 교통공학 박사)
- 전문영역: 보행자 시뮬레이션(SFM) · 대심도 지하역사(GTX) · 디지털 트윈 · LiDAR/RGB-D
- Vault 위치: ${VAULT_PATHS.root}  (PARA 구조, CLAUDE.md 참조)
- 답변 언어: 한국어 (기술 용어는 영어 허용)
`;

/* ───────── 에이전트 정의 ───────── */
const AGENT_REGISTRY = [
  /* ─────────── 1. 자료조사 ─────────── */
  {
    id: 'research-collector',
    groupId: 'research',
    name: '자료조사 에이전트',
    icon: 'search',
    tagline: '주제 → 핵심 자료 · 논문 요약',
    description: '입력한 주제에 대한 학술 논문/뉴스/리포트를 수집하고, 핵심 인사이트를 표·요약으로 정리합니다.',
    inputs: [
      { id: 'topic',    label: '조사 주제',       type: 'text',     required: true,
        placeholder: '예: 대심도 지하역사 보행자 흐름 시뮬레이션 최신 동향' },
      { id: 'depth',    label: '조사 깊이',       type: 'select',   default: '중간',
        options: ['빠른 개요','중간','심층(논문 5편 이상)'] },
      { id: 'years',    label: '대상 기간',       type: 'text',     default: '최근 5년',
        placeholder: '예: 2020~2026' },
      { id: 'angle',    label: '관심 각도',       type: 'textarea', required: false,
        placeholder: '예: SFM 기반 모델 한계와 AI 보완 가능성' }
    ],
    outputHint: '요약 보고서 (Markdown)',
    vaultSavePath: VAULT_PATHS.reading,
    buildPrompt(v) {
      return `${COMMON_PROMPT_HEADER}
# 작업: 자료조사
다음 주제에 대해 학술 논문·산업 리포트·뉴스를 조사하고 정리해줘.

- **조사 주제**: ${v.topic}
- **조사 깊이**: ${v.depth}
- **대상 기간**: ${v.years}
- **관심 각도**: ${v.angle || '(특별히 없음)'}

## 출력 형식 (Markdown)
1. **한줄 요약** (3문장 이내)
2. **핵심 인사이트** (불릿 5~7개)
3. **주요 자료 표** | 제목 | 저자/기관 | 연도 | 핵심 기여 | 링크 |
4. **연구 정체성과 연결점**: 손승오의 SFM × GTX × 디지털 트윈 방향에서 본 시사점
5. **다음 액션 제안** (3개)

## 저장 권장 위치
완성 후 \`${VAULT_PATHS.reading}\` 아래 \`YYYY-MM-DD-${'{slug}'}.md\` 형태로 저장 제안.`;
    }
  },

  /* ─────────── 2. 논문작성 ─────────── */
  {
    id: 'paper-writer',
    groupId: 'research',
    name: '논문작성 에이전트',
    icon: 'pen-tool',
    tagline: '아이디어 → 논문 섹션 학술 초안',
    description: 'Nature/IEEE 스타일 가이드를 따라 Abstract/Introduction/Methods/Results/Discussion 등 섹션 초안을 작성합니다.',
    inputs: [
      { id: 'title',   label: '가제',            type: 'text',     required: true,
        placeholder: '예: SFM-DL 하이브리드 보행자 시뮬레이터의 GTX 환승센터 적용' },
      { id: 'section', label: '작성 섹션',       type: 'select',   default: 'Introduction',
        options: ['Abstract','Introduction','Related Work','Methods','Experiments','Results','Discussion','Conclusion'] },
      { id: 'core',    label: '핵심 메시지',     type: 'textarea', required: true,
        placeholder: '이 섹션에서 독자에게 전달하고 싶은 한두 문장' },
      { id: 'venue',   label: '타겟 저널/학회',  type: 'text',     default: 'IEEE T-ITS',
        placeholder: 'IEEE T-ITS / Trans. Res. Part C / Nature Communications' },
      { id: 'wordCount', label: '목표 분량(단어)', type: 'text',  default: '600' }
    ],
    outputHint: '논문 섹션 초안 + 인용 권장 자료',
    vaultSavePath: VAULT_PATHS.research,
    buildPrompt(v) {
      return `${COMMON_PROMPT_HEADER}
# 작업: 논문 섹션 초안 작성
- **타겟 저널/학회**: ${v.venue}
- **논문 가제**: ${v.title}
- **작성 섹션**: ${v.section}
- **핵심 메시지**: ${v.core}
- **목표 분량**: 약 ${v.wordCount} words

## 작성 지침
1. **${v.venue}** 스타일 가이드 준수 (능동·간결, passive 남용 자제, 과도한 부사 금지)
2. 첫 문장에서 섹션의 의의를 명확히, 마지막 문장에서 다음 섹션으로 자연스러운 흐름
3. 미국 학계 관점에서 인용해야 할 핵심 reference 5편을 [Author Year] 형태로 제시 (실제 존재 여부는 사용자가 후속 검증)
4. 한국어로 초안을 쓰되, 그대로 영어로 번역 가능한 문체

## 출력 형식
- **영문 초안** (단락 구조 명확)
- **한글 요지** (3~4문장)
- **인용 후보 목록** (저자·연도·이유 한 줄)
- **검토 포인트** (작성 후 사용자가 확인할 항목 3개)

저장 권장: \`${VAULT_PATHS.research}\``;
    }
  },

  /* ─────────── 3. 시뮬레이션 연구 ─────────── */
  {
    id: 'simulation-research',
    groupId: 'research',
    name: '시뮬레이션 연구 에이전트',
    icon: 'activity',
    tagline: 'SFM · 디지털 트윈 연구 보조',
    description: '보행자 시뮬레이션 모델 설계, 파라미터 탐색, 실측 데이터(LiDAR/RGB-D) 비교 분석을 도와줍니다.',
    inputs: [
      { id: 'goal',     label: '연구 목표',       type: 'textarea', required: true,
        placeholder: '예: GTX 삼성역 환승통로의 양방향 보행 흐름 모델 캘리브레이션' },
      { id: 'model',    label: '베이스 모델',     type: 'select',   default: 'Social Force Model',
        options: ['Social Force Model','Cellular Automata','Continuum Model','SFM-DL Hybrid','기타'] },
      { id: 'data',     label: '가용 데이터',     type: 'textarea', required: false,
        placeholder: '예: LiDAR 궤적 데이터 2주분, RGB-D 카메라 4대 동기화' },
      { id: 'kpi',      label: '평가 지표',       type: 'text',     default: 'flow rate · density · travel time',
        placeholder: 'flow rate, density, travel time, level of service 등' }
    ],
    outputHint: '실험 설계 + 코드 스켈레톤',
    vaultSavePath: VAULT_PATHS.research,
    buildPrompt(v) {
      return `${COMMON_PROMPT_HEADER}
# 작업: 시뮬레이션 연구 보조
- **연구 목표**: ${v.goal}
- **베이스 모델**: ${v.model}
- **가용 데이터**: ${v.data || '(미정)'}
- **평가 지표**: ${v.kpi}

## 응답 구성
1. **문제 정식화** (수식 1~2개)
2. **실험 설계** (시나리오 3개, 변수 표)
3. **파이프라인 코드 스켈레톤** (Python, 주석 충실, 50~80줄)
4. **데이터 전처리 체크리스트** (LiDAR/RGB-D 동기화, 노이즈, 좌표계)
5. **검증 전략** (unit test · 실측 비교 · sensitivity analysis)
6. **잠재 리스크와 대안**

저장 권장: \`${VAULT_PATHS.research}\` (실험 노트 형식)`;
    }
  },

  /* ─────────── 4. 투자분석 ─────────── */
  {
    id: 'investment-analyzer',
    groupId: 'investing',
    name: '투자분석 에이전트',
    icon: 'line-chart',
    tagline: '종목 → 펀더멘털 + 기술 트리거 점검',
    description: 'CAN SLIM/SEPA/VCP(나스닥) 또는 Graham/Magic Formula(KOSPI) 관점에서 종목을 점검합니다. 매수·매도 추천은 하지 않습니다.',
    inputs: [
      { id: 'ticker',   label: '종목 티커',       type: 'text',     required: true,
        placeholder: '예: NVDA, MRVL, 삼성전자' },
      { id: 'market',   label: '시장',           type: 'select',   default: 'Nasdaq',
        options: ['Nasdaq','KOSPI'] },
      { id: 'tier',     label: '티어 분류',       type: 'select',   default: 'T1',
        options: ['T1 (코어)','T2 (사이클 예외)','T3','신규 후보'] },
      { id: 'context',  label: '관찰 맥락',       type: 'textarea', required: false,
        placeholder: '예: 어닝 직후, 베이스 형성 6주, RS 라인 신고가' }
    ],
    outputHint: '체크리스트 기반 점검 노트',
    vaultSavePath: VAULT_PATHS.nasdaq,
    buildPrompt(v) {
      const isUS = v.market === 'Nasdaq';
      const framework = isUS
        ? 'CAN SLIM + SEPA + VCP 돌파 매수 (William O\'Neil, Mark Minervini)'
        : 'Graham Safety Filter + Magic Formula (Joel Greenblatt)';
      return `${COMMON_PROMPT_HEADER}
# 작업: 투자 분석 (트리거 충족 여부 점검)
**중요 규칙**: 매수/매도를 추천하지 않는다. 트리거 충족 여부와 위험 요소만 객관적으로 정리한다.

- **티커**: ${v.ticker}
- **시장**: ${v.market}
- **티어**: ${v.tier}
- **관찰 맥락**: ${v.context || '(특별히 없음)'}
- **분석 프레임워크**: ${framework}

## 출력 구성
1. **종목 한줄 요약** (사업 모델 + 최근 변화)
2. **펀더멘털 체크** (EPS 성장률, 매출, 마진, 부채)
3. **기술적 트리거** (베이스 패턴, RS, 거래량, 핵심 지지/저항)
4. **복합 트리거 점검표** | 항목 | 충족 | 비고 |
5. **리스크 요인** (3개)
6. **포지션 사이징 시 고려사항** (티어별 표준 vs 현 상황)
7. **다음 관찰 시점**

데이터는 가능한 한 최신을 가정하되, 확실치 않은 수치는 명시적으로 \`(확인 필요)\` 표기.
저장 권장: \`${VAULT_PATHS.nasdaq}\` 또는 \`${VAULT_PATHS.kospi}\``;
    }
  },

  /* ─────────── 5. 투자현황 브리핑 ─────────── */
  {
    id: 'portfolio-brief',
    groupId: 'investing',
    name: '투자현황 브리핑 에이전트',
    icon: 'newspaper',
    tagline: 'CLAUDE.md 규약 기반 5단계 브리핑',
    description: '시장 환경 → 티어별 보유 → 트리거 체크 → 신규 후보 → 실행 플랜 순서로 일일/주간 브리핑을 작성합니다.',
    inputs: [
      { id: 'period',     label: '브리핑 주기',   type: 'select',   default: '일일',
        options: ['일일','주간'] },
      { id: 'market',     label: '대상 시장',     type: 'select',   default: 'Nasdaq',
        options: ['Nasdaq','KOSPI','두 시장 모두'] },
      { id: 'holdings',   label: '현재 보유 종목',type: 'textarea', required: true,
        placeholder: 'T1: NVDA, GOOGL, AVGO\nT2: MRVL, MU\nT3: NFLX\n신규: CRDO',
        default: 'T1 (코어): NVDA, GOOGL, AVGO\nT2 (사이클 예외): MRVL, MU\nT3: NFLX\n신규: CRDO' },
      { id: 'concerns',   label: '특별 관심사',   type: 'textarea', required: false,
        placeholder: '예: 어닝 임박 종목, 신고가 후보, 손절 후보' }
    ],
    outputHint: '5단계 구조 브리핑 노트',
    vaultSavePath: VAULT_PATHS.nasdaq,
    buildPrompt(v) {
      return `${COMMON_PROMPT_HEADER}
# 작업: ${v.period} 투자 브리핑

CLAUDE.md 규약에 따라 정확히 5단계 구조로 작성한다.

- **대상 시장**: ${v.market}
- **현재 보유 종목**:
${v.holdings}
- **특별 관심사**: ${v.concerns || '(특별히 없음)'}

## 5단계 구조 (반드시 이 순서)
1. **시장 환경** — 인덱스 (S&P, Nasdaq, KOSPI), 원유, VIX, 금리, 지정학 이벤트
2. **티어별 보유 종목** — T1/T2/T3별 현재 상태, 차트 위치, 직전 어닝 요약
3. **매수 트리거 체크 (복합 트리거)** — 종목별 충족/미충족 점검
4. **신규 후보 / 관망 종목** — 새로 등장한 베이스, 관망 중인 종목
5. **실행 플랜** — 오늘/이번 주 모니터링 항목과 알림 설정 제안

## 규칙 (필수)
- **매수/매도 추천 금지** — 트리거 충족 여부만 객관적 기술
- **기존 포지션과 충돌 시 명시적 경고**
- **확실치 않은 수치**는 \`(확인 필요)\` 라벨

저장 권장: \`${VAULT_PATHS.nasdaq}YYYY-MM-DD-brief.md\``;
    }
  },

  /* ─────────── 6. 기획서 작성 ─────────── */
  {
    id: 'proposal-writer',
    groupId: 'work',
    name: '기획서 작성 에이전트',
    icon: 'file-text',
    tagline: '주제 → KRRI 톤 기획서 초안',
    description: '공공연구기관(KRRI) 톤을 유지하면서 배경/목적/추진방안/예산/일정/기대효과 구조의 기획서를 작성합니다.',
    inputs: [
      { id: 'topic',     label: '기획 주제',      type: 'text',     required: true,
        placeholder: '예: 생성형 AI 기반 GTX 환승센터 디지털 트윈 고도화' },
      { id: 'budget',    label: '예산 규모',      type: 'text',     default: '미정',
        placeholder: '예: 40억원 / 4년' },
      { id: 'audience',  label: '대상 독자',      type: 'select',   default: '국토교통부',
        options: ['국토교통부','과기정통부','내부 보고','NRF','외부 파트너'] },
      { id: 'goals',     label: '핵심 목표',      type: 'textarea', required: true,
        placeholder: '핵심 산출물·성과지표 3~5개' }
    ],
    outputHint: '기획서 초안 (.md, 후속 .docx 변환)',
    vaultSavePath: VAULT_PATHS.research,
    buildPrompt(v) {
      return `${COMMON_PROMPT_HEADER}
# 작업: KRRI 톤 기획서 초안 작성
- **주제**: ${v.topic}
- **예산 규모**: ${v.budget}
- **대상 독자**: ${v.audience}
- **핵심 목표**:
${v.goals}

## 톤 가이드
- 공공연구기관 특성 반영 (정량 지표 · 사회적 가치 · 정책 연계)
- "~을 도모한다 / ~의 기반을 마련한다" 같은 행정 문체와 학술 정밀도 균형
- 미국 학계 관점에서도 통하도록 영문 키워드 병기 (예: Social Force Model)

## 구조
1. **추진 배경** (1쪽)
2. **연구 목적 및 필요성**
3. **추진 전략 및 방법론** — 단계별 마일스톤 표
4. **연차별 목표 및 산출물 (KPI 정량화)**
5. **예산 계획** (인건비 · 재료비 · 외주 · 출장)
6. **연구 추진 체계** (KRRI + 외부 컨소시엄)
7. **기대 효과 및 활용 방안** (정책 · 산업 · 학술)
8. **위험 요인 및 대응**

후속 \`.docx\` 변환 시 사용할 표·이미지 자리는 \`[표 N]\`, \`[그림 N]\`으로 표기.
저장 권장: \`${VAULT_PATHS.research}\``;
    }
  },

  /* ─────────── 7. 발표자료 작성 ─────────── */
  {
    id: 'presentation-builder',
    groupId: 'work',
    name: '발표자료 작성 에이전트',
    icon: 'presentation',
    tagline: '주제 → pptx 슬라이드 구조',
    description: '발표 시간/청중에 맞춰 슬라이드 개요와 각 슬라이드의 메시지·시각 요소·발표 노트를 설계합니다.',
    inputs: [
      { id: 'topic',     label: '발표 주제',      type: 'text',     required: true,
        placeholder: '예: GTX 디지털 트윈 중간 진척 보고' },
      { id: 'duration',  label: '발표 시간(분)',   type: 'text',     default: '15' },
      { id: 'audience',  label: '청중',           type: 'select',   default: '사내 보고',
        options: ['사내 보고','국토부 평가위원','학회 발표','산업계 미팅','미국 대학 세미나'] },
      { id: 'keyPoints', label: '꼭 담아야 할 메시지', type: 'textarea', required: true,
        placeholder: '3~5개 핵심 메시지' }
    ],
    outputHint: '슬라이드 개요 + 발표 노트',
    vaultSavePath: VAULT_PATHS.research,
    buildPrompt(v) {
      return `${COMMON_PROMPT_HEADER}
# 작업: 발표자료 슬라이드 구조 설계
- **주제**: ${v.topic}
- **발표 시간**: ${v.duration}분 → 권장 슬라이드 수: ${Math.max(5, Math.round(parseInt(v.duration||'15')*0.8))}장 내외
- **청중**: ${v.audience}
- **핵심 메시지**:
${v.keyPoints}

## 출력 구성
1. **스토리라인 한 단락** — 청중이 발표 후 기억할 한 문장
2. **슬라이드 개요표** | # | 제목 | 메시지 | 시각요소 | 발표시간 |
3. **각 슬라이드 상세** — 제목 / 본문 불릿 / 시각화 제안(차트·도표·이미지) / 발표 노트(말할 내용)
4. **Q&A 예상 질문 5개와 답변 키워드**
5. **다음 단계** — pptx 변환 명령 예시 (Cowork pptx skill 활용)

저장 권장: \`${VAULT_PATHS.research}YYYY-MM-DD-${'{slug}'}-deck.md\``;
    }
  },

  /* ─────────── 8. 업무보고 작성 ─────────── */
  {
    id: 'work-report-writer',
    groupId: 'work',
    name: '업무보고 작성 에이전트',
    icon: 'clipboard-list',
    tagline: '기간 + 작업 → 보고문 정리',
    description: 'Daily/Weekly 노트를 종합해 일일·주간·월간 업무보고를 작성합니다. 진척도/이슈/다음 계획을 일관된 양식으로 정리합니다.',
    inputs: [
      { id: 'period',   label: '보고 주기',        type: 'select',   default: '주간',
        options: ['일일','주간','월간','반기'] },
      { id: 'range',    label: '대상 기간',        type: 'text',     default: '이번 주',
        placeholder: '예: 2026-04-27 ~ 2026-05-02' },
      { id: 'projects', label: '주요 프로젝트',    type: 'textarea', required: true,
        placeholder: '예: GTX 디지털 트윈, 서울역 시뮬레이터, 논문 X 투고' },
      { id: 'audience', label: '보고 대상',        type: 'select',   default: '팀장',
        options: ['팀장','부서장','원장','외부 평가위원','자기 기록용'] }
    ],
    outputHint: '업무보고 문서 (Markdown → docx 변환 가능)',
    vaultSavePath: VAULT_PATHS.weekly,
    buildPrompt(v) {
      return `${COMMON_PROMPT_HEADER}
# 작업: ${v.period} 업무보고 작성
- **대상 기간**: ${v.range}
- **주요 프로젝트**: ${v.projects}
- **보고 대상**: ${v.audience}

## 데이터 출처 (Vault에서 종합)
- ${VAULT_PATHS.daily} 의 해당 기간 데일리 노트
- ${VAULT_PATHS.weekly} 의 직전 주간 리뷰
- 관련 프로젝트 노트: ${VAULT_PATHS.research}

## 출력 구조
1. **요약** (3~5줄)
2. **이번 ${v.period} 주요 진척** — 프로젝트별 성과 표
3. **이슈 및 리스크** — 영향도/대응안
4. **다음 ${v.period} 계획** — 우선순위 3개
5. **요청/지원 필요사항**
6. **부록: 정량 지표** (필요 시)

## 톤
- 사실 기반, 능동태
- "~하였음" 단정형보다 "~를 진행, ~결과 확인" 흐름
- 보고 대상이 ${v.audience}일 때 의사결정에 도움되는 정보 우선

저장 권장: \`${VAULT_PATHS.weekly}YYYY-Www-report.md\``;
    }
  },

  /* ─────────── 9. 개인실적관리 ─────────── */
  {
    id: 'performance-tracker',
    groupId: 'work',
    name: '개인실적관리 에이전트',
    icon: 'award',
    tagline: '누적 실적 → 미국 포지션 트랙 점검',
    description: '논문/프로젝트/발표/멘토링 등 개인 실적을 누적 정리하고, 미국 포지션 준비 트랙(2~4년 윈도우) 관점에서 갭을 짚어줍니다.',
    inputs: [
      { id: 'year',     label: '대상 연도',        type: 'text',     default: '2026' },
      { id: 'records',  label: '실적 입력',        type: 'textarea', required: true,
        placeholder: '논문: ...\n수주 프로젝트: ...\n발표: ...\n수상: ...\n멘토링/강의: ...' },
      { id: 'targets',  label: '목표 (있으면)',     type: 'textarea', required: false,
        placeholder: '예: SCI 1편, IEEE T-ITS 1편 투고, J-1 지원서 제출' }
    ],
    outputHint: '실적 정리표 + 갭 분석',
    vaultSavePath: VAULT_PATHS.area_research,
    buildPrompt(v) {
      return `${COMMON_PROMPT_HEADER}
# 작업: 개인 실적 정리 + 미국 포지션 트랙 갭 분석
- **대상 연도**: ${v.year}
- **실적**:
${v.records}
- **목표**:
${v.targets || '(미설정 - 함께 제안 요청)'}

## 출력 구조
1. **카테고리별 실적표**
   | 분야 | 항목 | 비중/수치 | 미국 트랙 가중치 |
   - 분야: 논문 / 프로젝트 / 발표 / 수상 / 멘토링 / 학회활동 / 기타
   - 미국 트랙 가중치: ★~★★★★★ (Tier 1 저널 > 학회 > 프로젝트 PI > 강의 등)
2. **연구 정체성 일관성 점검** — SFM × GTX × 디지털 트윈 축에서 본 일관성/이탈
3. **갭 분석** — 2~4년 윈도우 안에 메워야 할 항목
4. **다음 분기 우선순위 제안** (3개)
5. **CV/Personal Statement 반영 시 강조 포인트**

저장 권장: \`${VAULT_PATHS.area_research}${v.year}-실적.md\``;
    }
  }
];

/* ───────── localStorage Layer ───────── */
const AgentLayer = {
  STORAGE_KEY: 'agent_workbench_runs',

  getAll() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  saveRun(agentId, inputs, prompt) {
    const runs = this.getAll();
    runs.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
      agentId,
      inputs,
      promptPreview: prompt.slice(0, 240),
      createdAt: new Date().toISOString()
    });
    // keep latest 100
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(runs.slice(0, 100)));
  },

  recentForAgent(agentId, limit = 5) {
    return this.getAll().filter(r => r.agentId === agentId).slice(0, limit);
  },

  recentAll(limit = 10) {
    return this.getAll().slice(0, limit);
  },

  clearAll() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
};

/* ───────── 결과 파일 frontmatter 규약 (모든 에이전트 공통 푸터) ─────────
   결과를 .md로 저장할 때 이 frontmatter를 맨 위에 포함하면
   대시보드 ObsidianSync 가 자동으로 카드로 노출한다.                    */
function _agentResultFrontmatterFooter(agentId, inputs) {
  const today = new Date().toISOString().slice(0, 10);
  // 첫 번째 입력값을 inputs_summary 후보로 (사람이 보기 쉽게)
  const firstVal = Object.values(inputs || {}).find(v => v && String(v).trim()) || '';
  const summary = String(firstVal).split('\n')[0].slice(0, 60);
  return `

---

## 결과 파일 작성 규약 (필수)

이 작업의 결과를 .md 파일로 Vault에 저장할 때, **반드시** 다음 frontmatter를 파일 맨 위에 포함하라:

\`\`\`yaml
---
agent: ${agentId}
created: ${today}
title: <한 줄 제목>
inputs_summary: ${summary || '<핵심 입력 한 줄>'}
tags: [agent-result]
---
\`\`\`

이 frontmatter가 있어야 대시보드 홈/에이전트 모달의 "최근 결과" 위젯이 자동으로 인식하여 카드로 노출한다.
파일명 권장 패턴: \`YYYY-MM-DD-${agentId}-{slug}.md\``;
}

/* 모든 에이전트의 buildPrompt 호출 결과에 위 푸터를 자동 추가 */
function buildAgentPrompt(agent, values) {
  const base = agent.buildPrompt(values);
  return base + _agentResultFrontmatterFooter(agent.id, values);
}

/* ───────── Helpers ───────── */
function _agentEsc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function _agentById(id) { return AGENT_REGISTRY.find(a => a.id === id); }
function _agentsByGroup(gid) { return AGENT_REGISTRY.filter(a => a.groupId === gid); }
function _groupColorVar(color) {
  return ({ blue:'var(--info)', green:'var(--success)', purple:'var(--accent)', yellow:'var(--warning)' }[color]) || 'var(--accent)';
}

/* ───────── AgentModule (UI controller) ───────── */
const AgentModule = {
  selectedAgentId: null,

  /* ===== 페이지 렌더 ===== */
  renderPage() {
    const totalRuns = AgentLayer.getAll().length;
    const recent = AgentLayer.recentAll(5);

    const groupsHtml = AGENT_GROUPS.map(g => {
      const agents = _agentsByGroup(g.id);
      return `
        <div class="agent-group" style="margin-bottom:28px">
          <div class="agent-group-header" style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
            <div class="agent-group-icon" style="width:32px;height:32px;border-radius:8px;background:${_groupColorVar(g.color)};opacity:0.18;display:flex;align-items:center;justify-content:center">
              <i data-lucide="${g.icon}" style="width:18px;height:18px;color:${_groupColorVar(g.color)}"></i>
            </div>
            <div>
              <div style="font-size:16px;font-weight:700">${g.name}</div>
              <div style="font-size:12px;color:var(--text-muted)">${g.description}</div>
            </div>
            <span class="badge" style="margin-left:auto">${agents.length}개</span>
          </div>
          <div class="grid-3" style="gap:14px">
            ${agents.map(a => AgentModule._cardHtml(a)).join('')}
          </div>
        </div>
      `;
    }).join('');

    const recentHtml = recent.length === 0
      ? `<div style="color:var(--text-muted);font-size:13px;padding:8px 0">아직 실행 이력이 없습니다.</div>`
      : recent.map(r => {
          const a = _agentById(r.agentId);
          return `
            <div class="agent-row" style="cursor:pointer" onclick="AgentModule.openModal('${r.agentId}')">
              <div class="agent-dot active"></div>
              <div class="agent-name">${a ? a.name : r.agentId}</div>
              <div class="agent-time">${new Date(r.createdAt).toLocaleString('ko-KR', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' })}</div>
            </div>
          `;
        }).join('');

    return `
      <div class="fade-in">
        <div class="grid-3" style="margin-bottom:24px;gap:16px">
          <div class="summary-card">
            <div class="summary-icon purple"><i data-lucide="bot" style="width:20px;height:20px"></i></div>
            <div>
              <div class="summary-value">${AGENT_REGISTRY.length}</div>
              <div class="summary-label">등록된 에이전트</div>
              <div class="summary-sub">${AGENT_GROUPS.length}개 그룹</div>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon green"><i data-lucide="zap" style="width:20px;height:20px"></i></div>
            <div>
              <div class="summary-value">${totalRuns}</div>
              <div class="summary-label">누적 실행 이력</div>
              <div class="summary-sub">로컬 저장</div>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon blue"><i data-lucide="folder-tree" style="width:20px;height:20px"></i></div>
            <div>
              <div class="summary-value" style="font-size:13px;font-weight:600">${VAULT_PATHS.root}</div>
              <div class="summary-label">Vault 경로</div>
              <div class="summary-sub">PARA · CLAUDE.md</div>
            </div>
          </div>
        </div>

        ${groupsHtml}

        <div class="card">
          <div class="card-header">
            <div class="card-title"><i data-lucide="history" style="width:16px;height:16px"></i> 최근 실행</div>
          </div>
          ${recentHtml}
        </div>
      </div>
    `;
  },

  _cardHtml(a) {
    const g = AGENT_GROUPS.find(x => x.id === a.groupId);
    const color = _groupColorVar(g?.color || 'purple');
    const recent = AgentLayer.recentForAgent(a.id, 1)[0];
    const lastRunStr = recent
      ? new Date(recent.createdAt).toLocaleString('ko-KR', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' })
      : '아직 실행 안 함';
    return `
      <div class="card agent-card" onclick="AgentModule.openModal('${a.id}')" style="cursor:pointer;transition:all .15s ease;border-left:3px solid ${color}">
        <div style="display:flex;align-items:flex-start;gap:12px">
          <div style="width:36px;height:36px;border-radius:8px;background:${color};opacity:0.18;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i data-lucide="${a.icon}" style="width:18px;height:18px;color:${color}"></i>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:700;margin-bottom:2px">${_agentEsc(a.name)}</div>
            <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">${_agentEsc(a.tagline)}</div>
            <div style="font-size:11px;color:var(--text-muted);display:flex;align-items:center;gap:6px">
              <i data-lucide="clock" style="width:11px;height:11px"></i>
              ${lastRunStr}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /* ===== 모달 ===== */
  openModal(agentId) {
    const a = _agentById(agentId);
    if (!a) return;
    this.selectedAgentId = agentId;
    const g = AGENT_GROUPS.find(x => x.id === a.groupId);
    const color = _groupColorVar(g?.color || 'purple');

    const inputsHtml = a.inputs.map(inp => {
      const id = `agentInp_${inp.id}`;
      const required = inp.required ? '*' : '';
      const dflt = _agentEsc(inp.default ?? '');
      const ph = _agentEsc(inp.placeholder ?? '');
      if (inp.type === 'textarea') {
        return `<div class="form-group">
          <label>${_agentEsc(inp.label)} ${required}</label>
          <textarea id="${id}" placeholder="${ph}" rows="3">${dflt}</textarea>
        </div>`;
      }
      if (inp.type === 'select') {
        return `<div class="form-group">
          <label>${_agentEsc(inp.label)} ${required}</label>
          <select id="${id}">
            ${inp.options.map(o => `<option value="${_agentEsc(o)}" ${o === inp.default ? 'selected' : ''}>${_agentEsc(o)}</option>`).join('')}
          </select>
        </div>`;
      }
      return `<div class="form-group">
        <label>${_agentEsc(inp.label)} ${required}</label>
        <input type="text" id="${id}" placeholder="${ph}" value="${dflt}">
      </div>`;
    }).join('');

    const recentRuns = AgentLayer.recentForAgent(agentId, 3);
    const recentHtml = recentRuns.length === 0 ? '' : `
      <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border-color)">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">최근 실행 (프롬프트 복사 이력)</div>
        ${recentRuns.map(r => `
          <div style="font-size:12px;color:var(--text-secondary);padding:4px 0">
            <span style="color:var(--text-muted)">${new Date(r.createdAt).toLocaleString('ko-KR', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' })}</span>
            · ${_agentEsc(Object.values(r.inputs)[0] || '').slice(0, 40)}
          </div>
        `).join('')}
      </div>
    `;

    /* Vault에 저장된 결과 파일 (ObsidianSync 연동) */
    const obsConnected = (typeof window !== 'undefined' && window.ObsidianSync && window.ObsidianSync.isConnected);
    const vaultResults = obsConnected ? window.ObsidianSync.getAgentResults(agentId, 5) : [];
    const vaultResultsHtml = !obsConnected ? `
      <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border-color)">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">결과 파일 (Vault)</div>
        <div style="font-size:12px;color:var(--text-muted);background:var(--bg-tertiary);padding:8px 10px;border-radius:6px">
          Vault 미연결 — 사이드바의 "볼트 연결"을 누르면 이 에이전트의 결과 파일이 여기에 표시됩니다.
        </div>
      </div>
    ` : vaultResults.length === 0 ? `
      <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border-color)">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">결과 파일 (Vault)</div>
        <div style="font-size:12px;color:var(--text-muted)">아직 인식된 결과 파일이 없습니다.</div>
      </div>
    ` : `
      <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border-color)">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">결과 파일 (Vault) · 최근 ${vaultResults.length}개</div>
        ${vaultResults.map(r => {
          const created = r.frontmatter.created || r.mtime || '';
          const title = r.frontmatter.title || r.file.replace(/\.md$/i, '');
          return `
            <div style="padding:8px 10px;background:var(--bg-tertiary);border-radius:6px;margin-bottom:6px;border-left:2px solid var(--obsidian)">
              <div style="font-size:13px;font-weight:600;margin-bottom:2px">${_agentEsc(title)}</div>
              <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">${_agentEsc(created)} · <code>${_agentEsc(r.folder)}${_agentEsc(r.file)}</code></div>
              ${r.preview ? `<div style="font-size:12px;color:var(--text-secondary);line-height:1.4">${_agentEsc(r.preview)}</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;

    const body = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <div style="width:40px;height:40px;border-radius:8px;background:${color};opacity:0.18;display:flex;align-items:center;justify-content:center">
          <i data-lucide="${a.icon}" style="width:20px;height:20px;color:${color}"></i>
        </div>
        <div>
          <div style="font-weight:700;font-size:15px">${_agentEsc(a.name)}</div>
          <div style="font-size:12px;color:var(--text-secondary)">${_agentEsc(a.description)}</div>
        </div>
      </div>
      ${inputsHtml}
      <div style="font-size:11px;color:var(--text-muted);background:var(--bg-tertiary);padding:8px 10px;border-radius:6px;margin-top:6px">
        💡 출력 권장 위치: <code>${_agentEsc(a.vaultSavePath || VAULT_PATHS.root)}</code>
      </div>
      ${recentHtml}
      ${vaultResultsHtml}
    `;

    document.getElementById('agentModalTitle').textContent = a.name;
    document.getElementById('agentModalBody').innerHTML = body;
    document.getElementById('agentModal').classList.add('show');
    lucide.createIcons();
  },

  closeModal() {
    document.getElementById('agentModal').classList.remove('show');
    this.selectedAgentId = null;
  },

  _collectInputs() {
    const a = _agentById(this.selectedAgentId);
    if (!a) return null;
    const out = {};
    for (const inp of a.inputs) {
      const el = document.getElementById(`agentInp_${inp.id}`);
      out[inp.id] = el ? el.value.trim() : '';
      if (inp.required && !out[inp.id]) {
        alert(`'${inp.label}' 항목은 필수입니다.`);
        return null;
      }
    }
    return { agent: a, values: out };
  },

  /* 프롬프트 미리보기 */
  preview() {
    const r = this._collectInputs();
    if (!r) return;
    const prompt = buildAgentPrompt(r.agent, r.values);
    const ta = document.createElement('textarea');
    ta.value = prompt;
    ta.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;opacity:0';
    document.body.appendChild(ta);
    document.body.removeChild(ta);
    // show in body area as preview
    const body = document.getElementById('agentModalBody');
    let pre = document.getElementById('agentPromptPreview');
    if (!pre) {
      pre = document.createElement('div');
      pre.id = 'agentPromptPreview';
      pre.style.cssText = 'margin-top:14px;padding:12px;background:var(--bg-tertiary);border-radius:6px;border:1px solid var(--border-color);max-height:280px;overflow:auto;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;white-space:pre-wrap;line-height:1.5';
      body.appendChild(pre);
    }
    pre.textContent = prompt;
  },

  /* 클립보드 복사 + 이력 저장 */
  async copyAndRun() {
    const r = this._collectInputs();
    if (!r) return;
    const prompt = buildAgentPrompt(r.agent, r.values);
    try {
      await navigator.clipboard.writeText(prompt);
      AgentLayer.saveRun(r.agent.id, r.values, prompt);
      AgentModule._toast(`✓ '${r.agent.name}' 프롬프트가 복사되었습니다. Cowork·Claude Code에 붙여넣으세요.`);
      // refresh card 'last run'
      if (typeof renderPage === 'function' && (typeof currentPage === 'undefined' || currentPage === 'agents')) {
        // close modal then re-render
        AgentModule.closeModal();
        renderPage();
      }
    } catch (e) {
      // fallback: select + copy
      const ta = document.createElement('textarea');
      ta.value = prompt;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); AgentModule._toast('✓ 프롬프트가 복사되었습니다.'); }
      catch { alert('복사 실패. 직접 선택해서 복사해주세요.'); }
      document.body.removeChild(ta);
      AgentLayer.saveRun(r.agent.id, r.values, prompt);
    }
  },

  /* SKILL.md로 다운로드 */
  exportSkill() {
    const r = this._collectInputs();
    if (!r) {
      // export with empty inputs (template)
      const a = _agentById(this.selectedAgentId);
      if (!a) return;
      const tplValues = {};
      a.inputs.forEach(inp => { tplValues[inp.id] = `{${inp.id}}`; });
      const skillMd = AgentModule._buildSkillMd(a, tplValues, true);
      AgentModule._download(`${a.id}.SKILL.md`, skillMd);
      return;
    }
    const skillMd = AgentModule._buildSkillMd(r.agent, r.values, false);
    AgentModule._download(`${r.agent.id}.SKILL.md`, skillMd);
  },

  _buildSkillMd(a, values, asTemplate) {
    const promptBody = buildAgentPrompt(a, values);
    return `---
name: ${a.id}
description: ${a.tagline}
---

# ${a.name}

${a.description}

## 입력 인자
${a.inputs.map(inp => `- **${inp.label}** (\`${inp.id}\`)${inp.required ? ' *필수*' : ''}: ${inp.placeholder || inp.default || ''}`).join('\n')}

## 프롬프트 ${asTemplate ? '(템플릿 - 중괄호 부분 치환)' : '(현재 입력값)'}

\`\`\`
${promptBody}
\`\`\`

## 저장 위치 권장
\`${a.vaultSavePath || VAULT_PATHS.root}\`
`;
  },

  _download(filename, text) {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  _toast(msg) {
    let t = document.getElementById('agentToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'agentToast';
      t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--bg-secondary);border:1px solid var(--accent);color:var(--text-primary);padding:10px 16px;border-radius:8px;box-shadow:var(--shadow-lg);z-index:9999;font-size:13px;max-width:80vw';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(AgentModule._toastTimer);
    AgentModule._toastTimer = setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; }, 2800);
  }
};

/* expose globally for inline onclick handlers */
window.AGENT_GROUPS = AGENT_GROUPS;
window.AGENT_REGISTRY = AGENT_REGISTRY;
window.AgentLayer = AgentLayer;
window.AgentModule = AgentModule;
window.VAULT_PATHS = VAULT_PATHS;
window.AGENT_RESULT_DIRS = AGENT_RESULT_DIRS;
window.buildAgentPrompt = buildAgentPrompt;
