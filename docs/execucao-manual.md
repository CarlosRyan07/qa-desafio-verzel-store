# Verificações manuais

Registrei estas capturas da loja e do Postman. Os resultados abaixo descrevem somente o que aparece nas imagens e as observações anotadas durante a exploração; a execução automatizada está registrada separadamente em [execucao.md](execucao.md).

| Critério | Massa e esperado | Observado | Resultado da verificação manual | Evidência |
|---|---|---|---|---|
| CA01 | 1 mochila de R$ 100,00 com BEMVINDO10: desconto R$ 10,00 e total R$ 109,90 | Resumo exibiu subtotal R$ 100,00, desconto R$ 10,00, frete R$ 19,90 e total R$ 109,90 | Aprovado para esta massa | [CA01](../evidencias/manuais/CA01.png) |
| CA02 | Cupom com letras em caixa diferente e espaços externos deve ser aceito | Código em caixa mista foi aplicado | Parcial: a captura não comprova espaços externos | [CA02–CA05](../evidencias/manuais/CA02-CA05.png) |
| CA03 e CA04 | Cupons INEXISTENTE e VERAO2026 devem exibir, respectivamente, “Cupom inválido.” e “Cupom expirado.” | Ambas as mensagens aparecem | Aprovado para as mensagens; o resumo com desconto zero não aparece na captura | [CA02–CA05](../evidencias/manuais/CA02-CA05.png) |
| CA05 | Um cupom por vez; após removê-lo, desconto deve zerar e campo reaparecer | Cupom aplicado e campo de entrada oculto aparecem | Parcial: remoção e reaplicação não estão na captura; [UI-01](execucao.md) verifica essas transições | [CA02–CA05](../evidencias/manuais/CA02-CA05.png) |
| CA06 | Subtotal R$ 200,00 deve ter frete grátis | Duas mochilas somam R$ 200,00, mas o frete é R$ 19,90, mesmo com a mensagem “Faltam R$ 0,00” | Reprovado — [BUG-01](bugs.md#bug-01) | [CA06](../evidencias/manuais/CA06.png) |
| CA07 | Abaixo de R$ 200,00, frete R$ 19,90 e indicação do valor faltante | Com subtotal R$ 100,00, frete R$ 19,90 e faltam R$ 100,00 | Aprovado para R$ 100,00; a borda de R$ 199,90 está na [rodada automatizada](execucao.md) | [CA07](../evidencias/manuais/CA07.png) |
| CA08 | Frete grátis considera subtotal anterior ao desconto | Subtotal R$ 219,80, desconto R$ 21,98, frete grátis e total R$ 197,82 | Aprovado para esta massa | [CA08](../evidencias/manuais/CA08.png) |
| CA09 | Desconto não incide no frete | Resumo exibe subtotal R$ 100,00, desconto R$ 10,00, frete R$ 19,90 e total R$ 109,90 | Aprovado para esta massa | [CA09](../evidencias/manuais/CA09.png) |
| CA10 | Máximo de cinco unidades por produto na interface e na API | Carrinho bloqueou o aumento após cinco; Postman recebeu HTTP 200 e calculou seis unidades do P001 | Reprovado na API — [BUG-02](bugs.md#bug-02) | [CA10](../evidencias/manuais/CA10.png) |
| CA11 | Valores monetários apresentados com duas casas decimais | Resumo exibe R$ 89,70, R$ 8,97, R$ 19,90 e R$ 100,63 | Aprovado para a apresentação; não distingue métodos de arredondamento | [CA11](../evidencias/manuais/CA11.png) |
| Checkout exploratório | Nome completo precisa conter nome e sobrenome válidos | Pedido foi confirmado com caracteres especiais e emojis no lugar de nome e sobrenome válidos; também observei aceitação de uma entrada só com emojis | Reprovado para a massa exibida — [BUG-03](bugs.md#bug-03) | [Nome e confirmação](../evidencias/manuais/nome-emoji-caracteres.png) |

As imagens manuais foram preservadas como recebidas; algumas reúnem recortes de momentos diferentes. Os cenários automatizados complementam esses registros sem transformar passos não documentados em execuções manuais.
