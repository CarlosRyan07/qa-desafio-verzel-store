# Fonte: documentação VZS-142 v2.3.0.
Funcionalidade: Checkout e contrato da API

  @CT15
  Cenário: Confirmar pedido válido com resumo consistente
    Dado 1 P005 no carrinho e o cupom BEMVINDO10 aplicado
    E nome completo, e-mail válido e CEP de 8 dígitos
    Quando confirmo o pedido
    Então a API deve responder 201 com número no formato VZ- seguido de seis dígitos
    E subtotal, desconto, frete e total devem coincidir com o cálculo
    E o total deve ser R$ 109,90
    E o carrinho deve ficar vazio após a confirmação
    E a API deve aceitar CEP com e sem hífen

  @CT16
  Cenário: Rejeitar dados de cliente inválidos
    Dado um pedido com nome sem sobrenome, e-mail inválido e CEP inválido
    Quando confirmo o pedido
    Então a API deve responder 422 DADOS_INVALIDOS
    E deve detalhar cliente.nome, cliente.email e cliente.cep
    E cada campo deve ser rejeitado também quando é o único inválido

  @CT22
  Cenário: Campos obrigatórios vazios impedem o envio do pedido
    Dado um produto no carrinho e os campos do checkout vazios
    Quando tento confirmar o pedido
    Então nome, e-mail e CEP devem exibir mensagens de obrigatoriedade
    E nenhuma requisição de pedido deve ser enviada

  @CT23
  Esquema do Cenário: Interface rejeita e-mail ou CEP inválido isoladamente
    Dado um produto no carrinho e os demais dados válidos
    Quando informo apenas o campo "<campo>" com valor "<valor>" inválido
    Então a mensagem "<mensagem>" deve aparecer
    E nenhuma requisição de pedido deve ser enviada
    Exemplos:
      | campo  | valor          | mensagem                        |
      | E-mail | email-invalido | Informe um e-mail válido.       |
      | CEP    | 123            | Informe um CEP com 8 dígitos.   |

  @EXP-01
  Esquema do Cenário: Rejeitar nome e sobrenome não identificáveis
    Dado um carrinho com 1 produto P001
    E um cliente com e-mail e CEP válidos, mas nome "<nome>"
    Quando confirmo o pedido pela interface ou pela API
    Então o pedido não deve ser criado
    E a interface deve informar "Informe nome e sobrenome."
    E a API deve responder 422 DADOS_INVALIDOS para cliente.nome
    # Esperado exploratório para estas massas, sem generalizar a todos os nomes com símbolos.
    Exemplos:
      | nome     |
      | 😀 😃    |
      | Jorge !@ |

  @CT27
  Cenário: Rejeitar e-mail com caracteres inválidos no domínio
    Dado um carrinho com P001 e os demais dados válidos
    Quando informo qa@!!!!.com no checkout ou em POST /api/pedidos
    Então a interface deve informar "Informe um e-mail válido." sem confirmar o pedido
    E a API deve responder 422 DADOS_INVALIDOS para cliente.email

  @EXP-02
  Cenário: Não confirmar valor diferente do apresentado após falha no recálculo
    Dado um carrinho com uma unidade de P001 e total R$ 79,80
    Quando aumento a quantidade para duas unidades e o recálculo retorna 500
    Então o checkout deve ser bloqueado ou atualizar o valor antes da confirmação
    E um pedido confirmado deve ter total igual ao total exibido no checkout

  @CT17
  Cenário: Distinguir consulta de produto inexistente de item inexistente no carrinho
    Dado o id de produto "NAO_EXISTE"
    Quando consulto esse id
    Então a API deve responder 404 PRODUTO_NAO_ENCONTRADO
    Quando uso esse id em um carrinho
    Então a API deve responder 422 PRODUTO_NAO_ENCONTRADO

  @CT21
  Cenário: Consultar um produto existente pelo ID
    Dado o id P005 da Mochila Urbana 20L
    Quando consulto GET /api/produtos/P005
    Então a API deve responder 200 com id P005 e preço R$ 100,00

  @CT18
  Esquema do Cenário: Contrato de erro documentado
    Dado o corpo <corpo> para <metodo> <rota>
    Quando envio a requisição que causa "<codigo>"
    Então o status deve ser <status>
    E o erro.codigo deve ser "<codigo>"
    Exemplos:
      | codigo               | metodo | rota                   | corpo                                                                       | status |
      | JSON_INVALIDO         | POST   | /api/carrinho/calcular | {                                                                           | 400    |
      | ROTA_NAO_ENCONTRADA   | GET    | /api/rota-inexistente  | sem corpo                                                                   | 404    |
      | METODO_NAO_PERMITIDO  | GET    | /api/pedidos           | sem corpo                                                                   | 405    |
      | ITENS_OBRIGATORIOS    | POST   | /api/carrinho/calcular | {"itens":[]}                                                                | 422    |
      | ITEM_INVALIDO         | POST   | /api/carrinho/calcular | {"itens":[null]}                                                          | 422    |
      | ITEM_DUPLICADO        | POST   | /api/carrinho/calcular | {"itens":[{"produtoId":"P001","quantidade":1},{"produtoId":"P001","quantidade":1}]} | 422    |
      | QUANTIDADE_INVALIDA   | POST   | /api/carrinho/calcular | {"itens":[{"produtoId":"P001","quantidade":0}]}                          | 422    |
      | QUANTIDADE_INVALIDA   | POST   | /api/carrinho/calcular | {"itens":[{"produtoId":"P001","quantidade":1.5}]}                        | 422    |
      | QUANTIDADE_INVALIDA   | POST   | /api/carrinho/calcular | {"itens":[{"produtoId":"P005","quantidade":-1}]}                         | 422    |
      | QUANTIDADE_INVALIDA   | POST   | /api/carrinho/calcular | {"itens":[{"produtoId":"P005","quantidade":"2"}]}                        | 422    |
      | QUANTIDADE_INVALIDA   | POST   | /api/carrinho/calcular | {"itens":[{"produtoId":"P005","quantidade":null}]}                       | 422    |
      | ITENS_OBRIGATORIOS    | POST   | /api/carrinho/calcular | {}                                                                          | 422    |
