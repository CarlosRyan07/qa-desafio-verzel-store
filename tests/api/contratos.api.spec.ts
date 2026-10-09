import { test, expect } from '@playwright/test';
import { chamarApi, cliente, item } from '../support/api';

const casos = [
  { id: 'API-13', metodo: 'GET' as const, rota: '/api/produtos/NAO_EXISTE', corpo: undefined, status: 404, codigo: 'PRODUTO_NAO_ENCONTRADO' },
  { id: 'API-14', metodo: 'GET' as const, rota: '/api/rota-inexistente', corpo: undefined, status: 404, codigo: 'ROTA_NAO_ENCONTRADA' },
  { id: 'API-15', metodo: 'GET' as const, rota: '/api/pedidos', corpo: undefined, status: 405, codigo: 'METODO_NAO_PERMITIDO' },
  { id: 'API-16', metodo: 'POST' as const, rota: '/api/carrinho/calcular', corpo: { itens: [] }, status: 422, codigo: 'ITENS_OBRIGATORIOS' },
  { id: 'API-17', metodo: 'POST' as const, rota: '/api/carrinho/calcular', corpo: { itens: [null] }, status: 422, codigo: 'ITEM_INVALIDO' },
  { id: 'API-18', metodo: 'POST' as const, rota: '/api/carrinho/calcular', corpo: { itens: [item('NAO_EXISTE')] }, status: 422, codigo: 'PRODUTO_NAO_ENCONTRADO' },
  { id: 'API-19', metodo: 'POST' as const, rota: '/api/carrinho/calcular', corpo: { itens: [item('P001'), item('P001')] }, status: 422, codigo: 'ITEM_DUPLICADO' },
  { id: 'API-20', metodo: 'POST' as const, rota: '/api/carrinho/calcular', corpo: { itens: [item('P001', 0)] }, status: 422, codigo: 'QUANTIDADE_INVALIDA' },
  { id: 'API-21', metodo: 'POST' as const, rota: '/api/pedidos', corpo: { cliente: { nome: 'Maria', email: 'email-invalido', cep: '123' }, itens: [item('P005')] }, status: 422, codigo: 'DADOS_INVALIDOS' },
  { id: 'API-22', metodo: 'POST' as const, rota: '/api/carrinho/calcular', corpo: '{', status: 400, codigo: 'JSON_INVALIDO' },
];

for (const caso of casos) {
  test(`${caso.id} contrato ${caso.codigo}`, async ({ request }, info) => {
    const r = await chamarApi(request, info, caso.id, caso.metodo, caso.rota, caso.corpo);
    expect(r.status).toBe(caso.status);
    expect(r.corpo).toMatchObject({ erro: { codigo: caso.codigo, mensagem: expect.any(String) } });
    expect(r.corpo.erro.mensagem.length).toBeGreaterThan(0);
    if (caso.codigo === 'DADOS_INVALIDOS') {
      expect(r.corpo.erro.campos).toEqual([
        { campo: 'cliente.nome', mensagem: 'Informe nome e sobrenome.' },
        { campo: 'cliente.email', mensagem: 'Informe um e-mail válido.' },
        { campo: 'cliente.cep', mensagem: 'Informe um CEP com 8 dígitos.' },
      ]);
    }
  });
}

test('API-23 CA10 cinco unidades de dois produtos são permitidas', async ({ request }, info) => {
  const r = await chamarApi(request, info, 'API-23', 'POST', '/api/carrinho/calcular', { itens: [item('P001', 5), item('P002', 5)] });
  expect(r.status).toBe(200);
  expect(r.corpo).toMatchObject({ subtotal: 999, frete: 0, total: 999 });
  expect(r.corpo.itens).toEqual([
    expect.objectContaining({ produtoId: 'P001', quantidade: 5, total: 299.5 }),
    expect.objectContaining({ produtoId: 'P002', quantidade: 5, total: 699.5 }),
  ]);
});

test('API-24 CA06 pedido com subtotal 200,00 mantém frete grátis', async ({ request }, info) => {
  const r = await chamarApi(request, info, 'API-24', 'POST', '/api/pedidos', { cliente, itens: [item('P005', 2)] });
  expect(r.status).toBe(201);
  expect(r.corpo).toMatchObject({ subtotal: 200, frete: 0, freteGratis: true, total: 200 });
});

test('API-27 consulta produto existente pelo ID', async ({ request }, info) => {
  const r = await chamarApi(request, info, 'API-27', 'GET', '/api/produtos/P005');
  expect(r.status).toBe(200);
  expect(r.corpo).toMatchObject({ id: 'P005', nome: 'Mochila Urbana 20L', preco: 100 });
});

for (const caso of [
  { id: 'API-28', campo: 'nome', valor: 'Jorge', erro: 'cliente.nome', mensagem: 'Informe nome e sobrenome.' },
  { id: 'API-29', campo: 'email', valor: 'email-invalido', erro: 'cliente.email', mensagem: 'Informe um e-mail válido.' },
  { id: 'API-30', campo: 'cep', valor: '123', erro: 'cliente.cep', mensagem: 'Informe um CEP com 8 dígitos.' },
] as const) {
  test(`${caso.id} rejeita ${caso.campo} inválido isoladamente`, async ({ request }, info) => {
    const r = await chamarApi(request, info, caso.id, 'POST', '/api/pedidos', {
      cliente: { ...cliente, [caso.campo]: caso.valor },
      itens: [item('P005')],
    });
    expect(r.status).toBe(422);
    expect(r.corpo).toMatchObject({ erro: { codigo: 'DADOS_INVALIDOS' } });
    expect(r.corpo.erro.campos).toEqual([{ campo: caso.erro, mensagem: caso.mensagem }]);
  });
}

test('API-37 rejeita e-mail com caracteres inválidos no domínio', async ({ request }, info) => {
  const r = await chamarApi(request, info, 'API-37', 'POST', '/api/pedidos', {
    cliente: { ...cliente, email: 'qa@!!!!.com' },
    itens: [item('P001')],
  });
  expect(r.status).toBe(422);
  expect(r.corpo).toMatchObject({ erro: { codigo: 'DADOS_INVALIDOS' } });
  expect(r.corpo.erro.campos).toContainEqual({ campo: 'cliente.email', mensagem: 'Informe um e-mail válido.' });
});

for (const caso of [
  { id: 'API-25', nome: '😀 😃', descricao: 'nome formado apenas por emojis' },
  { id: 'API-26', nome: 'Jorge !@', descricao: 'segundo termo formado apenas por símbolos' },
]) {
  test(`${caso.id} rejeita ${caso.descricao}`, async ({ request }, info) => {
    const r = await chamarApi(request, info, caso.id, 'POST', '/api/pedidos', {
      cliente: { ...cliente, nome: caso.nome },
      itens: [item('P001')],
    });
    expect(r.status).toBe(422);
    expect(r.corpo).toMatchObject({ erro: { codigo: 'DADOS_INVALIDOS' } });
    expect(r.corpo.erro.campos).toContainEqual({ campo: 'cliente.nome', mensagem: 'Informe nome e sobrenome.' });
  });
}

test('API-31 rejeita quantidade fracionária', async ({ request }, info) => {
  const r = await chamarApi(request, info, 'API-31', 'POST', '/api/carrinho/calcular', { itens: [item('P001', 1.5)] });
  expect(r.status).toBe(422);
  expect(r.corpo).toMatchObject({ erro: { codigo: 'QUANTIDADE_INVALIDA', campo: 'itens[0].quantidade' } });
});

test('API-32 pedido aceita CEP sem hífen e preserva cálculo', async ({ request }, info) => {
  const itens = [item('P005')];
  const calculo = await chamarApi(request, info, 'API-32-calculo', 'POST', '/api/carrinho/calcular', { itens, cupom: 'BEMVINDO10' });
  const pedido = await chamarApi(request, info, 'API-32-pedido', 'POST', '/api/pedidos', {
    cliente: { ...cliente, cep: '01310100' }, itens, cupom: 'BEMVINDO10',
  });
  expect(calculo.status).toBe(200);
  expect(pedido.status).toBe(201);
  expect(pedido.corpo.numero).toMatch(/^VZ-\d{6}$/);
  expect(pedido.corpo.cliente).toMatchObject({ ...cliente, cep: '01310100' });
  for (const campo of ['itens', 'cupom', 'subtotal', 'desconto', 'frete', 'freteGratis', 'valorFaltanteFreteGratis', 'total']) {
    expect(pedido.corpo[campo], campo).toEqual(calculo.corpo[campo]);
  }
  expect(pedido.corpo).toMatchObject({ subtotal: 100, desconto: 10, frete: 19.9, total: 109.9 });
});

for (const caso of [
  { id: 'API-33', descricao: 'quantidade negativa', corpo: { itens: [item('P005', -1)] }, codigo: 'QUANTIDADE_INVALIDA' },
  { id: 'API-34', descricao: 'quantidade como texto', corpo: { itens: [{ produtoId: 'P005', quantidade: '2' }] }, codigo: 'QUANTIDADE_INVALIDA' },
  { id: 'API-35', descricao: 'quantidade nula', corpo: { itens: [{ produtoId: 'P005', quantidade: null }] }, codigo: 'QUANTIDADE_INVALIDA' },
  { id: 'API-36', descricao: 'lista de itens ausente', corpo: {}, codigo: 'ITENS_OBRIGATORIOS' },
]) {
  test(`${caso.id} rejeita ${caso.descricao}`, async ({ request }, info) => {
    const r = await chamarApi(request, info, caso.id, 'POST', '/api/carrinho/calcular', caso.corpo);
    expect(r.status).toBe(422);
    expect(r.corpo).toMatchObject({ erro: { codigo: caso.codigo, mensagem: expect.any(String) } });
    expect(r.corpo.erro.mensagem.length).toBeGreaterThan(0);
  });
}
