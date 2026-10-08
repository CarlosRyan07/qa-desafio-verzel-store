# Fonte: documentação VZS-142 v2.3.0.
Funcionalidade: Limite de unidades por produto

  @CT11 @CA10
  Cenário: Cinco unidades de um produto são aceitas
    Dado 5 produtos P001 no carrinho
    Quando calculo o carrinho
    Então a API deve responder 200
    E o subtotal deve ser R$ 299,50

  @CT12 @CA10
  Cenário: Seis unidades de um produto são rejeitadas na API
    Dado 6 produtos P001 no carrinho
    Quando calculo o carrinho ou confirmo um pedido
    Então a API deve responder 422 QUANTIDADE_MAXIMA_EXCEDIDA

  @CT13 @CA10
  Cenário: Interface impede adicionar a sexta unidade
    Dado 5 unidades de Camiseta Essencial no carrinho
    Quando tento aumentar a quantidade
    Então os controles de adicionar e aumentar devem estar desabilitados

  @CT14 @CA10
  Cenário: Limite é por produto
    Dado 5 produtos P001 e 5 produtos P002 no carrinho
    Quando calculo o carrinho
    Então a API deve responder 200
    E o subtotal deve ser R$ 999,00
