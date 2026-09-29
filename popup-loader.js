// MyMetric Popup Loader v1.0
//
// Uma tag só no GTM no lugar de uma tag por popup. O texto, a imagem, as
// cores, as datas e as regras de página de cada popup são editados no hub
// (aba E-mail > Popups) e lidos daqui em tempo real. O desenho continua sendo
// o popup.js, então o DOM, os eventos `mm_modal` e o cadastro em
// `<slug>_popup_subscribe` não mudam.
//
// Mostra no máximo um popup por página: o de maior prioridade entre os que
// estão no ar e cujas regras batem.
//
// Prévia de um popup (mesmo desligado): ?mm_popup=<popup_id>. Na prévia o
// cadastro vai para `<slug>_popup_preview`, fora da base de contatos.

(function () {
  var API = 'https://email-ingest-113766447910.us-central1.run.app/popups/site/';
  var POPUP_JS = 'https://cdn.jsdelivr.net/gh/mymetric/scripts@main/popup.js';
  var POSTS = 'https://events.mymetric.app/posts?event_name=';

  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return m ? m[2] : null;
  }

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function testa(regra) {
    var alvo = regra.campo === 'caminho' ? location.pathname : location.href;
    var v = regra.valor;
    switch (regra.op) {
      case 'contem': return alvo.indexOf(v) !== -1;
      case 'nao_contem': return alvo.indexOf(v) === -1;
      case 'igual': return alvo === v;
      case 'regex':
      case 'nao_regex':
        var bate;
        try { bate = new RegExp(v).test(alvo); } catch (e) { return false; }
        return regra.op === 'regex' ? bate : !bate;
    }
    return false;
  }

  function serve(p) {
    if (p.dispositivo === 'desktop' && isMobile()) return false;
    if (p.dispositivo === 'mobile' && !isMobile()) return false;
    var regras = p.regras || [];
    for (var i = 0; i < regras.length; i++) {
      if (!testa(regras[i])) return false;
    }
    return true;
  }

  function carregaPopupJs(cb) {
    if (typeof window.createPopup === 'function') return cb();
    var js = document.createElement('script');
    js.src = POPUP_JS;
    js.onload = cb;
    document.head.appendChild(js);
  }

  // Telefone obrigatório: o popup.js só valida nome e e-mail. Mesmo remendo
  // que as tags da Coffee++ usavam, agora num lugar só.
  function exigeTelefone() {
    var espera = setInterval(function () {
      var botao = document.querySelector('#image-popup-overlay button');
      var tel = document.querySelector('#image-popup-overlay input[name="phone"]');
      if (!botao || !tel) return;
      clearInterval(espera);
      botao.addEventListener('click', function (e) {
        var n = tel.value.replace(/\D/g, '').length;
        if (n >= 11) return;
        var erro = tel.nextElementSibling;
        if (erro) {
          erro.innerHTML = n === 0 ? 'Telefone obrigatório.' : 'Telefone incompleto, digite seu telefone completo.';
          erro.style.display = 'block';
        }
        e.stopImmediatePropagation();
      }, true);
    }, 300);
    setTimeout(function () { clearInterval(espera); }, 60000);
  }

  function mostra(slug, p, previa) {
    if (p.css_extra) {
      var st = document.createElement('style');
      st.textContent = p.css_extra;
      document.head.appendChild(st);
    }
    carregaPopupJs(function () {
      if (!p.aviso_navegador_meta) {
        window.isMetaBrowser = function () { return false; };
      }
      var img = (isMobile() && p.imagem_mobile) ? p.imagem_mobile : p.imagem_desktop;
      var evento = slug + (previa ? '_popup_preview' : '_popup_subscribe');
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'mm_popup', popup_action: 'view', popup_id: p.id });
      window.createPopup(
        img, p.titulo, p.subtitulo, POSTS + evento, p.botao_texto, p.fechar_texto,
        p.mensagem_final, '', p.dias_fechado, p.cor_botao_texto, p.cor_botao_fundo,
        p.telefone === 'oculto',
        false, '', '', '', [], p.id
      );
      if (p.telefone === 'obrigatorio') exigeTelefone();
    });
  }

  // Na prévia, quem testa quase sempre já se cadastrou em algum popup, e o
  // popup.js não abre para quem tem esses cookies.
  function apagaTravas() {
    var partes = location.hostname.split('.');
    var dominios = [''];
    for (var i = 0; i < partes.length - 1; i++) {
      dominios.push('; domain=.' + partes.slice(i).join('.'));
    }
    ['mm_email', 'mm_phone', 'popup_closed'].forEach(function (c) {
      dominios.forEach(function (d) {
        document.cookie = c + '=; Max-Age=-1; path=/' + d;
      });
    });
  }

  function init(slug) {
    if (!slug || window.__mmPopupLoader) return;
    // o GTM de algumas lojas roda também dentro da sandbox do pixel do Shopify
    if (location.pathname.indexOf('/web-pixels') !== -1) return;
    window.__mmPopupLoader = true;

    var previa = null;
    try { previa = new URLSearchParams(location.search).get('mm_popup'); } catch (e) {}

    // Mesmas travas do popup.js, checadas antes de ir à rede: quem já se
    // cadastrou ou fechou não precisa nem baixar a configuração.
    if (!previa && (getCookie('mm_email') || getCookie('mm_phone') || getCookie('popup_closed'))) return;

    var url = API + encodeURIComponent(slug) + (previa ? '?previa=' + encodeURIComponent(previa) : '');
    fetch(url).then(function (r) { return r.json(); }).then(function (dados) {
      var lista = dados.popups || [];
      var escolhido = null;
      for (var i = 0; i < lista.length; i++) {
        if (previa ? lista[i].id === previa : serve(lista[i])) { escolhido = lista[i]; break; }
      }
      if (!escolhido) return;
      if (previa) apagaTravas();
      var abre = function () {
        setTimeout(function () { mostra(slug, escolhido, !!previa); },
                   previa ? 0 : (escolhido.atraso_segundos || 0) * 1000);
      };
      // a tag pode disparar no início do pageview, antes de existir o <body>
      if (document.body) abre();
      else document.addEventListener('DOMContentLoaded', abre);
    }).catch(function (e) { console.warn('[mm popup]', e); });
  }

  window.mmPopups = { init: init };

  var eu = document.currentScript;
  if (eu && eu.getAttribute('data-slug')) init(eu.getAttribute('data-slug'));
})();
