import { test, expect } from '@playwright/test';
import { adicionar, abrirCarrinho, abrirCheckout, aplicarCupom, captura, preencherCheckout, removerCupom, valorResumo } from '../support/loja';

test('UI-01 CA01 CA02 CA05 CA09 aplicar e remover cupom', async ({ page }) => {
  await page.goto('/');
  await adicionar(page, 'Mochila Urbana 20L');
  await abrirCarrinho(page);
  await aplicarCupom(page, '  bemvindo10  ');
  await expect(valorResumo(page, 'desconto')).toHaveText('- R$ 10,00');
  await expect(valorResumo(page, 'frete')).toHaveText('R$ 19,90');
  await expect(valorResumo(page, 'total')).toHaveText('R$ 109,90');
  await expect(page.getByRole('textbox', { name: 'Cupom de desconto' })).toHaveCount(0);
  await captura(page, 'UI-01-cupom-aplicado');
  await removerCupom(page);
  await expect(valorResumo(page, 'desconto')).toHaveText('R$ 0,00');
  await expect(valorResumo(page, 'total')).toHaveText('R$ 119,90');
  await expect(page.getByRole('textbox', { name: 'Cupom de desconto' })).toBeVisible();
  await captura(page, 'UI-01-cupom-removido');
  await aplicarCupom(page, 'BEMVINDO10');
  await expect(valorResumo(page, 'desconto')).toHaveText('- R$ 10,00');
  await expect(valorResumo(page, 'total')).toHaveText('R$ 109,90');
  await captura(page, 'UI-01-cupom-reaplicado');
  await removerCupom(page);
  await aplicarCupom(page, 'INEXISTENTE');
  await expect(page.getByText('Cupom inválido.', { exact: true })).toBeVisible();
  await expect(valorResumo(page, 'desconto')).toHaveText('R$ 0,00');
  await expect(valorResumo(page, 'total')).toHaveText('R$ 119,90');
  await captura(page, 'UI-01-cupom-substituto-rejeitado');
});

test('UI-02 CA06 subtotal 200,00 exibe frete grátis', async ({ page }) => {
  await page.goto('/');
  await adicionar(page, 'Mochila Urbana 20L', 2);
  await abrirCarrinho(page);
  await expect(valorResumo(page, 'subtotal')).toHaveText('R$ 200,00');
  await expect(valorResumo(page, 'frete')).toBeVisible();
  await captura(page, 'UI-02-frete-limite');
  await expect(valorResumo(page, 'frete')).toHaveText(/Grátis|R\$ 0,00/);
  await expect(valorResumo(page, 'total')).toHaveText('R$ 200,00');
});

test('UI-03 CA10 interface bloqueia a sexta unidade', async ({ page }) => {
  await page.goto('/');
  await adicionar(page, 'Camiseta Essencial', 5);
  const produto = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Camiseta Essencial' }) });
  await expect(produto.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeDisabled();
  await abrirCarrinho(page);
  await expect(page.getByRole('button', { name: 'Aumentar quantidade de Camiseta Essencial' })).toBeDisabled();
  await expect(valorResumo(page, 'subtotal')).toHaveText('R$ 299,50');
  await captura(page, 'UI-03-limite-cinco');
});

test('UI-04 checkout válido confirma pedido com valores calculados', async ({ page }) => {
  await page.goto('/');
  await adicionar(page, 'Mochila Urbana 20L');
  await abrirCarrinho(page);
  await aplicarCupom(page, 'BEMVINDO10');
  await expect(valorResumo(page, 'total')).toHaveText('R$ 109,90');
  await abrirCheckout(page);
  await preencherCheckout(page, { nome: 'Maria Silva', email: 'maria@example.com', cep: '01310-100' });
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();
  const confirmacao = page.locator('main .confirmacao');
  await expect(confirmacao.getByRole('heading', { level: 1 })).toHaveText(/^Pedido VZ-\d{6}$/);
  await expect(valorResumo(confirmacao, 'subtotal')).toHaveText('R$ 100,00');
  await expect(valorResumo(confirmacao, 'desconto')).toHaveText('- R$ 10,00');
  await expect(valorResumo(confirmacao, 'frete')).toHaveText('R$ 19,90');
  await expect(valorResumo(confirmacao, 'total')).toHaveText('R$ 109,90');
  await expect(confirmacao.locator('.resumo-itens')).toContainText('1x Mochila Urbana 20L');
  await captura(page, 'UI-04-pedido-confirmado');
  await page.goto('/carrinho');
  await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible();
  await captura(page, 'UI-04-carrinho-apos-pedido');
});

for (const caso of [
  { id: 'UI-07', nome: '😀 😃', descricao: 'nome composto apenas por emojis' },
  { id: 'UI-08', nome: 'Jorge !@', descricao: 'sobrenome composto apenas por símbolos' },
]) {
  test(`${caso.id} checkout rejeita ${caso.descricao}`, async ({ page }) => {
    await page.goto('/');
    await adicionar(page, 'Camiseta Essencial');
    await abrirCarrinho(page);
    await abrirCheckout(page);
    await preencherCheckout(page, { nome: caso.nome, email: 'qa.exploratorio@example.com', cep: '01310-100' });
    await captura(page, `${caso.id}-nome-invalido-entrada`);
    await page.getByRole('button', { name: 'Confirmar pedido' }).click();
    await page.waitForFunction(() =>
      document.body.innerText.includes('Informe nome e sobrenome.') || /Pedido VZ-\d{6}/.test(document.body.innerText),
    );
    await captura(page, `${caso.id}-nome-invalido-confirmacao`);
    await expect(page.getByText('Informe nome e sobrenome.')).toBeVisible({ timeout: 1000 });
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.locator('main .confirmacao')).toHaveCount(0);
  });
}

test('UI-10 checkout vazio exige nome, e-mail e CEP sem enviar pedido', async ({ page }) => {
  await page.goto('/');
  await adicionar(page, 'Camiseta Essencial');
  await abrirCarrinho(page);
  await abrirCheckout(page);
  let pedidosEnviados = 0;
  page.on('request', request => {
    if (new URL(request.url()).pathname === '/api/pedidos') pedidosEnviados++;
  });
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();
  for (const mensagem of ['Informe o nome completo.', 'Informe o e-mail.', 'Informe o CEP.']) {
    await expect(page.getByText(mensagem, { exact: true })).toBeVisible();
  }
  await expect(page).toHaveURL(/\/checkout$/);
  expect(pedidosEnviados).toBe(0);
  await captura(page, 'UI-10-checkout-vazio');
});

for (const caso of [
  { id: 'UI-11', campo: 'E-mail', valor: 'email-invalido', mensagem: 'Informe um e-mail válido.' },
  { id: 'UI-12', campo: 'CEP', valor: '123', mensagem: 'Informe um CEP com 8 dígitos.' },
]) {
  test(`${caso.id} checkout rejeita ${caso.campo} inválido isoladamente`, async ({ page }) => {
    await page.goto('/');
    await adicionar(page, 'Camiseta Essencial');
    await abrirCarrinho(page);
    await abrirCheckout(page);
    await preencherCheckout(page, { nome: 'Maria Silva', email: 'maria@example.com', cep: '01310-100' });
    await page.getByRole('textbox', { name: caso.campo }).fill(caso.valor);
    let pedidosEnviados = 0;
    page.on('request', request => {
      if (new URL(request.url()).pathname === '/api/pedidos') pedidosEnviados++;
    });
    await page.getByRole('button', { name: 'Confirmar pedido' }).click();
    await expect(page.getByText(caso.mensagem, { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/checkout$/);
    expect(pedidosEnviados).toBe(0);
    await captura(page, `${caso.id}-checkout-invalido`);
  });
}

test('UI-13 CA07 subtotal 199,90 cobra frete e informa faltante 0,10', async ({ page }) => {
  await page.goto('/');
  await adicionar(page, 'Boné Aba Curva');
  await adicionar(page, 'Mochila Urbana 20L');
  await adicionar(page, 'Garrafa Térmica 750ml');
  await abrirCarrinho(page);
  await expect(valorResumo(page, 'subtotal')).toHaveText('R$ 199,90');
  await expect(valorResumo(page, 'frete')).toHaveText('R$ 19,90');
  await expect(valorResumo(page, 'total')).toHaveText('R$ 219,80');
  await expect(page.getByText('Faltam R$ 0,10 para o frete grátis.')).toBeVisible();
  await captura(page, 'UI-13-frete-abaixo-limite');
});

test('UI-14 CA08 desconto não remove frete grátis de subtotal 219,80', async ({ page }) => {
  await page.goto('/');
  await adicionar(page, 'Tênis Casual Urbano');
  await adicionar(page, 'Kit 3 Pares de Meias');
  await abrirCarrinho(page);
  await expect(valorResumo(page, 'subtotal')).toHaveText('R$ 219,80');
  await expect(valorResumo(page, 'frete')).toHaveText('Grátis');
  await aplicarCupom(page, 'BEMVINDO10');
  await expect(valorResumo(page, 'desconto')).toHaveText('- R$ 21,98');
  await expect(valorResumo(page, 'frete')).toHaveText('Grátis');
  await expect(valorResumo(page, 'total')).toHaveText('R$ 197,82');
  await captura(page, 'UI-14-frete-antes-desconto');
});

test('UI-15 CA07 CA08 frete recalcula ao cruzar o limite nos dois sentidos', async ({ page }) => {
  await page.goto('/');
  await adicionar(page, 'Calça Jeans Slim');
  await adicionar(page, 'Camiseta Essencial');
  await abrirCarrinho(page);
  await aplicarCupom(page, 'BEMVINDO10');
  await expect(valorResumo(page, 'subtotal')).toHaveText('R$ 199,80');
  await expect(valorResumo(page, 'desconto')).toHaveText('- R$ 19,98');
  await expect(valorResumo(page, 'frete')).toHaveText('R$ 19,90');
  await expect(valorResumo(page, 'total')).toHaveText('R$ 199,72');
  await captura(page, 'UI-15-frete-antes-limite');
  await page.getByRole('button', { name: 'Aumentar quantidade de Camiseta Essencial' }).click();
  await expect(valorResumo(page, 'subtotal')).toHaveText('R$ 259,70');
  await expect(valorResumo(page, 'desconto')).toHaveText('- R$ 25,97');
  await expect(valorResumo(page, 'frete')).toHaveText('Grátis');
  await expect(valorResumo(page, 'total')).toHaveText('R$ 233,73');
  await captura(page, 'UI-15-frete-apos-aumentar');
  await page.getByRole('button', { name: 'Diminuir quantidade de Camiseta Essencial' }).click();
  await expect(valorResumo(page, 'subtotal')).toHaveText('R$ 199,80');
  await expect(valorResumo(page, 'desconto')).toHaveText('- R$ 19,98');
  await expect(valorResumo(page, 'frete')).toHaveText('R$ 19,90');
  await expect(valorResumo(page, 'total')).toHaveText('R$ 199,72');
  await captura(page, 'UI-15-frete-apos-diminuir');
});

test('UI-09 recalcula desconto e total ao aumentar e diminuir a quantidade', async ({ page }) => {
  await page.goto('/');
  await adicionar(page, 'Camiseta Essencial');
  await abrirCarrinho(page);
  await aplicarCupom(page, 'BEMVINDO10');
  await expect(valorResumo(page, 'subtotal')).toHaveText('R$ 59,90');
  await expect(valorResumo(page, 'desconto')).toHaveText('- R$ 5,99');
  await expect(valorResumo(page, 'total')).toHaveText('R$ 73,81');
  await page.getByRole('button', { name: 'Aumentar quantidade de Camiseta Essencial' }).click();
  await expect(valorResumo(page, 'subtotal')).toHaveText('R$ 119,80');
  await expect(valorResumo(page, 'desconto')).toHaveText('- R$ 11,98');
  await expect(valorResumo(page, 'total')).toHaveText('R$ 127,72');
  await captura(page, 'UI-09-quantidade-dois');
  await page.getByRole('button', { name: 'Diminuir quantidade de Camiseta Essencial' }).click();
  await expect(valorResumo(page, 'subtotal')).toHaveText('R$ 59,90');
  await expect(valorResumo(page, 'desconto')).toHaveText('- R$ 5,99');
  await expect(valorResumo(page, 'total')).toHaveText('R$ 73,81');
  await captura(page, 'UI-09-quantidade-recalculada');
});

for (const caso of [
  { id: 'UI-05', cupom: 'INEXISTENTE', mensagem: 'Cupom inválido.' },
  { id: 'UI-06', cupom: 'VERAO2026', mensagem: 'Cupom expirado.' },
]) {
  test(`${caso.id} CA03 CA04 cupom rejeitado informa motivo e não desconta`, async ({ page }) => {
    await page.goto('/');
    await adicionar(page, 'Mochila Urbana 20L');
    await abrirCarrinho(page);
    await aplicarCupom(page, caso.cupom);
    await expect(page.getByText(caso.mensagem, { exact: true })).toBeVisible();
    await expect(valorResumo(page, 'desconto')).toHaveText('R$ 0,00');
    await expect(valorResumo(page, 'total')).toHaveText('R$ 119,90');
    await captura(page, `${caso.id}-cupom-rejeitado`);
  });
}
