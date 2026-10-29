# vet

Site de clínica veterinária com loja pet, em três estilos visuais (cliente de exemplo: **Bicho Feliz**).
Estático, sem build: abre direto no navegador e publica no GitHub Pages.

## Vitrine

O `index.html` da raiz é a vitrine. Ele mostra o mesmo site com três botões embaixo, um para cada estilo, e troca entre eles com uma cortina lateral. Ao trocar, o visitante continua na mesma seção (serviços, loja, contato...).

| Botão | Pasta | Visual |
|---|---|---|
| Vibrante | `NEW/` | Verde, Figtree + Fraunces, tema claro/escuro e seletor de cor ("Amigo Fiel") |
| Acolhedor | `joaquim-version/` | Papel quente, teal e laranja, Young Serif, carrossel de fotos |
| Editorial | `EDITORIAL/` | Abertura editorial, Young Serif + Hanken Grotesk |

Cada pasta tem um `index.html` completo e funciona sozinho. A vitrine só os carrega em `iframe`, sem alterar nada neles.

- Link direto para um estilo: `?estilo=vibrante`, `?estilo=acolhedor` ou `?estilo=editorial`.
- Novo estilo: criar a pasta com o `index.html`, adicionar um `iframe` e um botão no `index.html` da raiz e incluir o nome na lista `ORDEM` do script.
- `joaquim-version/versao-descartada/` guarda uma versão antiga em várias páginas e não entra na vitrine.

Para ver localmente: `python3 -m http.server` na pasta do projeto e abrir http://localhost:8000. Abrindo o arquivo direto (`file://`) a troca funciona, mas o navegador bloqueia a sincronização da seção entre os estilos.
