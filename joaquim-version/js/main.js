/* Clínica Veterinária Bicho Feliz */

(function () {
  // menu do celular
  var menuBotao = document.querySelector('.menu-botao');
  var nav = document.querySelector('.nav');
  if (menuBotao && nav) {
    menuBotao.addEventListener('click', function () {
      var aberto = nav.classList.toggle('aberto');
      menuBotao.setAttribute('aria-expanded', aberto);
    });
  }

  // carrossel
  var carrossel = document.querySelector('.carrossel');
  if (carrossel) {
    var slides = carrossel.querySelectorAll('.slide');
    var pontos = carrossel.querySelectorAll('.ponto');
    var atual = 0;
    var timer = null;
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
      if (reduzMovimento) return;
      parar();
      timer = setInterval(function () { ir(atual + 1); }, 5000);
    }

    function parar() {
      if (timer) { clearInterval(timer); timer = null; }
    }

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
    iniciar();
  }

  // formulários só de demonstração
  document.querySelectorAll('.js-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.form-msg');
      var irmao = form.nextElementSibling;
      if (!msg && irmao && irmao.classList.contains('form-msg')) msg = irmao;
      if (msg) {
        msg.textContent = form.getAttribute('data-msg');
        msg.classList.add('visivel');
      }
      form.reset();
    });
  });
})();
