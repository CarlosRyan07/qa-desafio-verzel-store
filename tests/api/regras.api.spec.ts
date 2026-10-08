import { test, expect } from '@playwright/test';
import { chamarApi, cliente, item } from '../support/api';

test('API-01 catálogo e preço dos produtos documentados', async ({ request }, info) => {
  const r = await chamarApi(request, info, 'API-01', 'GET', '/api/produtos');
  expect(r.status).toBe(200);
  expect(r.corpo).toHaveLength(8);
  expect(Object.fromEntries((r.corpo as unknown as { id: string; preco: number }[]).map(p => [p.id, p.preco]))).toEqual({
    P001: 59.9, P002: 139.9, P003: 189.9, P004: 49.9,
    P005: 100, P006: 29.9, P007: 229.9, P008: 50,
  });
});

test('API-02 CA01 CA09 cupom desconta produtos, sem descontar frete', async ({ request }, info) => {
  const r = await chamarApi(request, info, 'API-02', 'POST', '/api/carrinho/calcular', { itens: [item('P005')], cupom: 'BEMVINDO10' });
  expect(r.status).toBe(200);
  expect(r.corpo).toMatchObject({ subtotal: 100, desconto: 10, frete: 19.9, freteGratis: false, valorFaltanteFreteGratis: 100, total: 109.9, cupom: { codigo: 'BEMVINDO10', aplicado: true } });
});

test('API-03 CA02 cupom aceita caixa mista e espaços externos', async ({ request }, info) => {
  const r = await chamarApi(request, info, 'API-03', 'POST', '/api/carrinho/calcular', { itens: [item('P005')], cupom: '  bEmViNdO10  ' });
  expect(r.status).toBe(200);
  expect(r.corpo).toMatchObject({ desconto: 10, total: 109.9, cupom: { codigo: 'BEMVINDO10', aplicado: true } });
});

for (const caso of [
  { id: 'API-04', cupom: 'INEXISTENTE', mensagem: 'Cupom inválido.', codigo: 'CUPOM_INVALIDO' },
  { id: 'API-05', cupom: 'VERAO2026', mensagem: 'Cupom expirado.', codigo: 'CUPOM_EXPIRADO' },
]) {
  test(`${caso.id} CA03 CA04 cálculo informa cupom rejeitado sem desconto`, async ({ request }, info) => {
    const r = await chamarApi(request, info, caso.id, 'POST', '/api/carrinho/calcular', { itens: [item('P005')], cupom: caso.cupom });
    expect(r.status).toBe(200);
    expect(r.corpo).toMatchObject({ subtotal: 100, desconto: 0, frete: 19.9, total: 119.9, cupom: { aplicado: false, mensagem: caso.mensagem } });
  });
  test(`${caso.id}P pedido rejeita cupom com 422`, async ({ request }, info) => {
    const r = await chamarApi(request, info, `${caso.id}P`, 'POST', '/api/pedidos', { cliente, itens: [item('P005')], cupom: caso.cupom });
    expect(r.status).toBe(422);
    expect(r.corpo).toMatchObject({ erro: { codigo: caso.codigo } });
  });
}

test('API-06 CA07 subtotal 199,90 cobra frete e mostra faltante 0,10', async ({ request }, info) => {
  const r = await chamarApi(request, info, 'API-06', 'POST', '/api/carrinho/calcular', { itens: [item('P004'), item('P005'), item('P008')] });
  expect(r.status).toBe(200);
  expect(r.corpo).toMatchObject({ subtotal: 199.9, desconto: 0, frete: 19.9, freteGratis: false, valorFaltanteFreteGratis: 0.1, total: 219.8 });
});

test('API-07 CA06 subtotal 200,00 tem frete grátis', async ({ request }, info) => {
  const r = await chamarApi(request, info, 'API-07', 'POST', '/api/carrinho/calcular', { itens: [item('P005', 2)] });
  expect(r.status).toBe(200);
  expect(r.corpo).toMatchObject({ subtotal: 200, desconto: 0, frete: 0, freteGratis: true, valorFaltanteFreteGratis: 0, total: 200 });
});

test('API-08 CA08 CA11 frete usa subtotal antes do cupom', async ({ request }, info) => {
  const r = await chamarApi(request, info, 'API-08', 'POST', '/api/carrinho/calcular', { itens: [item('P003'), item('P006')], cupom: 'BEMVINDO10' });
  expect(r.status).toBe(200);
  expect(r.corpo).toMatchObject({ subtotal: 219.8, desconto: 21.98, frete: 0, freteGratis: true, valorFaltanteFreteGratis: 0, total: 197.82 });
});

test('API-09 CA10 cinco unidades são aceitas', async ({ request }, info) => {
  const r = await chamarApi(request, info, 'API-09', 'POST', '/api/carrinho/calcular', { itens: [item('P001', 5)] });
  expect(r.status).toBe(200);
  expect(r.corpo).toMatchObject({ subtotal: 299.5, frete: 0, total: 299.5 });
});

test('API-10 CA10 seis unidades são rejeitadas no cálculo', async ({ request }, info) => {
  const r = await chamarApi(request, info, 'API-10', 'POST', '/api/carrinho/calcular', { itens: [item('P001', 6)] });
  expect(r.status).toBe(422);
  expect(r.corpo).toMatchObject({ erro: { codigo: 'QUANTIDADE_MAXIMA_EXCEDIDA', campo: 'itens[0].quantidade' } });
});

test('API-11 CA10 seis unidades são rejeitadas no pedido', async ({ request }, info) => {
  const r = await chamarApi(request, info, 'API-11', 'POST', '/api/pedidos', { cliente, itens: [item('P001', 6)] });
  expect(r.status).toBe(422);
  expect(r.corpo).toMatchObject({ erro: { codigo: 'QUANTIDADE_MAXIMA_EXCEDIDA', campo: 'itens[0].quantidade' } });
});

test('API-12 pedido válido confirma os mesmos valores do cálculo', async ({ request }, info) => {
  const dados = { itens: [item('P005')], cupom: 'BEMVINDO10' };
  const calculo = await chamarApi(request, info, 'API-12-calculo', 'POST', '/api/carrinho/calcular', dados);
  const pedido = await chamarApi(request, info, 'API-12-pedido', 'POST', '/api/pedidos', { cliente, ...dados });
  expect(calculo.status).toBe(200);
  expect(pedido.status).toBe(201);
  expect(pedido.corpo.numero).toMatch(/^VZ-\d{6}$/);
  expect(pedido.corpo.cliente).toMatchObject({ nome: cliente.nome, email: cliente.email, cep: '01310100' });
  expect(calculo.corpo.itens).toEqual([expect.objectContaining({ produtoId: 'P005', quantidade: 1, precoUnitario: 100, total: 100 })]);
  expect(pedido.corpo.itens).toEqual(calculo.corpo.itens);
  expect(pedido.corpo.cupom).toMatchObject({ codigo: 'BEMVINDO10', aplicado: true });
  for (const campo of ['subtotal', 'desconto', 'frete', 'freteGratis', 'valorFaltanteFreteGratis', 'total']) {
    expect(pedido.corpo[campo], campo).toBe(calculo.corpo[campo]);
  }
  expect(pedido.corpo).toMatchObject({ subtotal: 100, desconto: 10, frete: 19.9, total: 109.9 });
});
