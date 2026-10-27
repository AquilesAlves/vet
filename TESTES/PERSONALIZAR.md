# Como adaptar o site para um cliente

Site estático: abre direto no navegador e publica no GitHub Pages, sem instalar nada.

```
index.html            estrutura da página, ícones e ilustração da abertura
css/estilo.css        todo o visual
js/config.js          TODOS os dados da loja (o único arquivo editado por cliente)
js/script.js          monta as seções a partir do config e controla as interações
js/tema-inicial.js    aplica o tema e a cor salvos antes de a página aparecer
img/                  favicon, ícone do iPhone e imagem de prévia do link
```

## 1. Dados da loja (`js/config.js`)

Tudo fica no objeto `LOJA`. **Campo opcional vazio (`""`, `[]` ou `null`) esconde a parte do site
que depende dele**, inclusive o link no menu.

| Campo | Para que serve |
|---|---|
| `nome`, `site` | Nome da loja e endereço público do site (`https://.../`, com barra no fim) |
| `tipoLoja`, `tipoClinica` | Tipos do schema.org para o Google (`PetStore`, `VeterinaryCare`) |
| `whatsapp`, `whatsappExibicao` | Número só com dígitos (DDI + DDD + número) e o texto exibido |
| `whatsappClinica`, `whatsappClinicaExibicao` | Número próprio da clínica. Vazio: usa o `whatsapp` |
| `mensagemPadrao` | Mensagem pronta dos botões de WhatsApp |
| `telefone`, `telefoneExibicao`, `email`, `instagram`, `facebook` | Contatos e redes |
| `endereco`, `cidade`, `cep` | Endereço; `cidade` no formato `"Cidade - UF"` |
| `mapa` | Link de incorporação do Google Maps. Vazio: gera pelo endereço |
| `fuso` | Fuso da loja (`America/Sao_Paulo`, `America/Manaus`...) |
| `cnpj`, `avaliacoesGoogle` | Rodapé e botão "Ver avaliações no Google" |
| `emergencia` | `{ texto, telefone, exibicao }` da faixa de plantão. `null` esconde |
| `credito` | "Desenvolvido por SHIFT" no rodapé |
| `cor`, `corEscuro` | Cor de destaque nos modos claro e escuro |
| `seletorCores` | `true` mostra a paleta para testar cores com o cliente; **`false` ao entregar** |
| `titulo`, `subtitulo`, `destaques` | Abertura (`<br>` quebra linha, `<em>` pinta na cor de destaque) |
| `sobreTexto`, `rodapeTexto` | Textos de "Onde estamos" e do rodapé |
| `horarios` | `petshop` e `clinica`, 7 itens cada (domingo a sábado) |
| `agendamento` | `true` mostra o formulário que monta a mensagem do WhatsApp |
| `clinica`, `banhoTosa`, `produtos` | Cards com `icone`, `titulo`, `texto` e `detalhe` (ou `foto` nos produtos) |
| `marcas`, `equipe`, `depoimentos`, `faq` | Listas editáveis |

### Horários

Cada dia é `["08:00", "19:00"]` ou `null` (fechado). `"24:00"` vale como meia-noite; os 7 dias em
`["00:00", "24:00"]` mostram "Aberto 24 horas". Pode deixar só uma agenda (ex.: só `petshop`).

O status ("Aberto agora · até 19:00" / "Fechado · abre amanhã às 08:00") é calculado sozinho,
**na hora da loja** (`fuso`), e atualiza a cada minuto. A tabela destaca o dia de hoje.

### Agendamento

O formulário não usa servidor: monta a mensagem e abre o WhatsApp. Serviços da clínica vão para
`whatsappClinica`; banho e tosa vão para `whatsapp`. O botão "Agendar" de cada card já escolhe o
serviço no formulário. Com `agendamento: false`, o botão abre o WhatsApp direto.

### Ícones

Os nomes ficam listados no topo das listas do `config.js`. Para criar outro, adicione um
`<symbol id="i-nome">` no começo do `index.html` (traço de 24×24, cor por `currentColor`).

## 2. O que trocar fora do config

- **`index.html`**: `<title>`, `description`, `canonical` e as tags `og:`/`twitter:`.
  **`og:url` e `og:image` precisam do endereço completo (`https://...`)**: com caminho relativo o
  WhatsApp não acha a imagem. Para conferir: developers.facebook.com/tools/debug.
- **`img/compartilhar.png`** (1200×630): a abertura do site, sem o status de horário.
- **`img/favicon.svg`** e **`img/icone-180.png`** (iPhone) na cor do cliente.
- Conferir os dados para o Google em search.google.com/test/rich-results.

## 3. Publicar uma atualização

Os arquivos têm versão no `index.html` (`css/estilo.css?v=1` etc.). **A cada publicação, suba o
número nos quatro lugares**, senão quem já visitou (principalmente no celular) continua vendo a
versão antiga.

## 4. Responsivo

Testar sempre em 360, 375, 390, 414, 620, 768, 1024, 1280, **1366×768**, 1440 e 1920, nos modos
claro e escuro: sem rolagem lateral, sem erros e sem conteúdo coberto pelos botões flutuantes.

| Largura | O que acontece |
|---|---|
| até 619px | Cards viram carrossel (um por vez, pontinhos e avanço a cada 4s quando visível) |
| a partir de 620px | Cards em grade; a última linha incompleta fica centralizada |
| a partir de 900px | Abertura em duas colunas (texto e ilustração) |
| a partir de 1000px | Menu completo no cabeçalho; abaixo disso, botão de menu |
| altura até 820px | Abertura mais compacta para caber em notebooks 1366×768 |

O menu do celular fecha no X, num link, ao tocar fora e com Esc. Quem desativa animações no
sistema (`prefers-reduced-motion`) não vê nada se mexendo.

## 5. Checklist de entrega

- [ ] Dados reais no `config.js` (nome, WhatsApp, endereço, CEP, horários, redes, plantão)
- [ ] `seletorCores: false`
- [ ] Depoimentos reais (ou `depoimentos: []`)
- [ ] Equipe com CRMV real (ou `equipe: []`)
- [ ] Fotos e logo do cliente em `img/`
- [ ] `<title>`, descrição, `canonical`, `og:url` e `og:image` com o domínio do cliente
- [ ] `site` no `config.js` com o mesmo domínio
- [ ] Link de `avaliacoesGoogle` (se houver)
- [ ] Número de versão (`?v=`) atualizado
- [ ] Teste em celular de verdade (iPhone e Android) e no depurador do Facebook
