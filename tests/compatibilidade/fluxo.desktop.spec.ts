import { expect, test } from '@playwright/test';
import { adicionar, abrirCarrinho, abrirCheckout, aplicarCupom, preencherCheckout, valorResumo } from '../support/loja';

test('COMP-01 fluxo principal funciona no navegador', async ({ page }) => {
  await page.goto('/');
  await adicionar(page, 'Mochila Urbana 20L');
  await abrirCarrinho(page);
  await aplicarCupom(page, 'BEMVINDO10');

  await expect(valorResumo(page, 'desconto')).toHaveText('- R$ 10,00');
  await expect(valorResumo(page, 'total')).toHaveText('R$ 109,90');

  await abrirCheckout(page);
  await preencherCheckout(page, {
    nome: 'Maria Silva',
    email: 'maria@example.com',
    cep: '01310-100',
  });

  await expect(page.getByRole('textbox', { name: 'Nome completo' })).toHaveValue('Maria Silva');
  await expect(page.getByRole('textbox', { name: 'E-mail' })).toHaveValue('maria@example.com');
  await expect(page.getByRole('textbox', { name: 'CEP' })).toHaveValue('01310-100');
  await expect(page.getByRole('button', { name: 'Confirmar pedido' })).toBeVisible();
});
