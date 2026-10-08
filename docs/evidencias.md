# Índice de evidências

As evidências da rodada consolidada foram produzidas no ambiente da Verzel Store em 08/10/2026 (America/Sao_Paulo, UTC−03:00) pela suíte Playwright. Arquivos JSON da API incluem horário UTC (`executadoEm`), método, endpoint, corpo enviado, status e resposta real. O horário local é UTC−03:00. Os números fictícios de pedido podem mudar em nova execução.

| Evidência | Conteúdo |
|---|---|
| [Relatório Playwright consolidado](../evidencias/relatorio-playwright/index.html) | 53 testes, 44 aprovados, 9 reprovados; anexos, capturas automáticas e traces das falhas. Abrir com `npx playwright show-report evidencias/relatorio-playwright` se o navegador não carregar o arquivo diretamente. |
| [API-01 a API-12](../evidencias/api/) | Catálogo, cupom, bordas de frete, quantidade e consistência do pedido. Cada teste tem JSON de sua requisição/resposta; API-04P e API-05P são pedidos inválidos, API-12 tem cálculo e pedido separados. |
| [API-13 a API-26](../evidencias/api/) | Contratos de erro, limite de quantidade, frete no limite e validação de nome. [API-25](../evidencias/api/API-25.json) e [API-26](../evidencias/api/API-26.json) mostram pedidos aceitos com nomes inválidos. |
| [API-27 a API-31](../evidencias/api/) | Consulta de produto existente por ID; nome, e-mail e CEP inválidos isoladamente; quantidade fracionária. [API-28](../evidencias/api/API-28.json) registra a massa de controle com apenas `Jorge`. |
| [API-32 cálculo](../evidencias/api/API-32-calculo.json) e [pedido](../evidencias/api/API-32-pedido.json) | Pedido válido com CEP sem hífen e comparação dos valores com o cálculo. |
| [API-33](../evidencias/api/API-33.json), [API-34](../evidencias/api/API-34.json), [API-35](../evidencias/api/API-35.json) e [API-36](../evidencias/api/API-36.json) | Quantidade negativa, texto e nula; lista de itens ausente. Todos rejeitados com 422 e código documentado. |
| [UI-01 aplicado](../evidencias/ui/UI-01-cupom-aplicado.png), [removido](../evidencias/ui/UI-01-cupom-removido.png) e [reaplicado](../evidencias/ui/UI-01-cupom-reaplicado.png) | Sequência de aplicação, remoção e reaplicação do cupom no carrinho. |
| [UI-01 substituto rejeitado](../evidencias/ui/UI-01-cupom-substituto-rejeitado.png) | Após remover o cupom válido, um código inválido não conserva o desconto anterior. |
| [UI-02](../evidencias/ui/UI-02-frete-limite.png) | Carrinho com subtotal R$ 200,00 e frete indevidamente cobrado. |
| [UI-03](../evidencias/ui/UI-03-limite-cinco.png) | Controle de quantidade desabilitado em cinco. |
| [UI-04](../evidencias/ui/UI-04-pedido-confirmado.png) | Confirmação de pedido fictício válido. |
| [UI-04 carrinho vazio](../evidencias/ui/UI-04-carrinho-apos-pedido.png) | Carrinho esvaziado depois da confirmação. |
| [UI-05](../evidencias/ui/UI-05-cupom-rejeitado.png), [UI-06](../evidencias/ui/UI-06-cupom-rejeitado.png) | Mensagens de cupom inexistente e expirado. |
| [UI-07 entrada](../evidencias/ui/UI-07-nome-invalido-entrada.png) e [confirmação](../evidencias/ui/UI-07-nome-invalido-confirmacao.png) | Nome formado só por emojis e pedido confirmado. |
| [UI-08 entrada](../evidencias/ui/UI-08-nome-invalido-entrada.png) e [confirmação](../evidencias/ui/UI-08-nome-invalido-confirmacao.png) | Nome com segundo grupo só de símbolos e pedido confirmado. |
| [UI-09 com duas unidades](../evidencias/ui/UI-09-quantidade-dois.png) e [após diminuir](../evidencias/ui/UI-09-quantidade-recalculada.png) | Recálculo do desconto e total ao alterar a quantidade com cupom; a sequência e as assertivas estão no relatório. |
| [UI-10](../evidencias/ui/UI-10-checkout-vazio.png), [UI-11](../evidencias/ui/UI-11-checkout-invalido.png) e [UI-12](../evidencias/ui/UI-12-checkout-invalido.png) | Checkout bloqueia campos vazios, e-mail inválido e CEP inválido; os testes também verificam que nenhuma requisição de pedido foi enviada. |
| [UI-13](../evidencias/ui/UI-13-frete-abaixo-limite.png) e [UI-14](../evidencias/ui/UI-14-frete-antes-desconto.png) | Aviso de R$ 0,10 faltante e frete grátis mantido após desconto. |
| [UI-15 antes](../evidencias/ui/UI-15-frete-antes-limite.png), [aumentado](../evidencias/ui/UI-15-frete-apos-aumentar.png) e [diminuído](../evidencias/ui/UI-15-frete-apos-diminuir.png) | Frete recalculado ao atravessar R$ 200,00 nos dois sentidos com cupom. |
| [Capturas manuais](../evidencias/manuais/) | Cupom, frete, quantidade, arredondamento exibido e nome inválido no checkout. [Resultados e limites de cada captura](execucao-manual.md). |
| [Cupom expirado: requisições e respostas](../evidencias/exploratorios/cupom-expirado-respostas.json), [carrinho](../evidencias/exploratorios/cupom-expirado-carrinho.png) e [checkout](../evidencias/exploratorios/cupom-expirado-checkout.png) | Verificação exploratória de estado de sessão simulado; [limite e resultado](exploratorios.md#verificação-complementar-cupom-expirado-restaurado). Não integra a rodada automatizada consolidada. |

**Como reproduzir:** `npm ci`, `npm test`. Para atualizar os arquivos de `evidencias/api` e `evidencias/ui`, rode `$env:CAPTURE_EVIDENCE='1'; npm test` no PowerShell. Para repetir a verificação do cupom restaurado, execute `node scripts/registrar-cupom-restaurado.mjs`. O relatório HTML corrente sai em `playwright-report/`; o diretório preservado em `evidencias/relatorio-playwright/` é da rodada documentada e deve ser substituído apenas após nova execução consolidada. A suíte retorna código 1 enquanto os bugs reproduzidos persistirem.

**Sobre as imagens:** as capturas manuais foram preservadas como recebidas, incluindo montagens e recortes. As capturas automatizadas foram produzidas pelo Playwright.
