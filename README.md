# 🛒 Verzel Store — validação de cupom e frete grátis

[![Automação: Playwright](https://img.shields.io/badge/automacao-Playwright-2EA44F)](tests/) [![Linguagem: TypeScript](https://img.shields.io/badge/linguagem-TypeScript-3178C6)](tsconfig.json) [![Node: 20+](https://img.shields.io/badge/node-20%2B-2EA44F)](package.json) [![Cenários: Gherkin](https://img.shields.io/badge/cenarios-Gherkin-F59E0B)](cenarios/) [![Validação: API](https://img.shields.io/badge/validacao-API-1677C7)](tests/api/)

> **Desafio técnico para a vaga de QA Júnior na Verzel.**
> Validação da entrega VZS-142 da Verzel Store, versão 2.3.0.

## 🎯 Objetivo

Validar a entrega de cupom de desconto e frete grátis do time de desenvolvimento, verificando as regras de negócio no carrinho, no checkout e na API. A avaliação reúne cenários funcionais, verificações manuais e exploratórias, automação e evidências para orientar a decisão de aceite.

Os resultados são comparados com os [requisitos da tarefa (PDF)](docs/teste-tecnico-qa-junior-verzel.pdf) e com a [documentação oficial da Verzel Store](https://verzel-store.qa-test-verzel-store.workers.dev/documentacao), versão 2.3.0.

## 📌 Resultados

**A entrega NÃO deve ser aprovada no estado atual.** Dos 11 critérios de aceite, 9 não apresentaram divergência nas massas verificadas e 2 foram reprovados (CA06 e CA10). A rodada atual executou **70 testes: 53 aprovados e 17 reprovados**. As falhas incluem dois critérios de aceite, a validação de e-mail, um contrato de erro e dois achados exploratórios de checkout. As nove verificações de compatibilidade passaram em Chromium, Firefox, WebKit, Pixel 7 e iPhone 13.

### 🐞 Critérios de aceite reprovados

| Bug | Divergência observada | Impacto | Severidade |
|---|---|---|---|
| [BUG-01](docs/bugs.md#bug-01) | Com subtotal de **R$ 200,00**, a loja e a API cobram **R$ 19,90** de frete, embora a regra seja inclusiva. A tela ainda informa “Faltam R$ 0,00”. | Cobrança acima do valor anunciado. | 🔴 Alta |
| [BUG-02](docs/bugs.md#bug-02) | A interface bloqueia a sexta unidade, mas a API calcula **seis unidades** e confirma o pedido. A regra limita cada produto a cinco. | Pedido fora do limite permitido. | 🔴 Alta |

### 🔎 Achados adicionais

| ID | Resultado observado | Classificação | Severidade |
|---|---|---|---|
| [BUG-03](docs/bugs.md#bug-03) | Interface e API confirmam pedidos com `😀 😃`, `Jorge !@` ou `123 456` no campo de nome. | Exploratório; ausência de nome/sobrenome identificáveis nessas massas | 🟡 Média |
| [BUG-04](docs/bugs.md#bug-04) | Interface e API confirmam pedidos com `qa@!!!!.com` ou `maria@exemplo..com`, apesar da exigência de e-mail válido. | Regra documentada de checkout | 🟡 Média |
| [BUG-05](docs/bugs.md#bug-05) | Se o recálculo do carrinho falha, o checkout pode mostrar R$ 79,80 e confirmar um pedido de R$ 139,70. | Exploratório; falha HTTP 500 simulada apenas no cálculo | 🔴 Alta |
| [BUG-06](docs/bugs.md#bug-06) | Item sem `produtoId` recebe `PRODUTO_NAO_ENCONTRADO` em vez de `ITEM_INVALIDO`. | Contrato de erro documentado | 🟢 Baixa |

Os [relatos de bug](docs/bugs.md) detalham as massas, os resultados, os impactos e as evidências de cada achado. As [capturas das verificações manuais](docs/execucao-manual.md) estão registradas separadamente.

### 🔍 Investigações complementares

- **Quantidade ausente:** cálculo e pedido são rejeitados com HTTP 422. A documentação não especifica qual código deve ser usado para esse campo ausente; [registro e análise](docs/exploratorios.md#quantidade-ausente-na-api).
- **Cupom expirado restaurado:** após inserir o cupom na sessão, a interface o mostrou como aplicado, mas não deu desconto e o pedido foi recusado. É uma observação de estado simulado, detalhada [aqui](docs/exploratorios.md#verificação-complementar-cupom-expirado-restaurado).
- **Arredondamento (CA11):** os valores disponíveis mostram duas casas decimais, mas não permitem distinguir métodos de arredondamento. [Limite da massa](docs/estrategia.md#ambiguidades-e-limites).

**Para reavaliar a entrega:** corrigir os desvios confirmados, repetir os cenários afetados na interface e na API e executar a suíte de regressão. O BUG-05 exige também revisar o comportamento do checkout quando o cálculo falha. A [rastreabilidade](docs/rastreabilidade.md) liga os critérios aos cenários e às evidências.

## 🌐 Ambiente e API

As verificações usam a [Verzel Store](https://verzel-store.qa-test-verzel-store.workers.dev/), ambiente de pedidos fictícios. A API oferece o [catálogo (`GET /api/produtos`)](https://verzel-store.qa-test-verzel-store.workers.dev/api/produtos); os testes também chamam `POST /api/carrinho/calcular` e `POST /api/pedidos`, cujos contratos estão na documentação oficial.

Testes de carga, estresse, segurança, login e pagamento não fazem parte desta avaliação.

## ▶️ Executar os testes

É necessário Git, Node.js 20 ou superior, npm e acesso à internet. Para clonar e executar o projeto:

```powershell
git clone https://github.com/CarlosRyan07/qa-desafio-verzel-store.git
cd qa-desafio-verzel-store
npm ci
npx playwright install chromium firefox webkit
npm run typecheck
npm test
```

`npm ci` instala as versões fixadas no `package-lock.json`, e `npx playwright install chromium firefox webkit` instala os três motores usados nos testes de interface e compatibilidade. A loja e a API já estão hospedadas; não é preciso iniciar um servidor local. `npm test` retorna código 1 enquanto os [bugs documentados](docs/bugs.md) persistirem.

| Comando | Resultado |
|---|---|
| `npm run test:api` | Executa apenas os testes de API. |
| `npm run test:ui` | Executa apenas os testes de interface. |
| `npm run test:compat` | Executa a matriz desktop e mobile de compatibilidade. |
| `npx playwright test --ui` | Abre a interface do Playwright para selecionar e executar testes. |
| `npm run report` | Abre o relatório da última execução local. |
| `npx playwright show-report evidencias/relatorio-playwright` | Abre o [relatório da rodada atual](evidencias/relatorio-playwright/index.html). |
| `node scripts/registrar-cupom-restaurado.mjs` | Repete a verificação exploratória do cupom expirado restaurado e atualiza suas evidências. |

Para usar outro ambiente, defina `BASE_URL` antes da execução. Para atualizar JSONs e capturas no PowerShell, rode `$env:CAPTURE_EVIDENCE='1'; npm test`; em bash, `CAPTURE_EVIDENCE=1 npm test`. Isso atualiza as evidências em `evidencias/api/` e `evidencias/ui/`. O HTML sai em `playwright-report/`; após revisar a rodada, atualize `evidencias/relatorio-playwright/`, que mantém somente o relatório mais recente.

## 🗂️ Estrutura do projeto

```text
├── cenarios/                    Cenários Gherkin e critérios de aceite
├── docs/                        Estratégia, execuções, bugs e enunciado
├── evidencias/
│   ├── api/                     Requisições e respostas registradas
│   ├── ui/                      Capturas da automação
│   ├── manuais/                 Capturas das verificações manuais
│   ├── exploratorios/           Capturas das verificações exploratórias
│   └── relatorio-playwright/ Relatório da rodada atual e traces
├── tests/
│   ├── api/                     Testes dos contratos e regras da API
│   ├── ui/                      Testes no navegador
│   ├── compatibilidade/         Fluxos em outros navegadores e dispositivos
│   └── support/                 Massas e funções compartilhadas
├── scripts/                     Verificação dos links e registro exploratório
├── playwright.config.ts         Configuração da suíte
└── package.json                 Comandos e dependências
```

Os documentos principais têm acesso direto abaixo:

| Conteúdo | Arquivo |
|---|---|
| Cenários Gherkin e critérios de aceite | [cenarios/](cenarios/) |
| Estratégia, massas e limites da análise | [docs/estrategia.md](docs/estrategia.md) |
| Resultado por cenário e rastreabilidade | [execucao.md](docs/execucao.md) · [rastreabilidade.md](docs/rastreabilidade.md) |
| Verificações manuais e exploratórias | [execucao-manual.md](docs/execucao-manual.md) · [exploratorios.md](docs/exploratorios.md) |
| Bugs e evidências | [bugs.md](docs/bugs.md) · [índice de evidências](docs/evidencias.md) |
| Automação Playwright | [tests/api/](tests/api/) · [tests/ui/](tests/ui/) · [tests/compatibilidade/](tests/compatibilidade/) |

Os arquivos `.feature` documentam os cenários; a execução automatizada está nos testes Playwright em TypeScript. A [matriz de rastreabilidade](docs/rastreabilidade.md) liga cada critério às verificações e evidências correspondentes.

Os identificadores `CT` são usados para cenários ligados aos critérios e regras documentadas. `EXP` identifica verificações exploratórias sem critério de aceite direto; seus resultados ficam separados dos critérios formais na [execução](docs/execucao.md) e nos [relatos](docs/bugs.md).

## 🧪 O que foi automatizado

A suíte usa Playwright Test com TypeScript e separa regras de negócio e compatibilidade:

| Camada | Cobertura | Testes |
|---|---|---|
| API | Catálogo e preços; cupons; limites de frete e quantidade; cálculo e confirmação de pedido com CEP nos dois formatos; validação de cliente e contratos de erro, incluindo e-mail e nome nas massas exploratórias. | [42 testes](tests/api/) |
| Interface | Cupom, frete e quantidade; checkout válido e inválido, incluindo nome nas massas exploratórias; carrinho vazio após pedido; consistência do total após falha simulada no cálculo. | [19 testes](tests/ui/) |
| Compatibilidade desktop | Fluxo principal até o preenchimento do checkout em Chromium, Firefox e WebKit. | [3 execuções](tests/compatibilidade/fluxo.desktop.spec.ts) |
| Compatibilidade mobile | Vitrine, carrinho, cupom, checkout, validações e ausência de rolagem horizontal em Pixel 7 e iPhone 13. | [6 execuções](tests/compatibilidade/fluxo.mobile.spec.ts) |

### Decisões da automação

- Os projetos de API, interface e compatibilidade podem rodar separadamente. Cada chamada de API envia sua própria massa, e cada teste de interface começa em um novo contexto de navegador.
- A matriz de compatibilidade repete apenas um fluxo crítico no desktop e três verificações no mobile. As regras de negócio completas permanecem concentradas nos projetos `api` e `ui`, evitando multiplicar a suíte inteira por cinco ambientes.
- A organização usa auxiliares de página, uma aplicação enxuta da ideia de Page Object: ações e seletores recorrentes ficam em [loja.ts](tests/support/loja.ts), e chamadas da API em [api.ts](tests/support/api.ts). Os testes orientados a dados geram um teste Playwright independente para cada massa, como cupons rejeitados, contratos de erro e dados inválidos do checkout. As assertivas de negócio permanecem nos próprios testes.
- A suíte usa um worker e não repete testes automaticamente. As assertivas seguem as regras documentadas; bugs conhecidos continuam aparecendo como falhas.
- O Playwright guarda trace e screenshot quando um teste falha. Com `CAPTURE_EVIDENCE=1`, a execução também atualiza os JSONs e as capturas selecionadas em `evidencias/`.

## 🤖 Uso de IA

Usei o **Codex (OpenAI)** como apoio na análise do desafio e na preparação da entrega. As regras de aceite e os resultados foram conferidos com o PDF, a documentação oficial e o comportamento real da loja.

**Onde a IA ajudou:**

- Organizar os onze critérios de aceite em cenários Gherkin e ligar cada um a testes e evidências na [rastreabilidade](docs/rastreabilidade.md).
- Escolher massas de teste para limites de frete e quantidade, revisar os cálculos esperados e escrever e revisar os testes Playwright de API e interface.
- Estruturar os relatos de bugs, o registro da execução e este README para que cada conclusão possa ser verificada.

**Como validei o trabalho:**

- Acompanhei e revisei cada etapa, pedindo ao Codex que explicasse o que estava fazendo e por que cada mudança era necessária. Quando uma conclusão não estava clara, voltei às regras e às evidências antes de mantê-la.
- Fiz verificações manuais na loja e no Postman. As [capturas manuais](docs/execucao-manual.md) mostram o que foi observado; seus resultados estão separados da automação.
- Separei o teste do limite exato de **R$ 200,00** do teste de frete antes do desconto: o primeiro reproduz o [BUG-01](docs/bugs.md#bug-01), enquanto o segundo usa subtotal de **R$ 219,80** e passa. A [estratégia](docs/estrategia.md#separação-das-regras-de-frete) explica por que essas massas permitem conclusões diferentes.
- A automação foi executada contra a loja e a API reais. No teste exploratório UI-17, somente a resposta do cálculo foi simulada; a criação do pedido permaneceu real. O [relatório atual](evidencias/relatorio-playwright/index.html) reúne requisições, respostas, capturas e traces para conferir os resultados. Mantive as falhas dos bugs visíveis e registrei os [limites das massas disponíveis](docs/estrategia.md#ambiguidades-e-limites), como a existência de apenas um cupom válido documentado.

Esse acompanhamento me deu agilidade para ampliar a cobertura, organizar as evidências e documentar as decisões. Os resultados e a decisão de aceite continuam vinculados às regras e às execuções registradas.
