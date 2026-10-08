# Fonte: documentação VZS-142 v2.3.0.
Funcionalidade: Frete e total do pedido

  @CT06 @CA07
  Cenário: Subtotal logo abaixo do limite
    Dado 1 P004, 1 P005 e 1 P008 no carrinho
    Quando calculo o carrinho
    Então o subtotal deve ser R$ 199,90
    E o frete deve ser R$ 19,90
    E o faltante para frete grátis deve ser R$ 0,10
    E o total deve ser R$ 219,80

  @CT07 @CA06
  Cenário: Frete grátis exatamente no limite inclusivo
    Dado 2 produtos P005 no carrinho
    Quando calculo o carrinho e confirmo um pedido válido
    Então o subtotal deve ser R$ 200,00
    E o frete deve ser R$ 0,00 em ambos
    E o total deve ser R$ 200,00 em ambos

  @CT08 @CA06 @CA08 @CA11
  Cenário: Desconto não retira elegibilidade ao frete grátis
    Dado 1 P003 e 1 P006 no carrinho
    Quando aplico BEMVINDO10
    Então o subtotal deve ser R$ 219,80
    E o desconto deve ser R$ 21,98
    E o frete deve ser R$ 0,00
    E o total deve ser R$ 197,82

  @CT09 @CA09
  Cenário: Desconto não incide sobre o frete pago
    Dado 1 P005 no carrinho
    Quando aplico BEMVINDO10
    Então o frete deve continuar em R$ 19,90
    E o total deve ser R$ 109,90

  @CT10 @CA11
  Cenário: Valores monetários têm precisão de duas casas
    Dado 1 P003 e 1 P006 no carrinho
    Quando aplico BEMVINDO10
    Então o desconto deve ser R$ 21,98
    E o total deve ser R$ 197,82

  @CT24 @CA07
  Cenário: Interface informa o faltante imediatamente abaixo do limite
    Dado P004, P005 e P008 no carrinho
    Quando abro o resumo do pedido
    Então o subtotal deve ser R$ 199,90, o frete R$ 19,90 e o total R$ 219,80
    E a interface deve informar que faltam R$ 0,10 para o frete grátis

  @CT25 @CA08
  Cenário: Interface mantém frete grátis após aplicar desconto
    Dado P003 e P006 no carrinho, com subtotal R$ 219,80
    Quando aplico BEMVINDO10
    Então o desconto deve ser R$ 21,98 e o frete deve continuar grátis
    E o total deve ser R$ 197,82

  @CT26 @CA07 @CA08
  Cenário: Frete muda ao cruzar o limite nos dois sentidos
    Dado P002 e P001 no carrinho com BEMVINDO10 aplicado
    Então o subtotal deve ser R$ 199,80 e o frete R$ 19,90
    Quando aumento P001 para 2 unidades
    Então o subtotal deve ser R$ 259,70 e o frete deve ser grátis
    Quando diminuo P001 para 1 unidade
    Então o frete deve voltar a R$ 19,90
