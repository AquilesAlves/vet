# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Site estático em HTML, CSS e JavaScript puro, sem build. Abre direto no navegador e publica no GitHub Pages (ver `../README.md`). Mantém-se assim.

## Users
Tutores de cães e gatos da região da clínica, que chegam pelo celular ou pelo computador. Três situações: marcar consulta, vacina ou banho e tosa; descobrir rápido se a clínica está aberta e como ligar quando o pet passou mal; comprar ração, petisco ou acessório sem sair de casa.

## Product Purpose
Site de uma clínica veterinária com loja pet. Faz o tutor agendar um atendimento (ação principal) e sempre ter à mão o telefone de urgência, o horário e o endereço. Sucesso é a pessoa agendar ou ligar sem precisar procurar nada.

## Positioning
O produto é um **modelo de site para adaptar a vários clientes**. "Bicho Feliz" é o cliente de exemplo. A diferença está em juntar clínica e loja numa página só, com agendamento e pedidos resolvidos pelo WhatsApp, sem carrinho nem pagamento online.

## Operating Context
- Atendimento com hora marcada, de segunda a sexta (8h às 19h) e sábado (8h às 14h), com urgências atendidas no horário de funcionamento.
- Pedidos da loja e mensagens do formulário de contato saem pelo WhatsApp (`wa.me`), com a mensagem já montada. O formulário não envia e-mail nem guarda dados.
- Banho e tosa com serviço de leva e traz.

## Capabilities and Constraints
- Serviços: consultas, vacinas, cirurgias, exames, banho e tosa, internação.
- Loja: rações, petiscos, brinquedos, roupas e acessórios, caminhas. Frete grátis acima de R$ 99 e parcelamento em até 3x sem juros (condições do cliente de exemplo).
- **Nome, telefone, WhatsApp, e-mail, endereço, horário, CNPJ e CRMV são fictícios** e precisam ser fáceis de trocar para cada cliente. Nenhum dado novo deve ser inventado.
- Decisão do usuário (2026-10-28): o site passa a ser **uma página única**; `servicos.html`, `loja.html` e `contato.html` redirecionam para as seções.
- Ainda indefinido: lista final de produtos da loja (a página única mostra uma seleção) e domínio de publicação.

## Brand Commitments
O rascunho do Joaquim (`Imagem base joaquim.png`) fixa a estrutura: barra de navegação no topo, carrossel de fotos de animais com setas e pontos, depois blocos de foto de animal ou coisa de veterinário ao lado de título e texto descritivo. As cores teal e laranja atuais seguem como ponto de partida, sem ser regra. Fontes podem ser trocadas (autorizado pelo usuário).

## Evidence on Hand
- Fotos: todas do Unsplash, provisórias. Ainda não há fotos reais da clínica, da equipe nem do consultório; o layout deve estar pronto para recebê-las.
- Depoimentos (Ana Paula, Ricardo, Juliana) e "10+ anos" são texto de exemplo do modelo, não prova real. Não há nota do Google nesta versão e não deve ser criada.
- Contato, e-mail, CNPJ e CRMV: apenas marcadores (`.example`, zeros).

## Product Principles
1. Agendar uma consulta é sempre a ação principal; a urgência por telefone fica sempre visível ao lado.
2. Informação útil antes de enfeite: horário, "aberto agora" e endereço aparecem sem precisar rolar.
3. Tudo que muda de cliente para cliente (nome, telefone, horário, produtos, fotos) fica em um lugar claro, nunca espalhado.
4. Honestidade de conteúdo: o que é exemplo é tratado como exemplo, sem prova ou número inventado.
5. Funciona bem no celular, com uma mão, e sem depender de JavaScript para o conteúdo principal.

## Accessibility & Inclusion
Manter o que já existe: link "Pular para o conteúdo", navegação por teclado, foco visível, contraste mínimo AA, pausa do carrossel (WCAG 2.2.2) e respeito a `prefers-reduced-motion`. Idioma `pt-BR`.
