/* Clínica Veterinária Bicho Feliz */

(function () {
  var WHATSAPP = 'https://wa.me/5511900000000';

  // horário de atendimento: dia da semana (0 = domingo) -> [abre, fecha] em horas cheias; dia ausente = fechado
  var HORARIOS = { 1: [8, 19], 2: [8, 19], 3: [8, 19], 4: [8, 19], 5: [8, 19], 6: [8, 14] };
  var FUSO = 'America/Sao_Paulo';
  var NOMES_DIA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

  // menu do celular
  var menuBotao = document.querySelector('.menu-botao');
  var nav = document.querySelector('.nav');
  if (menuBotao && nav) {
    var menuIcone = menuBotao.querySelector('use');

    function abrirMenu(abrir) {
      nav.classList.toggle('aberto', abrir);
      menuBotao.setAttribute('aria-expanded', abrir);
      menuBotao.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
      menuIcone.setAttribute('href', abrir ? '#i-fechar' : '#i-menu');
    }

    menuBotao.addEventListener('click', function () {
      abrirMenu(!nav.classList.contains('aberto'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) abrirMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('aberto')) {
        abrirMenu(false);
        menuBotao.focus();
      }
    });
  }

  // carrossel
  var carrossel = document.querySelector('.carrossel');
  if (carrossel) {
    var slides = carrossel.querySelectorAll('.slide');
    var pontos = carrossel.querySelectorAll('.ponto');
    var botaoPausa = carrossel.querySelector('.pausa');
    var atual = 0;
    var timer = null;
    var pausadoPeloUsuario = false;
    var reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function ir(i) {
      atual = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) {
        s.classList.toggle('ativo', n === atual);
        s.setAttribute('aria-hidden', n !== atual);
      });
      pontos.forEach(function (p, n) {
        p.classList.toggle('ativo', n === atual);
        p.setAttribute('aria-current', n === atual);
      });
    }

    function iniciar() {
      if (reduzMovimento || pausadoPeloUsuario) return;
      parar();
      timer = setInterval(function () { ir(atual + 1); }, 5000);
    }

    function parar() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    // botão de pausa (WCAG 2.2.2): vale também no celular, onde não existe hover
    function atualizarPausa() {
      var parado = pausadoPeloUsuario || reduzMovimento;
      botaoPausa.setAttribute('aria-label', parado ? 'Retomar a troca automática de slides' : 'Pausar a troca automática de slides');
      botaoPausa.querySelector('use').setAttribute('href', parado ? '#i-play' : '#i-pausa');
    }
    botaoPausa.addEventListener('click', function () {
      pausadoPeloUsuario = !pausadoPeloUsuario;
      if (pausadoPeloUsuario) { parar(); } else { reduzMovimento = false; iniciar(); }
      atualizarPausa();
    });

    carrossel.querySelector('.ant').addEventListener('click', function () { ir(atual - 1); });
    carrossel.querySelector('.prox').addEventListener('click', function () { ir(atual + 1); });
    pontos.forEach(function (p, n) {
      p.addEventListener('click', function () { ir(n); });
    });

    carrossel.addEventListener('mouseenter', parar);
    carrossel.addEventListener('mouseleave', iniciar);
    carrossel.addEventListener('focusin', parar);
    carrossel.addEventListener('focusout', iniciar);

    // deslizar com o dedo
    var inicioX = null;
    carrossel.addEventListener('touchstart', function (e) { inicioX = e.touches[0].clientX; }, { passive: true });
    carrossel.addEventListener('touchend', function (e) {
      if (inicioX === null) return;
      var dx = e.changedTouches[0].clientX - inicioX;
      if (Math.abs(dx) > 50) ir(atual + (dx < 0 ? 1 : -1));
      inicioX = null;
    });

    ir(0);
    atualizarPausa();
    iniciar();
  }

  // faixa de informações: "Aberto agora" calculado pelo horário da clínica
  var statusTitulo = document.querySelector('.js-status-titulo');
  if (statusTitulo) {
    var statusPonto = document.querySelector('.js-status-ponto');
    var statusDetalhe = document.querySelector('.js-status-detalhe');
    var dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var relogio = new Intl.DateTimeFormat('en-US', { timeZone: FUSO, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' });

    function agora() {
      var v = {};
      relogio.formatToParts(new Date()).forEach(function (p) { v[p.type] = p.value; });
      return { dia: dias[v.weekday], hora: +v.hour + (+v.minute) / 60 };
    }

    function situacao() {
      var t = agora();
      var hoje = HORARIOS[t.dia];
      if (hoje && t.hora >= hoje[0] && t.hora < hoje[1]) {
        return { aberto: true, titulo: 'Aberto agora', detalhe: 'Fecha às ' + hoje[1] + 'h' };
      }
      if (hoje && t.hora < hoje[0]) {
        return { aberto: false, titulo: 'Fechado agora', detalhe: 'Abre hoje às ' + hoje[0] + 'h' };
      }
      for (var i = 1; i <= 7; i++) {
        var d = (t.dia + i) % 7;
        if (HORARIOS[d]) {
          return { aberto: false, titulo: 'Fechado agora', detalhe: 'Abre ' + (i === 1 ? 'amanhã' : NOMES_DIA[d]) + ' às ' + HORARIOS[d][0] + 'h' };
        }
      }
      return null;
    }

    function atualizarStatus() {
      var s = situacao();
      if (!s) return;
      statusTitulo.textContent = s.titulo;
      statusDetalhe.textContent = s.detalhe;
      statusPonto.className = 'status-ponto js-status-ponto ' + (s.aberto ? 'aberto' : 'fechado');
    }

    atualizarStatus();
    setInterval(atualizarStatus, 60000);
  }

  // menu: marca a seção que está na tela
  var secoes = document.querySelectorAll('main section[id]');
  var linksNav = document.querySelectorAll('.nav li a');
  if (secoes.length && linksNav.length && 'IntersectionObserver' in window) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        var id = entrada.target.id;
        linksNav.forEach(function (a) {
          if (a.getAttribute('href') === '#' + id) { a.setAttribute('aria-current', 'true'); }
          else { a.removeAttribute('aria-current'); }
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    secoes.forEach(function (s) { observador.observe(s); });
  }

  // contato: monta a mensagem e abre o WhatsApp da clínica
  var form = document.querySelector('.js-whatsapp');
  if (form) {
    var status = form.querySelector('.form-msg');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var f = form.elements;
      var linhas = ['Olá! Meu nome é ' + f.nome.value.trim() + '.'];
      if (f.pet.value.trim()) linhas.push('Meu pet: ' + f.pet.value.trim());
      linhas.push('Assunto: ' + f.assunto.value);
      linhas.push('');
      linhas.push(f.msg.value.trim());
      if (f.tel.value.trim()) linhas.push('', 'Telefone: ' + f.tel.value.trim());
      if (f.email.value.trim()) linhas.push('E-mail: ' + f.email.value.trim());

      var url = WHATSAPP + '?text=' + encodeURIComponent(linhas.join('\n'));
      window.open(url, '_blank', 'noopener');

      status.textContent = 'Abrimos o WhatsApp com a sua mensagem pronta. É só tocar em enviar. ';
      var link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Não abriu? Toque aqui.';
      status.appendChild(link);
      status.classList.add('visivel');
    });
  }
})();
