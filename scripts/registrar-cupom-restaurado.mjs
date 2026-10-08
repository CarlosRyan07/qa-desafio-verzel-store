import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'https://verzel-store.qa-test-verzel-store.workers.dev';
const pasta = path.resolve('evidencias/exploratorios');
const browser = await chromium.launch();

try {
  await mkdir(pasta, { recursive: true });
  const page = await browser.newPage({ baseURL });
  await page.goto('/');
  const produto = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Camiseta Essencial', exact: true }) });
  await produto.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await page.getByRole('link', { name: /Carrinho/ }).click();
  await page.evaluate(() => sessionStorage.setItem('verzel-store:cupom', JSON.stringify('VERAO2026')));

  const respostaCalculo = page.waitForResponse(response =>
    response.url().endsWith('/api/carrinho/calcular') && response.request().postData()?.includes('VERAO2026') === true,
  );
  await page.reload();
  const calculo = await respostaCalculo;
  await page.getByText('Cupom VERAO2026 aplicado.').waitFor();
  const avisoCarrinho = await page.locator('.cupom-aplicado').innerText();
  await page.screenshot({ path: path.join(pasta, 'cupom-expirado-carrinho.png'), fullPage: true });

  await page.getByRole('link', { name: 'Finalizar compra' }).click();
  await page.getByRole('textbox', { name: 'Nome completo' }).fill('Maria Silva');
  await page.getByRole('textbox', { name: 'E-mail' }).fill('maria@example.com');
  await page.getByRole('textbox', { name: 'CEP' }).fill('01310-100');
  const respostaPedido = page.waitForResponse(response => response.url().endsWith('/api/pedidos') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();
  const pedido = await respostaPedido;
  await page.getByText('Cupom expirado.', { exact: true }).waitFor();
  const avisoCheckout = await page.getByText('Cupom expirado.', { exact: true }).innerText();
  await page.screenshot({ path: path.join(pasta, 'cupom-expirado-checkout.png'), fullPage: true });

  const registro = {
    executadoEm: new Date().toISOString(),
    fuso: 'America/Sao_Paulo (UTC−03:00)',
    executor: 'Script de verificação com Playwright/Chromium',
    ambiente: baseURL,
    massa: { produtoId: 'P001', quantidade: 1, cupomRestaurado: 'VERAO2026', cliente: { nome: 'Maria Silva', email: 'maria@example.com', cep: '01310-100' } },
    preparacao: "sessionStorage.setItem('verzel-store:cupom', JSON.stringify('VERAO2026')) seguido de recarga",
    esperado: 'Cupom expirado não deve aparecer como aplicado; desconto zero; pedido rejeitado com CUPOM_EXPIRADO.',
    observado: {
      calculo: { metodo: calculo.request().method(), url: calculo.url(), requisicao: calculo.request().postDataJSON(), status: calculo.status(), resposta: await calculo.json() },
      carrinho: avisoCarrinho,
      pedido: { metodo: pedido.request().method(), url: pedido.url(), requisicao: pedido.request().postDataJSON(), status: pedido.status(), resposta: await pedido.json() },
      checkout: avisoCheckout,
    },
    evidencias: ['cupom-expirado-carrinho.png', 'cupom-expirado-checkout.png'],
  };
  assert.equal(registro.observado.calculo.status, 200);
  assert.equal(registro.observado.calculo.resposta.cupom.aplicado, false);
  assert.equal(registro.observado.calculo.resposta.desconto, 0);
  assert.match(avisoCarrinho, /VERAO2026 aplicado\./);
  assert.equal(registro.observado.pedido.status, 422);
  assert.equal(registro.observado.pedido.resposta.erro.codigo, 'CUPOM_EXPIRADO');
  registro.resultado = 'Inconsistência de interface reproduzida no estado de sessão simulado; API não aplicou desconto e rejeitou o pedido.';
  await writeFile(path.join(pasta, 'cupom-expirado-respostas.json'), JSON.stringify(registro, null, 2) + '\n', 'utf8');
  console.log('Exploração registrada: cupom expirado anunciado no carrinho, sem desconto e com pedido rejeitado.');
} finally {
  await browser.close();
}
