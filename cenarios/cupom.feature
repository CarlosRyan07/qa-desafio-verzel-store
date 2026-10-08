# Fonte: documentação VZS-142 v2.3.0; valores em reais.
Funcionalidade: Cupom de desconto

  @CT01 @CA01 @CA09
  Cenário: Aplicar BEMVINDO10 a uma mochila sem descontar o frete
    Dado um carrinho com 1 produto P005 de R$ 100,00
    Quando aplico o cupom "BEMVINDO10"
    Então o desconto dos produtos deve ser R$ 10,00
    E o frete deve permanecer R$ 19,90
    E o total deve ser R$ 109,90

  @CT02 @CA02
  Cenário: Aceitar variações de caixa e espaços externos
    Dado um carrinho com 1 produto P005
    Quando aplico o cupom "bEmViNdO10" com dois espaços antes e depois
    Então o código aplicado deve ser "BEMVINDO10"
    E o desconto deve ser R$ 10,00

  @CT03 @CA03
  Cenário: Rejeitar cupom inexistente
    Dado um carrinho com 1 produto P005
    Quando tento aplicar o cupom "INEXISTENTE"
    Então o cálculo deve responder 200 e informar "Cupom inválido."
    E o desconto deve ser R$ 0,00
    E um pedido com o mesmo cupom deve responder 422 CUPOM_INVALIDO

  @CT04 @CA04
  Cenário: Rejeitar cupom expirado
    Dado um carrinho com 1 produto P005
    Quando tento aplicar o cupom "VERAO2026"
    Então o cálculo deve responder 200 e informar "Cupom expirado."
    E o desconto deve ser R$ 0,00
    E um pedido com o mesmo cupom deve responder 422 CUPOM_EXPIRADO

  @CT05 @CA05
  Cenário: Remover o cupom antes de reaplicá-lo
    Dado que BEMVINDO10 está aplicado no carrinho
    Quando removo o cupom
    Então o desconto deve voltar a R$ 0,00
    E o campo para aplicar outro cupom deve estar disponível
    Quando reaplico BEMVINDO10
    Então o desconto deve voltar a R$ 10,00 sem acumular
    Quando removo o cupom e tento aplicar INEXISTENTE
    Então deve aparecer "Cupom inválido."
    E o desconto deve permanecer em R$ 0,00

  @CT20 @CA01 @CA09
  Cenário: Recalcular valores após aumentar e diminuir a quantidade com cupom
    Dado 1 produto P001 no carrinho e o cupom BEMVINDO10 aplicado
    Quando aumento a quantidade para 2
    Então o subtotal deve ser R$ 119,80, o desconto R$ 11,98 e o total R$ 127,72
    Quando diminuo a quantidade para 1
    Então o subtotal deve ser R$ 59,90, o desconto R$ 5,99 e o total R$ 73,81
