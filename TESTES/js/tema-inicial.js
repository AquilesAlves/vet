// Roda no <head>, antes de a página aparecer, para ela não "piscar" no tema ou na cor errada.
(function () {
  var raiz = document.documentElement;
  var loja = typeof LOJA !== "undefined" ? LOJA : {};
  var tema = null;
  var cor = null;

  // O armazenamento pode estar bloqueado (aba anônima, cookies desligados).
  try {
    tema = localStorage.getItem("tema");
    cor = JSON.parse(localStorage.getItem("cor") || "null");
  } catch (erro) {}

  if (tema !== "claro" && tema !== "escuro") {
    tema = window.matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro";
  }
  raiz.setAttribute("data-tema", tema);

  // A cor testada no seletor só vale enquanto ele estiver ligado: entregue o site, vale a do cliente.
  if (!loja.seletorCores || !cor || !cor.claro || !cor.escuro) {
    cor = { claro: loja.cor, escuro: loja.corEscuro };
  }
  if (cor.claro) raiz.style.setProperty("--destaque-claro", cor.claro);
  if (cor.escuro) raiz.style.setProperty("--destaque-escuro", cor.escuro);
})();
