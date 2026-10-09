import { expect, test, type Locator, type Page } from '@playwright/test';
import { adicionar, abrirCarrinho, abrirCheckout, aplicarCupom, preencherCheckout, valorResumo } from '../support/loja';

async function esperarLayoutSemRolagemHorizontal(page: Page) {
  const largura = await page.evaluate(() => ({
    larguraPagina: document.documentElement.scrollWidth,
    larguraTela: document.documentElement.clientWidth,
  }));
  expect(
    largura.larguraPagina,
    `A página excedeu a largura da tela: ${largura.larguraPagina}px > ${largura.larguraTela}px`,
  ).toBeLessThanOrEqual(largura.larguraTela + 1);
}

async function esperarControleAlcancavel(controle: Locator) {
  await expect(controle).toBeVisible();
  await controle.scrollIntoViewIfNeeded();
  await expect(controle).toBeInViewport();
}

test('MOB-01 vitrine e carrinho permanecem utilizáveis', async ({ page }) => {
  await page.goto('/');
  await esperarLayoutSemRolagemHorizontal(page);
  await adicionar(page, 'Camiseta Essencial');
  await abrirCarrinho(page);

  const aumentarQuantidade = page.getByRole('button', { name: 'Aumentar quantidade de Camiseta Essencial' });
  const finalizarCompra = page.getByRole('link', { name: 'Finalizar compra' });
  await expect(aumentarQuantidade).toBeVisible();
  await expect(aumentarQuantidade).toBeInViewport();
  await expect(valorResumo(page, 'total')).toHaveText('R$ 79,80');
  await esperarControleAlcancavel(finalizarCompra);
  await esperarLayoutSemRolagemHorizontal(page);
});

test('MOB-02 cupom e checkout permanecem acessíveis', async ({ page }) => {
  await page.goto('/');
  await adicionar(page, 'Mochila Urbana 20L');
  await abrirCarrinho(page);
  await aplicarCupom(page, 'BEMVINDO10');
  await expect(valorResumo(page, 'total')).toHaveText('R$ 109,90');

  await abrirCheckout(page);
  await preencherCheckout(page, {
    nome: 'Maria Silva',
    email: 'maria@example.com',
    cep: '01310-100',
  });

  for (const campo of ['Nome completo', 'E-mail', 'CEP']) {
    const campoCheckout = page.getByRole('textbox', { name: campo });
    await expect(campoCheckout).toBeVisible();
    await expect(campoCheckout).toBeInViewport();
  }
  const confirmarPedido = page.getByRole('button', { name: 'Confirmar pedido' });
  await esperarControleAlcancavel(confirmarPedido);
  await esperarLayoutSemRolagemHorizontal(page);
});

test('MOB-03 mensagens de validação continuam visíveis', async ({ page }) => {
  await page.goto('/');
  await adicionar(page, 'Camiseta Essencial');
  await abrirCarrinho(page);
  await abrirCheckout(page);
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();

  for (const mensagem of ['Informe o nome completo.', 'Informe o e-mail.', 'Informe o CEP.']) {
    const mensagemValidacao = page.getByText(mensagem, { exact: true });
    await expect(mensagemValidacao).toBeVisible();
    await expect(mensagemValidacao).toBeInViewport();
  }
  await expect(page).toHaveURL(/\/checkout$/);
  await esperarLayoutSemRolagemHorizontal(page);
});
