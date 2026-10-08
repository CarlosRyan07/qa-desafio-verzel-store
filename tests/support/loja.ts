import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, type Locator, type Page } from '@playwright/test';

type CampoResumo = 'subtotal' | 'desconto' | 'frete' | 'total';

export function valorResumo(escopo: Page | Locator, campo: CampoResumo): Locator {
  return escopo.locator(`[data-valor="${campo}"]`);
}

export async function adicionar(page: Page, nome: string, vezes = 1) {
  const produto = page.locator('article').filter({ has: page.getByRole('heading', { name: nome, exact: true }) });
  for (let i = 0; i < vezes; i++) await produto.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
}

export async function abrirCarrinho(page: Page) {
  await page.getByRole('link', { name: /Carrinho/ }).click();
  await expect(page.getByRole('heading', { name: 'Resumo do pedido' })).toBeVisible();
}

export async function aplicarCupom(page: Page, codigo: string) {
  await page.getByRole('textbox', { name: 'Cupom de desconto' }).fill(codigo);
  await page.getByRole('button', { name: 'Aplicar cupom' }).click();
}

export async function removerCupom(page: Page) {
  await page.getByRole('button', { name: /Remover cupom/i }).click();
}

export async function abrirCheckout(page: Page) {
  await page.getByRole('link', { name: 'Finalizar compra' }).click();
}

export async function preencherCheckout(page: Page, dados: { nome: string; email: string; cep: string }) {
  await page.getByRole('textbox', { name: 'Nome completo' }).fill(dados.nome);
  await page.getByRole('textbox', { name: 'E-mail' }).fill(dados.email);
  await page.getByRole('textbox', { name: 'CEP' }).fill(dados.cep);
}

export async function captura(page: Page, id: string) {
  if (process.env.CAPTURE_EVIDENCE !== '1') return;
  const pasta = path.resolve('evidencias/ui');
  await mkdir(pasta, { recursive: true });
  await page.screenshot({ path: path.join(pasta, `${id}.png`), fullPage: true });
}
