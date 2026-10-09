# Execução do VZS-142

**Rodada automatizada consolidada:** 09/10/2026, aproximadamente 12h38–12h40 (America/Sao_Paulo, UTC−03:00).

**Executor:** suíte Playwright Test 1.64.0, executada localmente com Node.js 24.18.0, npm 11.16.0 e `APIRequestContext`, Windows. Interface em Chromium desktop; compatibilidade em Chromium, Firefox 157, WebKit 27.2, Pixel 7 e iPhone 13 emulados pelo Playwright.

**Ambiente:** [Verzel Store](https://verzel-store.qa-test-verzel-store.workers.dev/), documentação v2.3.0.

**Comando:** `$env:CAPTURE_EVIDENCE='1'; npm test`, um worker, sem retries.

**Resultado:** 65 testes, 53 APROVADOS e 12 REPROVADOS; saída 1. O [relatório HTML desta rodada](../evidencias/relatorio-playwright/index.html) contém a execução detalhada e os traces das falhas. As nove execuções de compatibilidade passaram. Quatro falhas são do BUG-03 exploratório, cuja interpretação esperada está declarada no relato.

A rodada desta página reúne os resultados dos testes Playwright. As [verificações manuais](execucao-manual.md) têm registro próprio e não entram na contagem da suíte.

| Cenário | Esperado principal | Observado nesta rodada | Resultado automatizado | Evidência / bug |
|---|---|---|---|---|
| CT01 | P005 + BEMVINDO10: desconto 10, frete 19,90, total 109,90 | Valores corretos na API e interface | APROVADO (API-02, UI-01) | [API-02](../evidencias/api/API-02.json), [UI-01](../evidencias/ui/UI-01-cupom-aplicado.png) |
| CT02 | Cupom ignora caixa e espaços externos | `bEmViNdO10` normalizado; desconto 10 | APROVADO (API-03, UI-01) | [API-03](../evidencias/api/API-03.json) |
| CT03 | Inexistente: mensagem, zero desconto; pedido 422 | Mensagem correta, cálculo 200, pedido 422 | APROVADO (API-04, API-04P, UI-05) | [API-04](../evidencias/api/API-04.json), [API-04P](../evidencias/api/API-04P.json), [UI-05](../evidencias/ui/UI-05-cupom-rejeitado.png) |
| CT04 | Expirado: mensagem, zero desconto; pedido 422 | Mensagem correta, cálculo 200, pedido 422 | APROVADO (API-05, API-05P, UI-06) | [API-05](../evidencias/api/API-05.json), [API-05P](../evidencias/api/API-05P.json), [UI-06](../evidencias/ui/UI-06-cupom-rejeitado.png) |
| CT05 | Remoção zera desconto, libera campo e permite reaplicar; novo cupom inválido não mantém desconto antigo | Desconto zerou, voltou a R$ 10,00 após reaplicar e permaneceu zero ao tentar INEXISTENTE depois da remoção | APROVADO para o único cupom válido (UI-01) | [removido](../evidencias/ui/UI-01-cupom-removido.png), [reaplicado](../evidencias/ui/UI-01-cupom-reaplicado.png), [substituto rejeitado](../evidencias/ui/UI-01-cupom-substituto-rejeitado.png) |
| CT06 | Subtotal 199,90: frete 19,90, faltante 0,10 | API e interface retornaram/exibiram valores esperados | APROVADO (API-06, UI-13) | [API-06](../evidencias/api/API-06.json), [UI-13](../evidencias/ui/UI-13-frete-abaixo-limite.png) |
| CT07 | Subtotal 200: frete zero no cálculo, pedido e tela | Frete 19,90, total 219,90; faltante zero | REPROVADO (API-07, API-24, UI-02) | [API-07](../evidencias/api/API-07.json), [API-24](../evidencias/api/API-24.json), [UI-02](../evidencias/ui/UI-02-frete-limite.png), [BUG-01](bugs.md#bug-01) |
| CT08 | Subtotal 219,80 com desconto 21,98: frete zero e total 197,82 | API e interface retornaram/exibiram valores esperados | APROVADO (API-08, UI-14) | [API-08](../evidencias/api/API-08.json), [UI-14](../evidencias/ui/UI-14-frete-antes-desconto.png) |
| CT09 | Desconto não afeta frete de 19,90 | Frete 19,90; total 109,90 | APROVADO (API-02, UI-01) | [API-02](../evidencias/api/API-02.json) |
| CT10 | Valores com até duas casas no caso disponível | 21,98 e 197,82 | APROVADO para a massa disponível (API-08) | [API-08](../evidencias/api/API-08.json); método de arredondamento não testável com a massa fixa |
| CT11 | 5 × P001 aceitas, subtotal 299,50 | API 200, subtotal 299,50 | APROVADO (API-09) | [API-09](../evidencias/api/API-09.json) |
| CT12 | 6 × P001 rejeitadas com 422 no cálculo/pedido | API 200 no cálculo e 201 no pedido | REPROVADO (API-10, API-11) | [API-10](../evidencias/api/API-10.json), [API-11](../evidencias/api/API-11.json), [BUG-02](bugs.md#bug-02) |
| CT13 | Interface bloqueia a sexta unidade | Botões desabilitados com cinco | APROVADO (UI-03) | [UI-03](../evidencias/ui/UI-03-limite-cinco.png) |
| CT14 | 5 unidades de cada um de dois produtos aceitas | API 200, subtotal 999 | APROVADO (API-23) | [API-23](../evidencias/api/API-23.json) |
| CT15 | Pedido válido 201, número no formato `VZ-` seguido de seis dígitos, cálculo consistente, CEP nos dois formatos e carrinho vazio após confirmar | API confirmou pedidos com CEP com e sem hífen; interface mostrou os valores esperados e esvaziou o carrinho | APROVADO (API-12, API-32, UI-04) | [API-12](../evidencias/api/API-12-pedido.json), [API-32](../evidencias/api/API-32-pedido.json), [confirmação](../evidencias/ui/UI-04-pedido-confirmado.png), [carrinho vazio](../evidencias/ui/UI-04-carrinho-apos-pedido.png) |
| CT16 | `Jorge`, `email-invalido` e CEP `123` retornam 422 e identificam os campos | A API identificou os três campos juntos e cada um isoladamente | APROVADO para essas massas (API-21, API-28–API-30) | [API-21](../evidencias/api/API-21.json), [API-28](../evidencias/api/API-28.json), [API-29](../evidencias/api/API-29.json), [API-30](../evidencias/api/API-30.json) |
| CT17 | Produto inexistente: consulta 404; carrinho 422 | Ambos retornaram PRODUTO_NAO_ENCONTRADO nos status certos | APROVADO (API-13, API-18) | [API-13](../evidencias/api/API-13.json), [API-18](../evidencias/api/API-18.json) |
| CT18 | Contratos de erro conforme tabela oficial | JSON inválido 400, rota 404, método 405, itens ausentes e erros de quantidade 422, incluindo negativa, fracionária, texto e nula | APROVADO (API-14–API-20, API-22, API-31, API-33–API-36) | [índice de evidências](evidencias.md) |
| EXP-01 | Rejeitar `😀 😃` e `Jorge !@`, sem nome/sobrenome identificáveis | UI confirmou ambos; API respondeu 201 em ambos | REPROVADO exploratório (API-25, API-26, UI-07, UI-08); [BUG-03](bugs.md#bug-03) | [API-25](../evidencias/api/API-25.json), [API-26](../evidencias/api/API-26.json), [UI-07](../evidencias/ui/UI-07-nome-invalido-confirmacao.png), [UI-08](../evidencias/ui/UI-08-nome-invalido-confirmacao.png) |
| CT20 | Aumentar e diminuir a quantidade atualiza subtotal, desconto e total | UI passou de 1 para 2 unidades de P001 e voltou a 1, com valores recalculados | APROVADO (UI-09) | [duas unidades](../evidencias/ui/UI-09-quantidade-dois.png), [uma unidade](../evidencias/ui/UI-09-quantidade-recalculada.png), [relatório](../evidencias/relatorio-playwright/index.html) |
| CT21 | Produto P005 existente é consultável pelo ID | API 200 com id P005 e preço R$ 100,00 | APROVADO (API-27) | [API-27](../evidencias/api/API-27.json) |
| CT22 | Campos vazios no checkout exigem nome, e-mail e CEP, sem enviar pedido | Três mensagens apareceram e nenhuma requisição a `/api/pedidos` foi enviada | APROVADO (UI-10) | [UI-10](../evidencias/ui/UI-10-checkout-vazio.png), [relatório](../evidencias/relatorio-playwright/index.html) |
| CT23 | `email-invalido` ou CEP `123` isoladamente impede confirmar pedido | Cada campo exibiu sua mensagem; checkout permaneceu aberto e não houve envio a `/api/pedidos` | APROVADO para essas massas (UI-11, UI-12) | [UI-11](../evidencias/ui/UI-11-checkout-invalido.png), [UI-12](../evidencias/ui/UI-12-checkout-invalido.png) |
| CT24 | Interface mostra faltante de R$ 0,10 com subtotal R$ 199,90 | Frete R$ 19,90 e aviso de R$ 0,10 exibidos | APROVADO (UI-13) | [UI-13](../evidencias/ui/UI-13-frete-abaixo-limite.png) |
| CT25 | Frete grátis usa subtotal antes do desconto também na interface | Subtotal R$ 219,80, desconto R$ 21,98, frete grátis e total R$ 197,82 | APROVADO (UI-14) | [UI-14](../evidencias/ui/UI-14-frete-antes-desconto.png) |
| CT26 | Frete recalcula ao cruzar R$ 200,00 com cupom nos dois sentidos | Subtotal 199,80 → 259,70 → 199,80; frete 19,90 → grátis → 19,90 | APROVADO (UI-15) | [antes](../evidencias/ui/UI-15-frete-antes-limite.png), [após aumentar](../evidencias/ui/UI-15-frete-apos-aumentar.png), [após diminuir](../evidencias/ui/UI-15-frete-apos-diminuir.png) |
| CT27 | `qa@!!!!.com`: interface impede pedido e API retorna 422 para `cliente.email` | Interface confirmou o pedido; API retornou 201 e preservou o e-mail | REPROVADO (API-37, UI-16); [BUG-04](bugs.md#bug-04) | [API-37](../evidencias/api/API-37.json), [entrada](../evidencias/ui/UI-16-email-dominio-invalido-entrada.png), [resultado](../evidencias/ui/UI-16-email-dominio-invalido-resultado.png) |
| EXP-02 | Se o cálculo falhar após aumentar P001 para duas unidades, bloquear checkout ou mostrar o valor atualizado antes de confirmar | Cálculo HTTP 500 simulado; checkout mostrou R$ 79,80, pedido real confirmou duas unidades por R$ 139,70 | REPROVADO (UI-17); exploratório [BUG-05](bugs.md#bug-05) | [carrinho](../evidencias/ui/UI-17-carrinho-apos-falha.png), [checkout](../evidencias/ui/UI-17-checkout-apos-falha.png), [confirmação](../evidencias/ui/UI-17-pedido-apos-falha.png) |

## Compatibilidade

| Verificação | Ambientes | Resultado | Evidência |
|---|---|---|---|
| COMP-01: adicionar produto, aplicar cupom, abrir e preencher checkout | Chromium, Firefox e WebKit desktop | 3 APROVADAS | [relatório atual](../evidencias/relatorio-playwright/index.html) |
| MOB-01: vitrine, carrinho, controles e resumo sem rolagem horizontal | Pixel 7 (Chromium) e iPhone 13 (WebKit) | 2 APROVADAS | [relatório atual](../evidencias/relatorio-playwright/index.html) |
| MOB-02: cupom, campos e botão do checkout acessíveis sem rolagem horizontal | Pixel 7 (Chromium) e iPhone 13 (WebKit) | 2 APROVADAS | [relatório atual](../evidencias/relatorio-playwright/index.html) |
| MOB-03: mensagens de validação visíveis sem rolagem horizontal | Pixel 7 (Chromium) e iPhone 13 (WebKit) | 2 APROVADAS | [relatório atual](../evidencias/relatorio-playwright/index.html) |

**Outras verificações:** API-01 confirmou os oito produtos e preços; API-27 confirmou a consulta de P005 pelo ID. Os cenários automatizados cobrem todos os CA01–CA11, mas CA11 tem limitação de massa descrita em [estrategia.md](estrategia.md). Não há percentuais de cobertura de código, pois o código da loja não está disponível.

**Execução manual:** as verificações que registrei estão em [execucao-manual.md](execucao-manual.md). A remoção do cupom e o checkout válido já têm resultado automatizado nesta rodada.
