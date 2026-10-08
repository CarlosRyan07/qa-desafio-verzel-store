# Orientações para trabalhar neste projeto

- Fontes de verdade: PDF do desafio, [documentação oficial](https://verzel-store.qa-test-verzel-store.workers.dev/documentacao) do VZS-142 v2.3.0 e respostas reais da loja.
- Escopo: cupom, frete, quantidade, cálculo, checkout e contratos documentados da API. Sem carga, estresse, segurança, login ou pagamento.
- Comandos: `npm ci`, `npm test`, `npm run test:api`, `npm run test:ui`, `npm run typecheck`, `npm run report`. Para atualizar evidências: `CAPTURE_EVIDENCE=1 npm test` (PowerShell: `$env:CAPTURE_EVIDENCE='1'; npm test`).
- A rodada automatizada deve informar data/hora/fuso, executor, massa, esperado, observado, resultado e evidência. Nas verificações manuais, registre massa, esperado, observado, resultado e evidência disponível, sem exigir horário, navegador ou passos completos. Registre como manuais apenas as verificações efetivamente realizadas e informadas.
- Nunca fabricar resultados, screenshots, respostas, datas ou bugs. Guardar falhas reais como falhas da suíte.
- Ao corrigir testes, preservar as assertivas de negócio da documentação. Não usar `skip`, `fixme`, `fail` ou retries para esconder defeitos.
