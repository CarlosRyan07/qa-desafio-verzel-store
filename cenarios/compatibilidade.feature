# language: pt
Funcionalidade: Compatibilidade da jornada de compra
  Como cliente da Verzel Store
  Quero usar os fluxos principais em diferentes navegadores e telas
  Para conseguir comprar sem controles inacessíveis ou conteúdo cortado

  @COMP-01
  Esquema do Cenário: Fluxo principal funciona nos motores de navegador suportados
    Dado que acesso a loja no <navegador>
    Quando adiciono uma mochila ao carrinho
    E aplico o cupom BEMVINDO10
    E abro e preencho o checkout com dados válidos
    Então o desconto e o total devem permanecer corretos
    E os campos e o botão de confirmação devem estar visíveis

    Exemplos:
      | navegador |
      | Chromium  |
      | Firefox   |
      | WebKit    |

  @MOB-01
  Esquema do Cenário: Vitrine e carrinho permanecem utilizáveis no celular
    Dado que acesso a loja no <dispositivo>
    Quando adiciono uma camiseta e abro o carrinho
    Então os controles de quantidade, o resumo e a finalização devem estar visíveis
    E a página não deve ter rolagem horizontal

    Exemplos:
      | dispositivo |
      | Pixel 7     |
      | iPhone 13   |

  @MOB-02
  Esquema do Cenário: Cupom e checkout permanecem acessíveis no celular
    Dado que acesso a loja no <dispositivo>
    Quando adiciono uma mochila e aplico o cupom BEMVINDO10
    E abro e preencho o checkout
    Então os campos e o botão de confirmação devem estar visíveis
    E a página não deve ter rolagem horizontal

    Exemplos:
      | dispositivo |
      | Pixel 7     |
      | iPhone 13   |

  @MOB-03
  Esquema do Cenário: Mensagens de validação permanecem visíveis no celular
    Dado que acesso o checkout no <dispositivo>
    Quando tento confirmar o pedido com os campos vazios
    Então as mensagens de nome, e-mail e CEP devem estar visíveis
    E a página não deve ter rolagem horizontal

    Exemplos:
      | dispositivo |
      | Pixel 7     |
      | iPhone 13   |
