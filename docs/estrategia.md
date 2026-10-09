# Estratégia de teste

**Fontes:** PDF do teste técnico e [documentação oficial VZS-142 v2.3.0](https://verzel-store.qa-test-verzel-store.workers.dev/documentacao). A aplicação calcula os valores pela API; a interface os apresenta.

## Prioridade e técnicas

1. **Alta:** cupom, cálculo, frete no limite inclusivo de R$ 200,00, limite de cinco unidades e pedido. Erros aqui alteram preço ou permitem um pedido inválido.
2. **Média:** mensagens de cupom, troca/remoção, validação de cliente e contrato de erro. A mensagem correta evita uma decisão errada do cliente e o contrato permite integração.
3. **Exploratória:** transições no carrinho, atualização de quantidades, esvaziamento, segunda aba e fluxos de checkout. As verificações manuais realizadas estão em [execucao-manual.md](execucao-manual.md).

Usei **partições de equivalência** para cupom válido, inexistente e expirado; **valores limite** para R$ 199,80 / R$ 199,90 / R$ 200,00 / R$ 219,80 e quantidades -1 / 0 / 1 / 5 / 6, além de quantidade fracionária, textual, nula e ausente; **tabela de decisão** para cupom com frete pago ou grátis; e **transição de estado** para aplicar/remover/reaplicar cupom e cruzar o limite do frete ao alterar quantidades. Os testes automatizados usam navegador real, um worker e contextos independentes. A compatibilidade repete um fluxo crítico em Chromium, Firefox e WebKit e verifica carrinho e checkout em Pixel 7 e iPhone 13 emulados, incluindo rolagem horizontal. No UI-17, somente a resposta do endpoint de cálculo é simulada como HTTP 500 para examinar a consistência do checkout; a requisição de pedido é real.

## Massas e oráculos

| Itens | Subtotal | Regra esperada |
|---|---:|---|
| P005 | R$ 100,00 | BEMVINDO10: desconto R$ 10,00; frete R$ 19,90; total R$ 109,90 |
| P004 + P005 + P008 | R$ 199,90 | Frete R$ 19,90; faltante R$ 0,10; total R$ 219,80 |
| 2 × P005 | R$ 200,00 | Frete grátis; total R$ 200,00 |
| P003 + P006 | R$ 219,80 | Com cupom: desconto R$ 21,98; frete grátis; total R$ 197,82 |
| 5 × P001 | R$ 299,50 | Quantidade máxima aceita |
| 6 × P001 | R$ 359,40 antes da validação | Rejeitar com 422 QUANTIDADE_MAXIMA_EXCEDIDA |

Os preços foram confirmados no catálogo oficial e em `GET /api/produtos`; as expectativas vêm da documentação e de contas explícitas, não dos valores devolvidos pela API. Não há produto ou preço inventado para criar R$ 199,99.

## Separação das regras de frete

O [CT07](execucao.md) usa duas mochilas, subtotal exato de R$ 200,00 e nenhum cupom para verificar o limite inclusivo do CA06. O [CT08](execucao.md) usa subtotal de R$ 219,80 e cupom que reduz o total para R$ 197,82; assim verifica o CA08 sem depender do comportamento da loja exatamente no limite. Se a verificação do subtotal antes do desconto usasse R$ 200,00, a falha do limite confundiria os dois resultados. Nesta rodada, CT07 reprovou e CT08 passou na API e na interface.

## Ambiguidades e limites

- CA10 significa **cinco unidades por produto**, não cinco unidades no carrinho inteiro. A massa 5 × P001 + 5 × P002 testa essa leitura.
- O catálogo e o único cupom válido geram valores com no máximo duas casas no desconto. CA11 foi verificado em resultados observáveis, mas não há massa documentada para diferenciar métodos de arredondamento de uma terceira casa decimal.
- A frase da vitrine sobre “primeira compra” não define uma regra verificável: os pedidos não são persistidos. Não a classificamos como bug.
- `GET /api/produtos/{id}` inexistente retorna 404; um item inexistente em `POST /api/carrinho/calcular` retorna 422. Esses contextos não são intercambiáveis.
- O cálculo de cupom inválido/expirado retorna 200 com mensagem; o pedido retorna 422. A assimetria é explícita na documentação.
- Há apenas um cupom válido documentado (`BEMVINDO10`) e nenhum contrato para cadastrar cupons neste ambiente. CA05 cobre remoção, reaplicação e tentativa posterior de cupom inválido sem desconto residual. A troca entre dois cupons válidos continua sem massa disponível.
- A regra de nome completo não especifica caracteres permitidos. `😀 😃` e `Jorge !@` são massas exploratórias em que não há nome e sobrenome identificáveis; suas falhas estão visíveis na suíte, com a interpretação sujeita à validação do produto. Não se pressupõe que toda pontuação em nomes seja inválida. A rejeição de `Jorge` sem sobrenome também continua coberta.
- Um item sem `quantidade` recebeu 422 `QUANTIDADE_INVALIDA` nos dois endpoints. Isso respeita a exigência de quantidade; a precedência entre `ITEM_INVALIDO` (item incompleto) e `QUANTIDADE_INVALIDA` (quantidade inválida) não está explícita para campo ausente.
- Um carrinho por aba, pedidos fictícios, ausência de cobrança/e-mail e API sem persistência são comportamentos esperados. Carga, estresse e segurança estão fora do escopo do PDF.
