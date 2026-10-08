import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

async function markdowns(dir) {
  const arquivos = [];
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    if (entrada.name === 'node_modules' || entrada.name === 'playwright-report' || entrada.name === 'test-results' || entrada.name === '.git') continue;
    const caminho = path.join(dir, entrada.name);
    if (entrada.isDirectory()) arquivos.push(...await markdowns(caminho));
    else if (entrada.name.endsWith('.md')) arquivos.push(caminho);
  }
  return arquivos;
}

let erros = 0;
for (const arquivo of await markdowns(process.cwd())) {
  const conteudo = await readFile(arquivo, 'utf8');
  for (const [, link] of conteudo.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^(https?:|mailto:)/.test(link)) continue;
    const alvo = path.resolve(path.dirname(arquivo), decodeURIComponent(link.split('#')[0]));
    try { await stat(alvo); }
    catch { console.error(`${path.relative(process.cwd(), arquivo)}: link inexistente: ${link}`); erros++; }
  }
}
if (erros) process.exitCode = 1;
else console.log('Links locais Markdown válidos.');
