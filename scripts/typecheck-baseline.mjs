#!/usr/bin/env node
/**
 * Typecheck com baseline.
 *
 * Roda `tsc --noEmit` e compara os erros atuais com um baseline congelado
 * (scripts/typecheck-baseline.json). O objetivo e permitir que o pipeline
 * fique verde com a divida de tipos ja existente, mas FALHE assim que um
 * erro NOVO for introduzido. A divida vai sendo paga em tickets separados.
 *
 * Uso:
 *   node scripts/typecheck-baseline.mjs            -> valida contra o baseline
 *   node scripts/typecheck-baseline.mjs --update   -> regrava o baseline atual
 *
 * A assinatura de cada erro ignora numero de linha/coluna, entao pequenas
 * edicoes (que so deslocam linhas) nao quebram o baseline; apenas erros
 * genuinamente novos quebram.
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = join(__dirname, 'typecheck-baseline.json');
const update = process.argv.includes('--update');

function runTsc() {
  try {
    execSync('npx tsc --noEmit --pretty false', {
      cwd: join(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
    });
    return { output: '', failed: false };
  } catch (err) {
    return { output: `${err.stdout || ''}${err.stderr || ''}`, failed: true, reason: err.message };
  }
}

// Extrai assinatura estavel: caminho + codigo TS + mensagem (sem linha/coluna).
function parse(output) {
  const re = /^(.+?)\((\d+),(\d+)\):\s+(error\s+TS\d+):\s+(.*)$/;
  const counts = new Map();
  for (const line of output.split(/\r?\n/)) {
    const m = line.match(re);
    if (!m) continue;
    const file = m[1].replace(/\\/g, '/');
    const sig = `${file} | ${m[4]} | ${m[5]}`;
    counts.set(sig, (counts.get(sig) || 0) + 1);
  }
  return counts;
}

const { output, failed, reason } = runTsc();
const current = parse(output);

// A crashed compiler or project-level diagnostic is not a clean typecheck.
// Only file diagnostics can be compared with the legacy baseline.
if (failed && (current.size === 0 || /^error TS\d+:/m.test(output))) {
  console.error(output || reason || 'TypeScript failed without diagnostics.');
  process.exit(1);
}

if (update) {
  const obj = Object.fromEntries([...current.entries()].sort());
  writeFileSync(BASELINE_PATH, JSON.stringify(obj, null, 2) + '\n');
  const total = [...current.values()].reduce((a, b) => a + b, 0);
  console.log(`Baseline atualizado: ${current.size} assinaturas, ${total} erros.`);
  process.exit(0);
}

if (!existsSync(BASELINE_PATH)) {
  console.error('Baseline nao encontrado. Rode: npm run typecheck:update-baseline');
  process.exit(2);
}

const baseline = new Map(Object.entries(JSON.parse(readFileSync(BASELINE_PATH, 'utf8'))));

const novos = [];
for (const [sig, count] of current.entries()) {
  const base = baseline.get(sig) || 0;
  if (count > base) novos.push(`  + (${count - base}x novo) ${sig}`);
}

const totalAtual = [...current.values()].reduce((a, b) => a + b, 0);
const totalBase = [...baseline.values()].reduce((a, b) => a + b, 0);

if (novos.length > 0) {
  console.error('\nTypecheck FALHOU: erros de tipo NOVOS (fora do baseline):\n');
  console.error(novos.join('\n'));
  console.error(`\nTotal atual: ${totalAtual} | baseline: ${totalBase}`);
  console.error('Corrija os erros novos ou, se forem esperados, atualize o baseline.');
  process.exit(1);
}

console.log(`Typecheck OK. Nenhum erro novo. (${totalAtual} erros conhecidos no baseline)`);
process.exit(0);
