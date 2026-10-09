# Exploração da loja

A navegação com Playwright/Chromium pela vitrine, carrinho e checkout ajudou a definir os cenários de teste. Estas observações são separadas das [verificações manuais](execucao-manual.md).

| Ação realizada | Observação real | Próximo passo adotado |
|---|---|---|
| Abrir a documentação e a vitrine | Documentação renderizada confirmou VZS-142 v2.3.0; vitrine tinha oito produtos e banner de frete/cupom. | Conferir preços também pela API e usar massas documentadas. |
| Adicionar uma mochila e abrir o carrinho | Carrinho exibiu subtotal R$ 100,00, frete R$ 19,90, total R$ 119,90; controles tinham nomes acessíveis. | Automatizar cupom, frete e quantidade com seletores por papel/rótulo e resumo por `data-valor`. |
| Abrir checkout | Campos Nome completo, E-mail, CEP e botão Confirmar pedido; pagamento na entrega. | Automatizar confirmação válida e validar dados inválidos pela API. |
| Investigar a borda R$ 200,00 por UI/API | Rodada automatizada posterior reproduziu frete cobrado e aviso “Faltam R$ 0,00”. | Registrar [BUG-01](bugs.md#bug-01) com resposta e screenshot próprios. |
| Investigar a borda de seis unidades pela API | Rodada automatizada posterior recebeu 200 no cálculo e 201 no pedido. | Registrar [BUG-02](bugs.md#bug-02). |

**Conclusão da sessão inicial:** as falhas de frete no limite e quantidade acima de cinco foram reproduzidas por testes próprios. O estado de cupom expirado restaurado da sessão foi investigado depois, conforme o registro abaixo. A transição do frete ao cruzar R$ 200,00 passou a integrar a [automação](execucao.md). A remoção total de itens, a reconstrução do carrinho e a segunda aba ficaram como possibilidades de exploração futura.

## Verificação complementar: cupom expirado restaurado

Para investigar o estado restaurado do carrinho, foi usada uma Camiseta Essencial (P001, R$ 59,90), o cupom expirado `VERAO2026` inserido no `sessionStorage` da aba como valor JSON e um cliente válido no checkout.

**Passos:** adicionar P001, abrir o carrinho, executar `sessionStorage.setItem('verzel-store:cupom', JSON.stringify('VERAO2026'))`, recarregar a página, observar o resumo e tentar confirmar o pedido com dados válidos.

**Esperado:** se o cálculo informa `cupom.aplicado: false` e “Cupom expirado.”, o carrinho não deve anunciar o cupom como aplicado. O desconto deve ser zero e o pedido com cupom expirado deve ser recusado.

**Observado:** o cálculo retornou 200 com `cupom.aplicado: false`, mensagem “Cupom expirado.” e desconto zero, mas o carrinho exibiu “Cupom VERAO2026 aplicado.”. O checkout recusou o pedido com 422 `CUPOM_EXPIRADO` e mostrou “Cupom expirado.”. **Resultado:** inconsistência de interface reproduzida neste estado simulado; a validação da API preservou a regra de não conceder desconto.

**Evidência:** [requisições e respostas da API](../evidencias/exploratorios/cupom-expirado-respostas.json), [carrinho após recarga](../evidencias/exploratorios/cupom-expirado-carrinho.png) e [checkout recusado](../evidencias/exploratorios/cupom-expirado-checkout.png). O registro foi produzido por `node scripts/registrar-cupom-restaurado.mjs` e contém massa, esperado, observado, horário e ambiente; as imagens mostram a interface.

**Limite:** o cupom expirado foi colocado na sessão pelo Console; não reproduzimos a expiração natural de um cupom previamente válido. Por isso, esta verificação permanece exploratória e fora da suíte principal e da lista de bugs prioritários. Nenhum desconto indevido ou pedido com cupom expirado foi confirmado.

## Nomes com emojis e símbolos

**Massa:** `😀 😃` e `Jorge !@`, com os demais dados do cliente válidos. A interface e a API confirmaram pedidos com ambos os valores. A [captura manual](../evidencias/manuais/nome-emoji-caracteres.png), os [registros API-25/26](../evidencias/api/) e as [capturas UI-07/08](../evidencias/ui/) comprovam o comportamento observado; os testes atuais registram a interpretação esperada como falha exploratória.

**Interpretação:** a [documentação da loja](https://verzel-store.qa-test-verzel-store.workers.dev/documentacao) diz que o nome do cliente precisa ter nome e sobrenome. `😀 😃` não fornece nenhum dos dois; em `Jorge !@`, o segundo termo não identifica um sobrenome. A rejeição dessas massas é um esperado exploratório razoável, registrado como [BUG-03](bugs.md#bug-03), sujeito à validação da regra pelo responsável pelo produto. Isso não implica rejeitar todos os nomes que contenham pontuação ou emoji. A massa `Jorge` sem sobrenome foi rejeitada no [API-28](../evidencias/api/API-28.json).

## Quantidade ausente na API

**Massa:** `{"itens":[{"produtoId":"P001"}]}` enviada a `POST /api/carrinho/calcular` e `POST /api/pedidos` (com cliente válido no segundo caso). **Esperado mínimo:** rejeitar o item sem quantidade. **Observado:** ambos responderam 422 `QUANTIDADE_INVALIDA`, com campo `itens[0].quantidade`.

O requisito de quantidade obrigatória foi respeitado. A tabela de erros da documentação descreve `ITEM_INVALIDO` para item incompleto e `QUANTIDADE_INVALIDA` para quantidade inválida; sem regra explícita de precedência para campo ausente, o código exato permanece uma **dúvida de contrato**, não um bug confirmado. [Requisições e respostas reais](../evidencias/exploratorios/quantidade-ausente.json) podem ser repetidas com `node scripts/registrar-quantidade-ausente.mjs`.
