/* Clínica Veterinária Bicho Feliz */

(function () {
  var WHATSAPP = 'https://wa.me/5511900000000';

  // menu do celular
  var menuBotao = document.querySelector('.menu-botao');
  var nav = document.querySelector('.nav');
  if (menuBotao && nav) {
    menuBotao.addEventListener('click', function () {
      var aberto = nav.classList.toggle('aberto');
      menuBotao.setAttribute('aria-expanded', aberto);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('aberto')) {
        nav.classList.remove('aberto');
        menuBotao.setAttribute('aria-expanded', 'false');
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
      botaoPausa.firstElementChild.className = parado ? 'fas fa-play' : 'fas fa-pause';
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

  // loja: filtro por categoria e ordenação
  var grade = document.querySelector('[data-grade]');
  if (grade) {
    var itens = Array.prototype.slice.call(grade.querySelectorAll('.produto'));
    var chips = document.querySelectorAll('.chip');
    var contagem = document.querySelector('.js-contagem');
    var ordem = document.querySelector('.js-ordem');
    var categoria = 'todos';

    function filtrar() {
      var n = 0;
      itens.forEach(function (el) {
        var visivel = categoria === 'todos' || el.dataset.categoria === categoria;
        el.hidden = !visivel;
        if (visivel) n++;
      });
      contagem.textContent = 'Exibindo ' + n + (n === 1 ? ' produto' : ' produtos');
    }

    function ordenar() {
      var v = ordem.value;
      itens.slice().sort(function (a, b) {
        if (v === 'menor') return a.dataset.preco - b.dataset.preco;
        if (v === 'maior') return b.dataset.preco - a.dataset.preco;
        return a.dataset.ordem - b.dataset.ordem;
      }).forEach(function (el) { grade.appendChild(el); });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        categoria = chip.dataset.categoria;
        chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip); });
        filtrar();
      });
    });
    ordem.addEventListener('change', ordenar);
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
