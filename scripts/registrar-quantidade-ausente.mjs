import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.BASE_URL ?? 'https://verzel-store.qa-test-verzel-store.workers.dev';
const massa = { itens: [{ produtoId: 'P001' }] };
const cliente = { nome: 'Maria Silva', email: 'maria@example.com', cep: '01310-100' };
const resultados = [];

for (const rota of ['/api/carrinho/calcular', '/api/pedidos']) {
  const corpo = rota.endsWith('/pedidos') ? { cliente, ...massa } : massa;
  const resposta = await fetch(new URL(rota, base), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(corpo),
  });
  resultados.push({ rota, metodo: 'POST', requisicao: corpo, status: resposta.status, resposta: await resposta.json() });
}

const registro = {
  executadoEm: new Date().toISOString(),
  executor: 'Node.js fetch',
  ambiente: base,
  esperado: 'Rejeição de item sem quantidade; código de erro específico a esclarecer na documentação.',
  observado: resultados,
  resultado: resultados.every(r => r.status === 422) ? 'Rejeitado em ambos os endpoints; sem bug confirmado.' : 'Divergência a investigar.',
};
await mkdir('evidencias/exploratorios', { recursive: true });
await writeFile('evidencias/exploratorios/quantidade-ausente.json', `${JSON.stringify(registro, null, 2)}\n`);
console.log(registro.resultado);
