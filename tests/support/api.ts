import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { APIRequestContext, TestInfo } from '@playwright/test';

export const cliente = {
  nome: 'Maria Silva',
  email: 'maria@example.com',
  cep: '01310-100',
};

export const item = (produtoId: string, quantidade = 1) => ({ produtoId, quantidade });

export async function chamarApi(
  request: APIRequestContext,
  testInfo: TestInfo,
  id: string,
  metodo: 'GET' | 'POST',
  endpoint: string,
  dados?: unknown,
) {
  const response = await request.fetch(endpoint, {
    method: metodo,
    ...(dados === undefined ? {} : { data: dados, headers: { 'Content-Type': 'application/json' } }),
  });
  const texto = await response.text();
  let corpo: unknown;
  try { corpo = JSON.parse(texto); } catch { corpo = texto; }
  const evidencia = {
    executadoEm: new Date().toISOString(),
    ferramenta: 'Playwright APIRequestContext',
    metodo,
    endpoint,
    url: response.url(),
    requisicao: dados ?? null,
    status: response.status(),
    contentType: response.headers()['content-type'] ?? null,
    resposta: corpo,
  };
  const json = JSON.stringify(evidencia, null, 2) + '\n';
  await testInfo.attach(`${id}-requisicao-resposta`, { body: Buffer.from(json), contentType: 'application/json' });
  if (process.env.CAPTURE_EVIDENCE === '1') {
    const pasta = path.resolve('evidencias/api');
    await mkdir(pasta, { recursive: true });
    await writeFile(path.join(pasta, `${id}.json`), json, 'utf8');
  }
  return { status: response.status(), corpo: corpo as Record<string, any> };
}
