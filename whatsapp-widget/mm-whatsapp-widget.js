/*!
 * MMWhatsAppWidget - Widget de pré-formulário de WhatsApp da MyMetric
 *
 * Script COMPARTILHADO entre clientes. Toda a lógica (form, máscaras,
 * validação, montagem da mensagem, envio do evento pro hub + dataLayer,
 * preventDefault, intercept de cliques em links de WhatsApp) vive aqui.
 *
 * Cada cliente carrega este script via jsDelivr e chama:
 *     MMWhatsAppWidget.init({ ...config única do cliente... });
 *
 * Hospedagem proposta: repo no GitHub servido por jsDelivr, ex.:
 *     https://cdn.jsdelivr.net/gh/<org>/<repo>@<tag>/mm-whatsapp-widget.js
 *
 * Compatível com GTM Custom HTML (ES5, sem dependências externas).
 */
(function (window, document) {
  'use strict';

  // ---------------------------------------------------------------------------
  // Helpers compartilhados
  // ---------------------------------------------------------------------------

  function onlyDigits(str) {
    return (str || '').replace(/\D/g, '');
  }

  function getCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Aplica máscara conforme o usuário digita (mesmo timeout do widget original).
  function applyMask(input, maskFn) {
    setTimeout(function () {
      var v = maskFn(input.value);
      if (v !== input.value) input.value = v;
    }, 1);
  }

  // ---- Máscaras --------------------------------------------------------------

  // Telefone BR: (XX) XXXXX-XXXX
  function maskPhone(v) {
    var r = onlyDigits(v).replace(/^0/, '');
    if (r.length > 10) {
      r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (r.length > 5) {
      r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (r.length > 2) {
      r = r.replace(/^(\d\d)(\d{0,5})/, '($1) $2');
    } else {
      r = r.replace(/^(\d*)/, '($1');
    }
    return r;
  }

  // Documento dinâmico: CPF (<=11 dígitos) XXX.XXX.XXX-XX ou CNPJ (12-14) XX.XXX.XXX/XXXX-XX
  function maskDoc(v) {
    var r = onlyDigits(v).slice(0, 14);
    if (r.length <= 11) {
      if (r.length > 9) {
        r = r.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, '$1.$2.$3-$4');
      } else if (r.length > 6) {
        r = r.replace(/^(\d{3})(\d{3})(\d{0,3}).*/, '$1.$2.$3');
      } else if (r.length > 3) {
        r = r.replace(/^(\d{3})(\d{0,3}).*/, '$1.$2');
      }
    } else {
      if (r.length > 12) {
        r = r.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*/, '$1.$2.$3/$4-$5');
      } else {
        r = r.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4}).*/, '$1.$2.$3/$4');
      }
    }
    return r;
  }

  var MASKS = { phone: maskPhone, doc: maskDoc };

  // ---------------------------------------------------------------------------
  // Configuração de campos
  //
  // Cada cliente declara em config.fields a lista de campos do formulário.
  // Campos suportados nativamente (key): "name", "email", "phone", "doc".
  // Cada campo: { key, label, placeholder, mask?, hint?, required?, validate? }
  //  - mask: 'phone' | 'doc' (opcional)
  //  - hint: HTML curto exibido abaixo do input (opcional)
  //  - validate(digitsOrValue) -> true/false (opcional; default: required não-vazio)
  // ---------------------------------------------------------------------------

  // Validações padrão reutilizáveis (recebem o VALOR cru do input).
  var VALIDATORS = {
    nonEmpty: function (val) { return !!(val && val.trim()); },
    email: function (val) { return !!(val && val.trim()); }, // input type=email já valida formato
    phoneBR: function (val) { return onlyDigits(val).length >= 11; },
    cpfOrCnpj: function (val) {
      var d = onlyDigits(val);
      return d.length === 11 || d.length === 14;
    }
  };

  // ---------------------------------------------------------------------------
  // Renderização do formulário
  // ---------------------------------------------------------------------------

  function buildInput(field, theme) {
    var input = document.createElement('input');
    input.setAttribute('type', field.inputType || 'text');
    input.setAttribute('class', 'mm-wpp-field mm-wpp-field-' + field.key);
    if (field.placeholder) input.setAttribute('placeholder', field.placeholder);
    input.style.display = 'flex';
    input.style.backgroundColor = theme.fieldBg;
    input.style.height = '40px';
    input.style.fontSize = '14px';
    input.style.marginBottom = '4px';
    input.style.width = '80%';
    input.style.border = 'unset';
    input.style.borderRadius = '5px';
    input.style.boxShadow = '0px 1px #b1b1b1';
    input.style.padding = '0.5rem 1rem';

    if (field.mask && MASKS[field.mask]) {
      input.setAttribute('data-mm-mask', field.mask);
      input.onkeypress = function () { applyMask(input, MASKS[field.mask]); };
      input.onkeyup = function () { applyMask(input, MASKS[field.mask]); };
    }
    return input;
  }

  function buildHint(html, theme) {
    var hint = document.createElement('div');
    hint.setAttribute('class', 'mm-wpp-hint');
    hint.innerHTML = html;
    hint.style.fontSize = '12px';
    hint.style.fontFamily = theme.fontFamily;
    hint.style.color = theme.hintColor;
    hint.style.width = '80%';
    hint.style.margin = '0px 0px 8px 0px';
    hint.style.lineHeight = '1.3';
    return hint;
  }

  function buildSubmit(label, theme) {
    var btn = document.createElement('input');
    btn.setAttribute('type', 'submit');
    btn.setAttribute('class', 'mm-wpp-submit');
    btn.setAttribute('value', label || 'Iniciar conversa');
    btn.style.height = '40px';
    btn.style.fontSize = '14px';
    btn.style.marginBottom = '4px';
    btn.style.border = 'unset';
    btn.style.borderRadius = '5px';
    btn.style.boxShadow = '0px 1px #b1b1b1';
    btn.style.padding = '0.5rem 1rem';
    btn.style.backgroundColor = theme.primary;
    btn.style.width = '40%';
    btn.style.justifyContent = 'center';
    btn.style.color = '#fff';
    btn.style.cursor = 'pointer';
    return btn;
  }

  function showForm(cfg, wppUrl) {
    var theme = cfg._theme;

    var box = document.createElement('div');
    box.setAttribute('id', 'mm-wpp-form');
    box.style.position = 'fixed';
    box.style.bottom = '15px';
    box.style.right = '15px';
    box.style.fontFamily = theme.fontFamily;
    box.style.width = '370px';
    box.style.backgroundColor = '#e3d9d9';
    box.style.zIndex = '99999';
    box.style.maxWidth = '95%';
    box.style.borderRadius = '20px';
    box.style.boxShadow = '8px 5px 15px -3px rgba(0,0,0,0.3)';

    var header = document.createElement('div');
    header.style.display = 'flex';
    header.style.backgroundColor = theme.primary;
    header.style.color = '#fff';
    header.style.padding = '20px';
    header.style.gap = '25px';
    header.style.borderRadius = '17px 17px 0px 0px';
    header.style.position = 'relative';
    header.style.alignItems = 'center';

    var close = document.createElement('div');
    close.innerHTML = '&#10006;';
    close.style.position = 'absolute';
    close.style.top = '7px';
    close.style.right = '15px';
    close.style.cursor = 'pointer';
    close.addEventListener('click', function () { box.remove(); });

    var avatar = document.createElement('div');
    avatar.style.display = 'flex';
    avatar.style.alignItems = 'center';
    avatar.style.justifyContent = 'center';
    avatar.style.width = '60px';
    avatar.style.height = '60px';
    avatar.style.minWidth = '60px';
    avatar.style.borderRadius = '50%';
    avatar.style.border = '3px solid ' + theme.accent;
    avatar.style.overflow = 'hidden';
    avatar.style.backgroundColor = '#fff';
    avatar.style.flexShrink = '0';
    if (cfg.logoUrl) {
      var logo = document.createElement('img');
      logo.setAttribute('src', cfg.logoUrl);
      logo.style.width = '100%';
      logo.style.height = '100%';
      logo.style.objectFit = 'contain';
      logo.style.display = 'block';
      avatar.appendChild(logo);
    }

    var titleBox = document.createElement('div');
    titleBox.style.display = 'flex';
    titleBox.style.flexDirection = 'column';
    titleBox.innerHTML = cfg.siteTitle +
      '<div style="display:flex;font-size:14px;font-weight:400;margin-top:-5px">🟢 online</div>';
    titleBox.style.fontSize = '18px';
    titleBox.style.fontWeight = 'bolder';
    titleBox.style.gap = '10px';

    var content = document.createElement('div');
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.maxWidth = '370px';
    content.style.padding = '0px 10px 6px 0px';

    var hello = document.createElement('div');
    hello.style.display = 'flex';
    hello.innerHTML = cfg.helloMessage;
    hello.style.fontSize = '14px';
    hello.style.fontFamily = theme.fontFamily;
    hello.style.color = 'rgb(74, 74, 74)';
    hello.style.backgroundColor = '#fff';
    hello.style.padding = '10px';
    hello.style.margin = '10px 0px 0px 10px';
    hello.style.maxWidth = '80%';
    hello.style.borderRadius = '5px';
    hello.style.boxShadow = '0px 1px #b1b1b1';

    var error = document.createElement('div');
    error.setAttribute('class', 'mm-wpp-error');
    error.innerHTML = cfg.errorMessage;
    error.style.fontSize = '14px';
    error.style.fontFamily = theme.fontFamily;
    error.style.color = 'rgb(74, 74, 74)';
    error.style.backgroundColor = '#fff';
    error.style.padding = '10px';
    error.style.margin = '10px 0px 0px 10px';
    error.style.maxWidth = '80%';
    error.style.borderRadius = '5px';
    error.style.boxShadow = '0px 1px #b1b1b1';
    error.style.display = 'none';

    var form = document.createElement('form');
    form.setAttribute('id', 'mm-wpp-form-el');
    form.style.display = 'flex';
    form.style.flexDirection = 'column';
    form.style.alignItems = 'flex-end';
    form.style.marginTop = '10px';

    // Inputs declarados pela config (na ordem dada).
    var inputsByKey = {};
    for (var i = 0; i < cfg.fields.length; i++) {
      var field = cfg.fields[i];
      var input = buildInput(field, theme);
      inputsByKey[field.key] = { field: field, el: input };
      form.appendChild(input);
      if (field.hint) form.appendChild(buildHint(field.hint, theme));
    }

    var submit = buildSubmit(cfg.submitLabel, theme);
    form.appendChild(submit);

    header.appendChild(avatar);
    header.appendChild(titleBox);
    header.appendChild(close);
    box.appendChild(header);
    box.appendChild(content);
    content.appendChild(hello);
    content.appendChild(error);
    content.appendChild(form);
    document.body.appendChild(box);

    box._mm = { inputsByKey: inputsByKey, error: error, submit: submit };
    bindSubmit(cfg, box, wppUrl);
  }

  function bindSubmit(cfg, box, wppUrl) {
    var ctx = box._mm;
    // Atualiza sempre o destino atual; só liga o listener uma vez (evita
    // submits duplicados quando o form é reaberto).
    ctx.wppUrl = wppUrl;
    if (ctx._submitBound) return;
    ctx._submitBound = true;
    ctx.submit.addEventListener('click', function (e) {
      e.preventDefault();
      var wppUrl = ctx.wppUrl;

      var values = {};   // key -> valor cru do input
      var ok = true;

      for (var key in ctx.inputsByKey) {
        if (!ctx.inputsByKey.hasOwnProperty(key)) continue;
        var item = ctx.inputsByKey[key];
        var raw = item.el.value;
        values[key] = (item.field.trim === false) ? raw : raw.trim();
        var validate = item.field.validate || VALIDATORS.nonEmpty;
        if (item.field.required !== false && !validate(values[key])) ok = false;
      }

      if (!ok) {
        ctx.error.style.display = 'block';
        return;
      }

      // Monta a mensagem (template do cliente com placeholders {key} ou {key:digits}).
      var message = renderMessage(cfg.messageTemplate, values);

      // Monta o payload de event_params a partir de config.payload (mapa).
      var eventParams = buildPayload(cfg.payload, values);
      eventParams.mm_tracker = getCookie('mm_tracker');

      var dataFormWpp = { event_name: cfg.eventName, event_params: eventParams };

      try {
        fetch(cfg.hubEndpoint + '?event_name=' + cfg.formSubmitEvent, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataFormWpp)
        }).then(function (r) {
          if (r.ok) return r.json();
          throw new Error('Failed to send data');
        }).then(function (d) { if (window.console) console.log(d); })
          .catch(function (err) { if (window.console) console.error('Error:', err); });
      } catch (err) { if (window.console) console.error('Error:', err); }

      var dlPush = { event: cfg.dataLayerEvent };
      for (var k in eventParams) {
        if (eventParams.hasOwnProperty(k) && k !== 'mm_tracker') dlPush[k] = eventParams[k];
      }
      (window.dataLayer = window.dataLayer || []).push(dlPush);

      var url = wppUrl.split('&')[0];
      url = url + '&text=' + encodeURIComponent(message);
      window.location.href = url;
      box.style.display = 'none';
    });
  }

  // Substitui {key} pelo valor cru e {key:digits} por só dígitos.
  function renderMessage(tpl, values) {
    return tpl.replace(/\{(\w+)(:digits)?\}/g, function (m, key, mode) {
      var v = values[key] != null ? values[key] : '';
      return mode ? onlyDigits(v) : v;
    });
  }

  // payload: { paramName: "key" | "key:digits" } -> { paramName: valor }
  function buildPayload(payloadMap, values) {
    var out = {};
    for (var param in payloadMap) {
      if (!payloadMap.hasOwnProperty(param)) continue;
      var spec = payloadMap[param];
      var key = spec, digits = false;
      var idx = spec.indexOf(':');
      if (idx !== -1) { key = spec.slice(0, idx); digits = spec.slice(idx + 1) === 'digits'; }
      var v = values[key] != null ? values[key] : '';
      out[param] = digits ? onlyDigits(v) : v;
    }
    return out;
  }

  // ---------------------------------------------------------------------------
  // Bootstrap: troca de links (opcional) + intercept de cliques
  // ---------------------------------------------------------------------------

  function replaceLinks(cfg, root) {
    if (!cfg.replaceLinks) return;
    for (var i = 0; i < cfg.replaceLinks.length; i++) {
      var rule = cfg.replaceLinks[i]; // { matchSelector, targetUrl }
      var anchors = (root || document).querySelectorAll(rule.matchSelector);
      for (var j = 0; j < anchors.length; j++) {
        anchors[j].setAttribute('href', rule.targetUrl);
      }
    }
  }

  function openForm(cfg, wppUrl) {
    var existing = document.getElementById('mm-wpp-form');
    if (!existing) {
      showForm(cfg, wppUrl);
    } else {
      existing.style.display = 'block';
      bindSubmit(cfg, existing, wppUrl);
    }
  }

  // Resolve o <a> mais próximo a partir do alvo do clique, mesmo quando o alvo
  // é um filho (svg, path, span, text node) que não tenha .closest().
  function findAnchor(target) {
    var node = target;
    while (node) {
      if (node.tagName && String(node.tagName).toLowerCase() === 'a') return node;
      if (node.closest) {
        var a = node.closest('a');
        if (a) return a;
      }
      node = node.parentNode || node.parentElement;
    }
    return null;
  }

  function resolveTheme(cfg) {
    var t = cfg.theme || {};
    return {
      primary: t.primary || '#0b6156',
      accent: t.accent || '#4eaf58',
      fieldBg: t.fieldBg || '#e7ffe7',
      hintColor: t.hintColor || 'rgb(110, 110, 110)',
      fontFamily: t.fontFamily || '"Montserrat", sans-serif'
    };
  }

  // ---------------------------------------------------------------------------
  // API pública
  // ---------------------------------------------------------------------------

  var MMWhatsAppWidget = {
    version: '1.0.1',
    init: function (config) {
      if (!config) return;

      // Guard de inicialização única: se a tag GTM disparar mais de uma vez
      // (SPA / múltiplos triggers), não duplica listeners de clique.
      if (window.__mmWppWidgetInitialized) return;
      window.__mmWppWidgetInitialized = true;

      // Defaults compartilhados.
      var cfg = config;
      cfg.hubEndpoint = cfg.hubEndpoint || 'https://mymetric-hub-shopify.ue.r.appspot.com/';
      cfg.formSubmitEvent = cfg.formSubmitEvent || (cfg.slug + '_whatsapp_form_submit');
      cfg.eventName = cfg.eventName || (cfg.slug + '_whatsapp_widget');
      cfg.dataLayerEvent = cfg.dataLayerEvent || (cfg.slug + '_whatsapp_widget_submit');
      cfg.submitLabel = cfg.submitLabel || 'Iniciar Conversa';
      cfg.linkMatcher = cfg.linkMatcher || /whatsapp|wa\.me/;
      cfg._theme = resolveTheme(cfg);

      // O listener de clique é registrado IMEDIATAMENTE (não depende de
      // DOMContentLoaded) para nunca perder o 1º clique. A captura (capture
      // phase) garante interceptar antes de qualquer handler do site, e o
      // preventDefault + stopPropagation impede a navegação nativa do <a>.
      function onClick(e) {
        var anchor = findAnchor(e.target);
        if (!anchor) return;
        var href = (anchor.getAttribute && anchor.getAttribute('href')) || '';
        if (!cfg.linkMatcher.test(href)) return;
        if (cfg.ignoreHref && href.indexOf(cfg.ignoreHref) !== -1) return;
        // Impede a navegação nativa e que outros handlers naveguem.
        e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        openForm(cfg, href);
      }
      // capture=true: intercepta antes de listeners de bubbling do site.
      document.addEventListener('click', onClick, true);

      function run() {
        replaceLinks(cfg);
        if (window.MutationObserver) {
          var observer = new MutationObserver(function () { replaceLinks(cfg); });
          observer.observe(document.documentElement, { childList: true, subtree: true });
        }
        // Abertura automática via ?wpp=true
        var params = new URLSearchParams(window.location.search);
        if (params.get('wpp') === 'true') {
          var btns = document.querySelectorAll('a[href*="whatsapp"], a[href*="wa.me"]');
          if (btns.length > 0) openForm(cfg, btns[0].getAttribute('href'));
        }
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
      } else {
        run();
      }
    },

    // Expostos para reuso/testes.
    _masks: MASKS,
    _validators: VALIDATORS
  };

  window.MMWhatsAppWidget = MMWhatsAppWidget;
})(window, document);
