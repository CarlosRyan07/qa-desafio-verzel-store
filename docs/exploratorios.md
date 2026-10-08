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
