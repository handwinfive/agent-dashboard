// One-shot script: read agents.js text and execute in a way that captures const exports
// (then writes skills/<id>/SKILL.md)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const code = fs.readFileSync('agents.js', 'utf8');

// Wrap to expose top-level consts via `this`
const wrapped = `
  const localStorage = { getItem: () => null, setItem(){}, removeItem(){} };
  const document = { getElementById: () => null };
  const navigator = {};
  ${code}
  this.__OUT__ = { AGENT_GROUPS, AGENT_REGISTRY, VAULT_PATHS };
`;

const sandbox = { console, window: {} };
vm.createContext(sandbox);
vm.runInContext(wrapped, sandbox);

const { AGENT_GROUPS, AGENT_REGISTRY, VAULT_PATHS } = sandbox.__OUT__;

console.log('Groups:', AGENT_GROUPS.length, 'Agents:', AGENT_REGISTRY.length);

const skillsDir = 'skills';
fs.mkdirSync(skillsDir, { recursive: true });

for (const a of AGENT_REGISTRY) {
  const agentDir = path.join(skillsDir, a.id);
  fs.mkdirSync(agentDir, { recursive: true });

  const tplValues = {};
  a.inputs.forEach(inp => { tplValues[inp.id] = '{' + inp.id + '}'; });
  const promptTemplate = a.buildPrompt(tplValues);

  const inputsList = a.inputs.map(inp => {
    const req = inp.required ? ' *(필수)*' : '';
    const defaultStr = inp.default ? ` · 기본값: \`${inp.default}\`` : '';
    const optStr = inp.options ? ` · 옵션: ${inp.options.join(', ')}` : '';
    return `- \`${inp.id}\` — ${inp.label}${req}${defaultStr}${optStr}\n  - 타입: ${inp.type}${inp.placeholder ? ' / 예시: ' + inp.placeholder : ''}`;
  }).join('\n');

  const group = AGENT_GROUPS.find(g => g.id === a.groupId);

  const skill = `---
name: ${a.id}
description: ${a.tagline}
group: ${a.groupId}
group_name: ${group ? group.name : ''}
---

# ${a.name}

${a.description}

## 그룹
**${group ? group.name : a.groupId}** — ${group ? group.description : ''}

## 입력 인자
${inputsList}

## Vault 저장 권장 위치
\`${a.vaultSavePath || VAULT_PATHS.root}\`

## 출력 형식
${a.outputHint}

## 프롬프트 템플릿

이 스킬을 호출할 때, 위 입력 인자(\`{id}\` 형태)를 실제 값으로 치환한 뒤 다음 프롬프트를 사용한다.

\`\`\`
${promptTemplate}
\`\`\`
`;

  fs.writeFileSync(path.join(agentDir, 'SKILL.md'), skill);
  console.log('  ✓', a.id);
}

console.log('Done. skills/ 디렉토리에 ' + AGENT_REGISTRY.length + '개 SKILL.md 생성됨.');
