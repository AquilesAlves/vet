// Monta o site a partir de LOJA (config.js) e controla as interações.
(function () {
  "use strict";

  const raiz = document.documentElement;
  const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  const DIAS_TABELA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const DIAS_SCHEMA = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const NOMES_AGENDA = { petshop: "Pet shop", clinica: "Clínica" };
  const movimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Paleta do seletor de cores (só aparece com seletorCores: true).
  const PALETA = [
    { nome: "Cor da loja", claro: LOJA.cor, escuro: LOJA.corEscuro },
    { nome: "Azul", claro: "#1f5fbf", escuro: "#7fb0ff" },
    { nome: "Petróleo", claro: "#0e6e80", escuro: "#5fd0e3" },
    { nome: "Roxo", claro: "#6a3fc1", escuro: "#b9a0ff" },
    { nome: "Rosa", claro: "#b8205f", escuro: "#ff8ab8" },
    { nome: "Vermelho", claro: "#b42d22", escuro: "#ff8f80" },
    { nome: "Laranja", claro: "#b8500d", escuro: "#ffa45c" },
    { nome: "Grafite", claro: "#34403a", escuro: "#c7d3cc" },
  ];

  const $ = (seletor, base = document) => base.querySelector(seletor);
  const $$ = (seletor, base = document) => Array.from(base.querySelectorAll(seletor));

  // ---------- Utilidades ----------

  // Todo texto do config passa por aqui antes de ir para o HTML.
  function protegerTexto(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  // Igual a protegerTexto, mas libera <br> e <em> (usados no título).
  function textoComDestaque(texto) {
    return protegerTexto(texto).replace(/&lt;(\/?)(br|em)\s*\/?&gt;/gi, "<$1$2>");
  }

  function vazio(valor) {
    return valor == null || valor === "" || (Array.isArray(valor) && valor.length === 0);
  }

  const iconesDisponiveis = new Set($$("symbol").map((s) => s.id.slice(2)));
  function icone(nome, classe = "") {
    const id = iconesDisponiveis.has(nome) ? nome : "pata";
    return `<svg class="icone ${classe}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  }

  function iniciais(nome) {
    const partes = String(nome).replace(/^(dra?\.?)\s+/i, "").trim().split(/\s+/);
    return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
  }

  function linkWhatsApp(numero, mensagem) {
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem || LOJA.mensagemPadrao || "")}`;
  }

  const numeroClinica = LOJA.whatsappClinica || LOJA.whatsapp;
  const enderecoCompleto = [LOJA.endereco, LOJA.cidade, LOJA.cep].filter(Boolean).join(", ");

  // ---------- Horários ----------

  const agendas = Object.entries(LOJA.horarios || {}).filter(([, dias]) => Array.isArray(dias) && dias.length === 7);

  function paraMinutos(hora) {
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
  }

  function exibirHora(hora) {
    return hora === "24:00" ? "meia-noite" : hora;
  }

  // Dia da semana e minuto do dia no fuso da loja, para o status não errar com visitante de outro estado.
  function agoraNaLoja() {
    try {
      const partes = new Intl.DateTimeFormat("en-US", {
        timeZone: LOJA.fuso || undefined,
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).formatToParts(new Date());
      const valor = (tipo) => partes.find((p) => p.type === tipo).value;
      const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(valor("weekday"));
      return { dia, minutos: Number(valor("hour")) * 60 + Number(valor("minute")) };
    } catch (erro) {
      const agora = new Date();
      return { dia: agora.getDay(), minutos: agora.getHours() * 60 + agora.getMinutes() };
    }
  }

  function statusDaAgenda(dias) {
    const { dia, minutos } = agoraNaLoja();
    if (dias.every((h) => h && h[0] === "00:00" && h[1] === "24:00")) {
      return { aberto: true, texto: "Aberto 24 horas" };
    }
    const hoje = dias[dia];
    if (hoje && minutos >= paraMinutos(hoje[0]) && minutos < paraMinutos(hoje[1])) {
      return { aberto: true, texto: `Aberto agora · até ${exibirHora(hoje[1])}` };
    }
    for (let i = 0; i <= 7; i++) {
      const d = (dia + i) % 7;
      const h = dias[d];
      if (!h || (i === 0 && minutos >= paraMinutos(h[0]))) continue;
      const quando = i === 0 ? "hoje" : i === 1 ? "amanhã" : DIAS[d];
      return { aberto: false, texto: `Fechado · abre ${quando} às ${h[0]}` };
    }
    return { aberto: false, texto: "Fechado" };
  }

  function atualizarStatus() {
    const lista = $("#status");
    const comNome = agendas.length > 1;
    lista.innerHTML = agendas.map(([chave, dias]) => {
      const s = statusDaAgenda(dias);
      const nome = comNome ? `<strong>${protegerTexto(NOMES_AGENDA[chave] || chave)}</strong>` : "";
      return `<li class="status-item ${s.aberto ? "aberto" : "fechado"}"><span class="status-ponto"></span>${nome}<span>${s.texto}</span></li>`;
    }).join("");
    lista.hidden = agendas.length === 0;
    montarTabelaHorarios();
  }

  function montarTabelaHorarios() {
    const tabela = $("#horarios-tabela");
    if (!agendas.length) {
      $(".horarios").hidden = true;
      return;
    }
    const { dia: hoje } = agoraNaLoja();
    const faixa = (h) => {
      if (!h) return '<td class="fechado">Fechado</td>';
      if (h[0] === "00:00" && h[1] === "24:00") return "<td>24 horas</td>";
      return `<td>${h[0]}–${h[1] === "24:00" ? "00:00" : h[1]}</td>`;
    };
    const cabeca = agendas.length > 1
      ? `<thead><tr><th scope="col"><span class="sr">Dia</span></th>${agendas.map(([chave]) => `<th scope="col">${protegerTexto(NOMES_AGENDA[chave] || chave)}</th>`).join("")}</tr></thead>`
      : "";
    // Semana começando na segunda, como se lê no Brasil.
    const linhas = [1, 2, 3, 4, 5, 6, 0].map((d) => {
      const nome = `<span class="dia-longo">${DIAS_TABELA[d]}</span><span class="dia-curto">${DIAS_TABELA[d].slice(0, 3)}</span>`;
      const hojeAttr = d === hoje ? ' class="hoje" aria-current="date"' : "";
      return `<tr${hojeAttr}><th scope="row">${nome}</th>${agendas.map(([, dias]) => faixa(dias[d])).join("")}</tr>`;
    }).join("");
    tabela.innerHTML = `${cabeca}<tbody>${linhas}</tbody>`;
  }

  // ---------- Montagem das partes ----------

  function preencherTextos() {
    $$("[data-loja]").forEach((el) => {
      const valor = LOJA[el.dataset.loja];
      if (vazio(valor)) el.hidden = true;
      else el.textContent = valor;
    });
  }

  // Esconde as seções (e os links que levam a elas) cujo conteúdo ficou vazio no config.
  function esconderVazios() {
    const visivel = {
      emergencia: !vazio(LOJA.emergencia) && !vazio(LOJA.emergencia.telefone),
      seletorCores: LOJA.seletorCores === true,
      clinica: !vazio(LOJA.clinica),
      banhoTosa: !vazio(LOJA.banhoTosa),
      produtos: !vazio(LOJA.produtos),
      marcas: !vazio(LOJA.marcas),
      equipe: !vazio(LOJA.equipe),
      agendar: LOJA.agendamento !== false,
      depoimentos: !vazio(LOJA.depoimentos),
      faq: !vazio(LOJA.faq),
    };
    $$("[data-secao]").forEach((el) => { if (!visivel[el.dataset.secao]) el.remove(); });
    $$("[data-link]").forEach((el) => {
      if (!visivel[el.dataset.link]) (el.closest("li") || el).remove();
    });
    return visivel;
  }

  function montarPlantao() {
    const aviso = $("#aviso-plantao");
    if (!aviso) return;
    const e = LOJA.emergencia;
    aviso.innerHTML = `
      <div class="container aviso-plantao-interno">
        <span class="aviso-plantao-texto">${icone("alerta")} ${protegerTexto(e.texto || "Plantão para emergências")}</span>
        <a href="tel:+${e.telefone}">Ligar ${protegerTexto(e.exibicao || e.telefone)}</a>
      </div>`;
  }

  function montarHero(visivel) {
    $("#hero-titulo").innerHTML = textoComDestaque(LOJA.titulo || LOJA.nome);
    $("#hero-whatsapp").href = linkWhatsApp(LOJA.whatsapp);
    const destino = ["clinica", "banhoTosa", "produtos"].find((s) => visivel[s]);
    const ancora = { clinica: "#clinica", banhoTosa: "#banho-e-tosa", produtos: "#produtos" };
    if (destino) $("#hero-servicos").href = ancora[destino];
    else $("#hero-servicos").remove();

    const destaques = $("#hero-destaques");
    if (vazio(LOJA.destaques)) destaques.remove();
    else destaques.innerHTML = LOJA.destaques.map((d) => `<li>${icone("check")}${protegerTexto(d)}</li>`).join("");
  }

  // Cards de serviço: com o formulário ligado, "Agendar" leva a ele com o serviço já escolhido;
  // sem o formulário, abre o WhatsApp direto.
  function montarServicos(lista, idLista, grupo, visivel) {
    const ul = $(idLista);
    if (!ul) return;
    const numero = grupo === "clinica" ? numeroClinica : LOJA.whatsapp;
    ul.innerHTML = lista.map((s) => {
      const acao = visivel.agendar
        ? `<a class="card-acao" href="#agendar" data-servico="${protegerTexto(s.titulo)}">Agendar ${icone("seta")}</a>`
        : `<a class="card-acao" href="${linkWhatsApp(numero, `Olá! Gostaria de agendar: ${s.titulo}.`)}" target="_blank" rel="noopener">Agendar ${icone("seta")}</a>`;
      return `
        <li><article class="card">
          <span class="card-icone">${icone(s.icone)}</span>
          <h3 class="card-titulo">${protegerTexto(s.titulo)}</h3>
          <p class="card-texto">${protegerTexto(s.texto)}</p>
          ${s.detalhe ? `<p class="card-detalhe">${protegerTexto(s.detalhe)}</p>` : ""}
          ${acao}
        </article></li>`;
    }).join("");
    definirColunas(ul, lista.length);
  }

  function montarProdutos() {
    const ul = $("#lista-produtos");
    if (!ul) return;
    ul.innerHTML = LOJA.produtos.map((p) => {
      const topo = p.foto
        ? `<div class="card-foto"><img src="${protegerTexto(p.foto)}" alt="" loading="lazy" width="640" height="400"></div>`
        : `<span class="card-icone">${icone(p.icone)}</span>`;
      return `
        <li><article class="card">
          ${topo}
          <h3 class="card-titulo">${protegerTexto(p.titulo)}</h3>
          <p class="card-texto">${protegerTexto(p.texto)}</p>
          <a class="card-acao" href="${linkWhatsApp(LOJA.whatsapp, `Olá! Queria saber sobre ${p.titulo.toLowerCase()}.`)}" target="_blank" rel="noopener">Perguntar no WhatsApp ${icone("seta")}</a>
        </article></li>`;
    }).join("");
    definirColunas(ul, LOJA.produtos.length);
  }

  function montarEquipe() {
    const ul = $("#lista-equipe");
    if (!ul) return;
    ul.innerHTML = LOJA.equipe.map((p) => `
      <li><article class="card card-pessoa">
        <span class="avatar">${p.foto ? `<img src="${protegerTexto(p.foto)}" alt="" loading="lazy" width="200" height="200">` : protegerTexto(iniciais(p.nome))}</span>
        <h3 class="card-titulo">${protegerTexto(p.nome)}</h3>
        ${p.especialidade ? `<p class="card-texto">${protegerTexto(p.especialidade)}</p>` : ""}
        ${p.crmv ? `<p class="card-crmv">${protegerTexto(p.crmv)}</p>` : ""}
      </article></li>`).join("");
    definirColunas(ul, LOJA.equipe.length);
  }

  function montarDepoimentos() {
    const ul = $("#lista-depoimentos");
    if (!ul) return;
    ul.innerHTML = LOJA.depoimentos.map((d) => {
      const nota = Math.max(0, Math.min(5, Math.round(d.nota ?? 5)));
      return `
        <li><figure class="card card-depoimento">
          <div class="estrelas" role="img" aria-label="Nota ${nota} de 5">${icone("estrela").repeat(nota)}</div>
          <blockquote class="depoimento-texto">${protegerTexto(d.texto)}</blockquote>
          <figcaption class="depoimento-autor">
            <span class="avatar">${protegerTexto(iniciais(d.nome))}</span>
            <span><span class="depoimento-nome">${protegerTexto(d.nome)}</span><br><span class="depoimento-pet">${protegerTexto(d.pet || "")}</span></span>
          </figcaption>
        </figure></li>`;
    }).join("");
    definirColunas(ul, LOJA.depoimentos.length);

    const avaliacoes = $("#avaliacoes");
    if (LOJA.avaliacoesGoogle) {
      avaliacoes.innerHTML = `<a class="botao botao-secundario" href="${protegerTexto(LOJA.avaliacoesGoogle)}" target="_blank" rel="noopener">${icone("estrela")} Ver avaliações no Google</a>`;
    } else {
      avaliacoes.remove();
    }
  }

  // Quantas colunas a grade usa no computador: evita sobrar um card sozinho numa linha.
  function definirColunas(ul, quantidade) {
    const colunas = quantidade <= 4 ? quantidade : quantidade === 5 || quantidade === 6 || quantidade === 9 ? 3 : 4;
    ul.style.setProperty("--colunas", Math.max(colunas, 1));
  }

  function montarMarcas() {
    const trilho = $("#marcas-trilho");
    if (!trilho) return;
    // Repete a lista até ela ficar mais larga que uma tela grande; a cópia fecha o ciclo sem emenda.
    let itens = LOJA.marcas.slice();
    while (itens.length < 12) itens = itens.concat(LOJA.marcas);
    const lista = itens.map((m) => `<li>${protegerTexto(m)}</li>`).join("");
    trilho.innerHTML = `<ul class="marcas-lista">${lista}</ul><ul class="marcas-lista" aria-hidden="true">${lista}</ul>`;
  }

  function montarFaq() {
    const lista = $("#lista-faq");
    if (!lista) return;
    // name igual faz o navegador fechar uma pergunta quando outra abre.
    lista.innerHTML = LOJA.faq.map((f) => `
      <details name="faq">
        <summary>${protegerTexto(f.pergunta)}${icone("mais")}</summary>
        <p class="faq-resposta">${protegerTexto(f.resposta)}</p>
      </details>`).join("");
    $("#faq-whatsapp").href = linkWhatsApp(LOJA.whatsapp, "Olá! Tenho uma dúvida:");
  }

  function montarContato() {
    const e = LOJA.emergencia;
    const itens = [
      enderecoCompleto && { icone: "local", rotulo: "Endereço", valor: enderecoCompleto, link: linkComoChegar() },
      LOJA.whatsapp && {
        icone: "whatsapp",
        rotulo: LOJA.whatsappClinica ? "WhatsApp do pet shop" : "WhatsApp",
        valor: LOJA.whatsappExibicao || LOJA.whatsapp,
        link: linkWhatsApp(LOJA.whatsapp),
      },
      LOJA.whatsappClinica && {
        icone: "estetoscopio",
        rotulo: "WhatsApp da clínica",
        valor: LOJA.whatsappClinicaExibicao || LOJA.whatsappClinica,
        link: linkWhatsApp(LOJA.whatsappClinica),
      },
      LOJA.telefone && { icone: "telefone", rotulo: "Telefone", valor: LOJA.telefoneExibicao || LOJA.telefone, link: `tel:+${LOJA.telefone}`, mesmaAba: true },
      e && e.telefone && { icone: "alerta", rotulo: e.texto || "Emergências", valor: e.exibicao || e.telefone, link: `tel:+${e.telefone}`, mesmaAba: true, classe: "contato-urgente" },
      LOJA.email && { icone: "email", rotulo: "E-mail", valor: LOJA.email, link: `mailto:${LOJA.email}`, mesmaAba: true },
      LOJA.instagram && { icone: "instagram", rotulo: "Instagram", valor: "@" + LOJA.instagram.replace(/\/+$/, "").split("/").pop(), link: LOJA.instagram },
    ].filter(Boolean);

    $("#contato-lista").innerHTML = itens.map((i) => `
      <li class="${i.classe || ""}"><a href="${protegerTexto(i.link)}"${i.mesmaAba ? "" : ' target="_blank" rel="noopener"'}>
        <span class="contato-icone">${icone(i.icone)}</span>
        <span><span class="contato-rotulo">${protegerTexto(i.rotulo)}</span><span class="contato-valor">${protegerTexto(i.valor)}</span></span>
      </a></li>`).join("");

    const mapa = $("#mapa");
    if (LOJA.mapa || enderecoCompleto) {
      mapa.src = LOJA.mapa || `https://www.google.com/maps?q=${encodeURIComponent(`${LOJA.nome}, ${enderecoCompleto}`)}&output=embed`;
      $("#como-chegar").href = linkComoChegar();
    } else {
      $(".mapa").remove();
    }
  }

  function linkComoChegar() {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(enderecoCompleto)}`;
  }

  function montarRodape() {
    const redes = [
      LOJA.instagram && { icone: "instagram", nome: "Instagram", link: LOJA.instagram },
      LOJA.facebook && { icone: "facebook", nome: "Facebook", link: LOJA.facebook },
      LOJA.whatsapp && { icone: "whatsapp", nome: "WhatsApp", link: linkWhatsApp(LOJA.whatsapp) },
    ].filter(Boolean);
    $("#redes").innerHTML = redes.map((r) =>
      `<li><a href="${protegerTexto(r.link)}" target="_blank" rel="noopener" aria-label="${r.nome}">${icone(r.icone)}</a></li>`).join("");

    const c = LOJA.credito;
    if (c && c.nome && c.link) {
      $("#credito").innerHTML = `
        <span class="credito-rotulo">${protegerTexto(c.texto || "Desenvolvido por")}</span>
        <a class="credito-link" href="${protegerTexto(c.link)}" target="_blank" rel="noopener">${protegerTexto(c.nome)} ${icone("seta-diagonal")}</a>`;
    } else {
      $("#credito").remove();
    }

    $("#direitos").textContent = `© ${new Date().getFullYear()} ${LOJA.nome}. Todos os direitos reservados.`;
    if (LOJA.cnpj) $("#cnpj").textContent = `CNPJ ${LOJA.cnpj}`;
    else $("#cnpj").remove();

    $("#flutuante-whatsapp").href = linkWhatsApp(LOJA.whatsapp);
  }

  // ---------- Agendamento ----------

  function montarAgendamento() {
    const form = $("#formulario");
    if (!form) return;
    const select = $("#campo-servico");
    const grupos = [
      ["clinica", "Clínica veterinária", LOJA.clinica],
      ["banho", "Banho e tosa", LOJA.banhoTosa],
    ].filter(([, , lista]) => !vazio(lista));

    const opcoes = (lista, grupo) => lista.map((s) =>
      `<option value="${protegerTexto(s.titulo)}" data-grupo="${grupo}">${protegerTexto(s.titulo)}</option>`).join("");
    select.innerHTML = '<option value="">Escolha um serviço</option>' + (grupos.length > 1
      ? grupos.map(([g, rotulo, lista]) => `<optgroup label="${rotulo}">${opcoes(lista, g)}</optgroup>`).join("")
      : grupos.map(([g, , lista]) => opcoes(lista, g)).join(""));

    // Não deixa escolher um dia que já passou.
    const hoje = new Date();
    const doisDigitos = (n) => String(n).padStart(2, "0");
    $("#campo-data").min = `${hoje.getFullYear()}-${doisDigitos(hoje.getMonth() + 1)}-${doisDigitos(hoje.getDate())}`;

    // "Agendar" num card escolhe o serviço no formulário.
    document.addEventListener("click", (evento) => {
      const link = evento.target.closest("[data-servico]");
      if (!link) return;
      select.value = link.dataset.servico;
      select.removeAttribute("aria-invalid");
      setTimeout(() => $("#campo-tutor").focus({ preventScroll: true }), movimentoReduzido ? 0 : 500);
    });

    form.addEventListener("input", (evento) => evento.target.removeAttribute("aria-invalid"));

    form.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const aviso = $("#formulario-aviso");
      const obrigatorios = ["#campo-servico", "#campo-tutor", "#campo-pet"].map((s) => $(s));
      const faltando = obrigatorios.filter((campo) => !campo.value.trim());
      obrigatorios.forEach((campo) => campo.toggleAttribute("aria-invalid", faltando.includes(campo)));
      if (faltando.length) {
        aviso.textContent = "Preencha o serviço, o seu nome e o nome do pet.";
        aviso.className = "formulario-aviso erro";
        faltando[0].focus();
        return;
      }

      const dados = new FormData(form);
      const opcao = select.selectedOptions[0];
      const numero = opcao.dataset.grupo === "clinica" ? numeroClinica : LOJA.whatsapp;
      const linhas = [
        "Olá! Gostaria de agendar um horário.",
        "",
        `*Serviço:* ${dados.get("servico")}`,
        `*Pet:* ${dados.get("pet").trim()} (${dados.get("especie")})`,
        `*Tutor:* ${dados.get("tutor").trim()}`,
      ];
      const quando = [formatarData(dados.get("data")), dados.get("periodo")].filter(Boolean).join(", ");
      if (quando) linhas.push(`*Quando:* ${quando}`);
      const obs = dados.get("obs").trim();
      if (obs) linhas.push(`*Obs.:* ${obs}`);

      window.open(linkWhatsApp(numero, linhas.join("\n")), "_blank", "noopener");
      aviso.textContent = "Abrimos o WhatsApp com a mensagem pronta. É só enviar.";
      aviso.className = "formulario-aviso";
    });
  }

  function formatarData(valor) {
    if (!valor) return "";
    const [a, m, d] = valor.split("-").map(Number);
    const data = new Date(a, m - 1, d);
    return `${DIAS[data.getDay()]}, ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
  }

  // ---------- Dados para o Google (LocalBusiness) ----------

  function agruparHorarios(dias) {
    const grupos = new Map();
    dias.forEach((h, d) => {
      if (!h) return;
      const chave = h.join("-");
      if (!grupos.has(chave)) grupos.set(chave, { abre: h[0], fecha: h[1], dias: [] });
      grupos.get(chave).dias.push(DIAS_SCHEMA[d]);
    });
    return Array.from(grupos.values()).map((g) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: g.dias,
      opens: g.abre,
      closes: g.fecha === "24:00" ? "23:59" : g.fecha,
    }));
  }

  function montarDadosGoogle() {
    const [cidade, uf] = String(LOJA.cidade || "").split(/\s+-\s+/);
    const endereco = {
      "@type": "PostalAddress",
      streetAddress: LOJA.endereco,
      addressLocality: cidade,
      addressRegion: uf,
      postalCode: LOJA.cep,
      addressCountry: "BR",
    };
    const horariosLoja = LOJA.horarios?.petshop || LOJA.horarios?.clinica;
    const dados = {
      "@context": "https://schema.org",
      "@type": LOJA.tipoLoja || "PetStore",
      name: LOJA.nome,
      description: LOJA.rodapeTexto,
      url: LOJA.site,
      image: LOJA.site ? LOJA.site + "img/compartilhar.png" : undefined,
      telephone: LOJA.whatsapp ? "+" + LOJA.whatsapp : undefined,
      email: LOJA.email,
      address: endereco,
      openingHoursSpecification: horariosLoja ? agruparHorarios(horariosLoja) : undefined,
      sameAs: [LOJA.instagram, LOJA.facebook].filter(Boolean),
    };
    // A clínica entra como departamento, com horário e telefone próprios.
    if (LOJA.horarios?.petshop && LOJA.horarios?.clinica) {
      dados.department = {
        "@type": LOJA.tipoClinica || "VeterinaryCare",
        name: `${LOJA.nome} · Clínica veterinária`,
        telephone: "+" + numeroClinica,
        address: endereco,
        openingHoursSpecification: agruparHorarios(LOJA.horarios.clinica),
      };
    }
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(dados, (chave, valor) => (vazio(valor) ? undefined : valor));
    document.head.appendChild(script);
  }

  // ---------- Tema e cores ----------

  function configurarTema() {
    const botao = $("#botao-tema");
    const metaCor = $('meta[name="theme-color"]');

    function refletir() {
      const escuro = raiz.dataset.tema === "escuro";
      botao.setAttribute("aria-label", escuro ? "Ativar modo claro" : "Ativar modo escuro");
      $("use", botao).setAttribute("href", escuro ? "#i-sol" : "#i-lua");
      metaCor.content = getComputedStyle(raiz).getPropertyValue("--fundo").trim();
    }

    function aplicar(tema, salvar) {
      raiz.classList.add("trocando-tema");
      raiz.dataset.tema = tema;
      refletir();
      if (salvar) { try { localStorage.setItem("tema", tema); } catch (erro) {} }
      setTimeout(() => raiz.classList.remove("trocando-tema"), 400);
    }

    botao.addEventListener("click", () => aplicar(raiz.dataset.tema === "escuro" ? "claro" : "escuro", true));

    // Sem escolha salva, acompanha o sistema (ex.: celular que escurece à noite).
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (evento) => {
      let salvo = null;
      try { salvo = localStorage.getItem("tema"); } catch (erro) {}
      if (!salvo) aplicar(evento.matches ? "escuro" : "claro", false);
    });

    refletir();
  }

  function configurarCores() {
    const botao = $("#botao-cores");
    const paleta = $("#paleta");
    if (!botao || !paleta) return;

    const atual = () => getComputedStyle(raiz).getPropertyValue("--destaque-claro").trim().toLowerCase();
    paleta.setAttribute("role", "group");
    paleta.setAttribute("aria-label", "Cores de destaque");
    paleta.innerHTML = '<p class="paleta-titulo">Testar cor</p>' + PALETA.map((c, i) =>
      `<button type="button" data-cor="${i}" style="--amostra: ${c.claro}" aria-label="${c.nome}" title="${c.nome}"></button>`).join("");

    function marcarAtual() {
      $$("[data-cor]", paleta).forEach((b) => b.setAttribute("aria-pressed", PALETA[b.dataset.cor].claro.toLowerCase() === atual()));
    }

    function abrir(sim) {
      paleta.hidden = !sim;
      botao.setAttribute("aria-expanded", sim);
    }

    botao.addEventListener("click", (evento) => {
      evento.stopPropagation();
      abrir(paleta.hidden);
    });
    paleta.addEventListener("click", (evento) => {
      const b = evento.target.closest("[data-cor]");
      if (!b) return;
      const cor = PALETA[b.dataset.cor];
      raiz.classList.add("trocando-tema");
      raiz.style.setProperty("--destaque-claro", cor.claro);
      raiz.style.setProperty("--destaque-escuro", cor.escuro);
      try { localStorage.setItem("cor", JSON.stringify({ claro: cor.claro, escuro: cor.escuro })); } catch (erro) {}
      setTimeout(() => raiz.classList.remove("trocando-tema"), 400);
      marcarAtual();
    });
    document.addEventListener("click", (evento) => {
      if (!paleta.hidden && !paleta.contains(evento.target)) abrir(false);
    });
    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape" && !paleta.hidden) { abrir(false); botao.focus(); }
    });
    marcarAtual();
  }

  // ---------- Menu do celular ----------

  function configurarMenu() {
    const botao = $("#botao-menu");
    const menu = $("#menu");
    const telaGrande = window.matchMedia("(min-width: 1000px)");

    function abrir(sim) {
      document.body.classList.toggle("menu-aberto", sim);
      botao.setAttribute("aria-expanded", sim);
      botao.setAttribute("aria-label", sim ? "Fechar menu" : "Abrir menu");
      $("use", botao).setAttribute("href", sim ? "#i-fechar" : "#i-menu");
      // Fechado no celular, o menu sai da ordem do Tab.
      menu.inert = !sim && !telaGrande.matches;
    }

    botao.addEventListener("click", (evento) => {
      evento.stopPropagation();
      abrir(!document.body.classList.contains("menu-aberto"));
    });
    menu.addEventListener("click", (evento) => { if (evento.target.closest("a")) abrir(false); });
    // Toque fora do menu fecha.
    document.addEventListener("click", (evento) => {
      if (document.body.classList.contains("menu-aberto") && !menu.contains(evento.target)) abrir(false);
    });
    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape" && document.body.classList.contains("menu-aberto")) { abrir(false); botao.focus(); }
    });
    telaGrande.addEventListener("change", () => abrir(false));
    abrir(false);
  }

  // Marca no menu a seção que está na tela.
  function destacarSecaoAtual() {
    const links = $$('.menu-lista a[href^="#"]');
    const porId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        links.forEach((a) => a.removeAttribute("aria-current"));
        porId.get(entrada.target.id)?.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    porId.forEach((_, id) => { const secao = document.getElementById(id); if (secao) observador.observe(secao); });
    // A abertura não tem link: chegar nela limpa a marcação.
    observador.observe($("#inicio"));
  }

  // ---------- Carrosséis (só no celular; no computador viram grade) ----------

  function configurarCarrossel(trilho) {
    const itens = Array.from(trilho.children);
    if (itens.length < 2) return;

    const pontos = document.createElement("div");
    pontos.className = "carrossel-pontos";
    pontos.innerHTML = itens.map((_, i) => `<button type="button" aria-label="Ir para o card ${i + 1}"></button>`).join("");
    trilho.after(pontos);
    const botoes = Array.from(pontos.children);

    let atual = 0;
    let visivel = false;
    let parado = movimentoReduzido;

    const rolavel = () => trilho.scrollWidth > trilho.clientWidth + 4;
    const inicio = () => parseFloat(getComputedStyle(trilho).scrollPaddingLeft) || 0;

    function irPara(i) {
      trilho.scrollTo({ left: itens[i].offsetLeft - inicio(), behavior: movimentoReduzido ? "auto" : "smooth" });
    }

    function marcar() {
      const fim = trilho.scrollWidth - trilho.clientWidth;
      if (trilho.scrollLeft >= fim - 4) {
        atual = itens.length - 1;
      } else {
        let menor = Infinity;
        itens.forEach((item, i) => {
          const distancia = Math.abs(item.offsetLeft - inicio() - trilho.scrollLeft);
          if (distancia < menor) { menor = distancia; atual = i; }
        });
      }
      botoes.forEach((b, i) => b.setAttribute("aria-current", i === atual));
    }

    let quadro = 0;
    trilho.addEventListener("scroll", () => {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(marcar);
    }, { passive: true });

    pontos.addEventListener("click", (evento) => {
      const i = botoes.indexOf(evento.target.closest("button"));
      if (i < 0) return;
      parado = true;
      irPara(i);
    });

    // Quando a pessoa mexe, o avanço automático para de vez.
    ["pointerdown", "wheel", "focusin"].forEach((tipo) =>
      trilho.addEventListener(tipo, () => { parado = true; }, { passive: true }));

    new IntersectionObserver(([entrada]) => { visivel = entrada.isIntersecting; }, { threshold: 0.6 }).observe(trilho);

    setInterval(() => {
      if (parado || !visivel || document.hidden || !rolavel()) return;
      irPara((atual + 1) % itens.length);
    }, 4000);

    marcar();
  }

  // ---------- Rolagem: cabeçalho e botão de topo ----------

  function configurarRolagem() {
    const cabecalho = $("#cabecalho");
    const topo = $("#botao-topo");
    let pendente = false;
    function atualizar() {
      pendente = false;
      const y = window.scrollY;
      cabecalho.classList.toggle("rolou", y > 8);
      topo.classList.toggle("visivel", y > 600);
    }
    window.addEventListener("scroll", () => {
      if (!pendente) { pendente = true; requestAnimationFrame(atualizar); }
    }, { passive: true });
    topo.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: movimentoReduzido ? "auto" : "smooth" });
      $(".logo").focus({ preventScroll: true });
    });
    atualizar();
  }

  // ---------- Início ----------

  const visivel = esconderVazios();
  preencherTextos();
  if (visivel.emergencia) montarPlantao();
  montarHero(visivel);
  if (visivel.clinica) montarServicos(LOJA.clinica, "#lista-clinica", "clinica", visivel);
  if (visivel.banhoTosa) montarServicos(LOJA.banhoTosa, "#lista-banho", "banho", visivel);
  if (visivel.produtos) montarProdutos();
  if (visivel.marcas) montarMarcas();
  if (visivel.equipe) montarEquipe();
  if (visivel.depoimentos) montarDepoimentos();
  if (visivel.faq) montarFaq();
  if (visivel.agendar) montarAgendamento();
  montarContato();
  montarRodape();
  montarDadosGoogle();

  atualizarStatus();
  // Recalcula o status na virada de cada minuto.
  setTimeout(() => {
    atualizarStatus();
    setInterval(atualizarStatus, 60000);
  }, (60 - new Date().getSeconds()) * 1000);

  configurarTema();
  configurarCores();
  configurarMenu();
  destacarSecaoAtual();
  configurarRolagem();
  $$(".carrossel").forEach(configurarCarrossel);
})();
