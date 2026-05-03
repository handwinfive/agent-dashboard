# Agent Workbench

손승오 (KRRI) 의 업무지원 대시보드. 단일 HTML 페이지(`index.html`)와 에이전트 레지스트리(`agents.js`), 그리고 Cowork·Claude Code에 설치 가능한 7개 SKILL 파일(`skills/`)로 구성됩니다.

> 2026-05-03: 투자 관련 에이전트(투자분석 / 투자현황 브리핑)는 별도 운영 방식 정리 후 재추가 예정으로 본 대시보드에서 제외되었습니다. (투자 브리핑은 주로 아이폰 Claude 채팅으로 운영 — 파일 시스템 자동 동기화 어려움)

---

## 🚀 빠른 시작

### Mac/Windows 양쪽에서 자유롭게 사용하려면

GitHub 동기화 기반이므로, 두 OS에서 **동일한 상대 경로**에 클론해두는 게 깔끔합니다.

```bash
# Mac
mkdir -p ~/Projects
cd ~/Projects
git clone https://github.com/handwinfive/agent-dashboard.git
cd agent-dashboard

# Windows (PowerShell)
mkdir $HOME\Projects
cd $HOME\Projects
git clone https://github.com/handwinfive/agent-dashboard.git
cd agent-dashboard
```

> **권장 위치**: `~/Projects/agent-dashboard`
>
> - Mac · Windows 공통 컨벤션 (홈 폴더 아래 `Projects`)
> - **Vault(`~/Vaults/MyVault`) 안에 두지 말 것** — Obsidian Git 플러그인의 10분 자동 커밋과 충돌
> - **클라우드 동기화 폴더(iCloud/OneDrive/Dropbox) 안에 두지 말 것** — `.git/` 권한·심볼릭 링크 문제로 깨짐

### 사용 흐름 (양 OS 공통)

```bash
# 작업 시작 전
git pull

# 브라우저로 열기
open index.html      # macOS
start index.html     # Windows
```

작업 후:

```bash
git add .
git commit -m "feat: ..."
git push
```

다른 OS에서 `git pull` 만 하면 됩니다.

---

## 🧱 구성

```
agent-dashboard/
├── index.html          ← 단일 페이지 대시보드 (다크/라이트, 사이드바, 모듈)
├── agents.js           ← 9개 에이전트 정의 + AgentModule(UI) + AgentLayer(로컬스토리지)
├── skills/             ← Cowork/Claude Code에 설치 가능한 SKILL.md 7개
│   ├── research-collector/SKILL.md
│   ├── paper-writer/SKILL.md
│   ├── simulation-research/SKILL.md
│   ├── proposal-writer/SKILL.md
│   ├── presentation-builder/SKILL.md
│   ├── work-report-writer/SKILL.md
│   └── performance-tracker/SKILL.md
├── _gen_skills.cjs     ← agents.js → SKILL.md 자동 재생성 (수정 후 `node _gen_skills.cjs`)
└── README.md
```

대시보드는 백엔드 없이 100% 클라이언트사이드입니다 (`localStorage` 기반).

---

## 🤖 에이전트 (2그룹 × 7개)

### 연구 / 논문
| ID | 이름 | 한 줄 |
|---|---|---|
| `research-collector`   | 자료조사 에이전트       | 주제 → 핵심 자료·논문 요약 |
| `paper-writer`         | 논문작성 에이전트       | 아이디어 → 논문 섹션 학술 초안 |
| `simulation-research`  | 시뮬레이션 연구 에이전트 | SFM · 디지털 트윈 연구 보조 |

### 업무
| ID | 이름 | 한 줄 |
|---|---|---|
| `proposal-writer`       | 기획서 작성 에이전트     | 주제 → KRRI 톤 기획서 초안 |
| `presentation-builder`  | 발표자료 작성 에이전트   | 주제 → pptx 슬라이드 구조 |
| `work-report-writer`    | 업무보고 작성 에이전트   | 기간 + 작업 → 보고문 정리 |
| `performance-tracker`   | 개인실적관리 에이전트    | 누적 실적 → 미국 포지션 트랙 점검 |

---

## 🔄 에이전트 사용 흐름

대시보드는 순수 브라우저 SPA이므로 Agent SDK를 직접 호출하지 않고, **프롬프트 생성 → 클립보드 복사** 방식으로 Cowork·Claude Code와 연계합니다.

1. 사이드바에서 **에이전트** 메뉴 클릭
2. 원하는 에이전트 카드 클릭 → 입력 폼 모달 열림
3. 입력값 채우기
4. 하단 버튼 선택:
   - **프롬프트 미리보기** — 생성될 프롬프트 확인
   - **SKILL.md 내보내기** — 입력값이 채워진 스킬 파일 다운로드
   - **프롬프트 복사 + 실행** — 클립보드에 복사 (Cowork·Claude Code에 붙여넣어 사용)
5. 실행 이력은 자동으로 로컬에 저장됨 (홈 화면 / 에이전트 페이지에서 최근 실행 확인)

### 빠른 명령 (홈 화면)

홈의 자연어 입력창에 키워드를 치면 매칭되는 에이전트가 자동으로 열립니다.

| 키워드 | 매칭되는 에이전트 |
|---|---|
| 논문 / paper / abstract | `paper-writer` |
| 자료조사 / 리서치 / 선행연구 | `research-collector` |
| 시뮬레이션 / sfm / digital twin | `simulation-research` |
| 기획서 / 과제 기획 / rfp | `proposal-writer` |
| 발표 / 슬라이드 / pptx | `presentation-builder` |
| 주간 보고 / 업무 보고 | `work-report-writer` |
| 실적 / cv / 갭 분석 | `performance-tracker` |

---

## 📁 Vault 연동 정책

- 모든 에이전트의 프롬프트는 **CLAUDE.md(`~/Vaults/MyVault/CLAUDE.md`) 규약**을 컨텍스트 헤더로 포함합니다.
- Vault 표준 경로 (`agents.js` 의 `VAULT_PATHS`, 실제 Vault 구조 기준):
  - 데일리/주간: `02.Area/B. 일정관리/`
  - 연구 프로젝트: `01.Project/A. (국가R&D) 환승역사/`
  - 논문연구: `02.Area/A. 논문연구 주제 정리/`
  - 읽은 자료: `03.Resource/`
  - 첨부파일: `04.Archive/Attachments/`
- Cowork·Claude Code에서 프롬프트 실행 시, 이 경로들이 자동으로 참조됩니다.

### 🔄 결과 파일 자동 인식 (양방향)

각 에이전트의 프롬프트 끝에 **결과 파일 frontmatter 규약**이 자동으로 포함됩니다. Cowork·Claude Code가 결과를 `.md`로 저장할 때 다음 frontmatter를 포함하면, 대시보드가 자동으로 인식합니다.

```yaml
---
agent: paper-writer
created: 2026-05-03
title: 논문 초안 — 대심도 보행자 SFM
inputs_summary: introduction · 한국어
tags: [agent-result]
---
```

**스캔 폴더** (`AGENT_RESULT_DIRS`):
- `01.Project/`
- `02.Area/A. 논문연구 주제 정리/`
- `02.Area/B. 일정관리/`
- `03.Resource/`

대시보드에서 **볼트 연결**을 클릭하면 위 폴더들을 재귀(depth 3) 스캔하여 frontmatter에 `agent: <id>` 가 있는 파일을 결과로 인식하고, 다음 위젯에 표시합니다:

- **홈 화면**: "최근 에이전트 결과" 카드 (최신 8개) + 상단 요약 카드(에이전트 결과 누적)
- **에이전트 모달**: 해당 에이전트의 결과 파일 최신 5개 (제목 · 날짜 · 미리보기)

> 결과 파일은 대시보드가 직접 만들지 않습니다. Cowork/Claude Code에서 사용자가 프롬프트를 실행한 결과를 Vault에 저장하면, Obsidian Git이 동기화한 후 대시보드가 표시합니다.

---

## 🛠️ 에이전트 추가·수정

1. `agents.js` 의 `AGENT_REGISTRY` 배열에 새 객체 추가 (또는 기존 객체 수정)
2. 필수 필드: `id`, `groupId`, `name`, `icon`, `tagline`, `description`, `inputs`, `outputHint`, `vaultSavePath`, `buildPrompt(values)`
3. SKILL.md 재생성:
   ```bash
   node _gen_skills.cjs
   ```
4. 브라우저 새로고침 → 카드 즉시 반영

---

## 🔧 기술 스택

- 순수 HTML/CSS/JS (외부 빌드 없음)
- [Lucide Icons](https://lucide.dev) (CDN)
- [SortableJS](https://github.com/SortableJS/Sortable) (CDN, Kanban용)
- 데이터: 브라우저 `localStorage` (`agent_workbench_*` 키)

---

## 🗒️ 커밋 메시지 컨벤션 (선택)

```
feat:    새 기능 추가
fix:     버그 수정
chore:   리팩터·문서·설정 등
agent:   에이전트 정의 추가/수정 (agents.js, skills/)
ui:      대시보드 UI 변경 (index.html)
```
