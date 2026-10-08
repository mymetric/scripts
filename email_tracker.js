// ─── Seletores globais padrão ────────────────────────────────────────────────

var DEFAULT_EMAIL_SELECTORS = [
  'input[type="email"]',
  '#input-email',
  'input[class*="mail"]',
  'input[id*="mail"]',
  'input[name*="mail"]',
  'input[placeholder*="mail"]',
  'input[placeholder*="Mail"]'
].join(', ');

var DEFAULT_PHONE_SELECTORS = [
  'input[type="tel"]',
  'input[class*="phone"]',
  'input[id*="phone"]',
  'input[class*="tel"]',
  'input[id*="tel"]',
  'input[class*="fone"]',
  'input[id*="fone"]',
  'input[class*="fone"]',
  'input[id*="fone"]',
  'input[name*="phone"]',
  'input[name*="tel"]',
  'input[name*="fone"]',
  'input[placeholder*="telefone"]',
  'input[placeholder*="Telefone"]',
  'input[placeholder*="celular"]',
  'input[placeholder*="Celular"]',
  'input[class*="whatsapp"]',
  'input[class*="whats"]',
  'input[id*="whatsapp"]',
  'input[id*="whats"]',
  'input[name*="whatsapp"]',
  'input[name*="whats"]',
  'input[placeholder*="whatsapp"]',
  'input[placeholder*="WhatsApp"]',
  'input[placeholder*="Whatsapp"]',
  'input[placeholder*="whats"]',
  'input[placeholder*="Whats"]'
].join(', ');

// ─── Sufixo fixo do evento ───────────────────────────────────────────────────

var EVENT_SUFFIX = '_popup_subscribe';

// ─── Função principal ────────────────────────────────────────────────────────

/**
 * @param {string} clientName      Nome do cliente (ex: "nike", "pepsi"). O event_name
 *                                 enviado será "{clientName}_popup_subscribe".
 * @param {string} [extraEmail]    Seletores CSS adicionais para campos de e-mail
 *                                 (opcional — serão somados aos padrões).
 * @param {string} [extraPhone]    Seletores CSS adicionais para campos de telefone
 *                                 (opcional — serão somados aos padrões).
 *
 * Exemplos de uso:
 *
 *   // Apenas com o nome do cliente (usa seletores padrão):
 *   email_tracker('nike');
 *
 *   // Com seletores extras de e-mail:
 *   email_tracker('nike', '#meu-campo-email');
 *
 *   // Com seletores extras de e-mail e telefone:
 *   email_tracker('nike', '#meu-campo-email', '#meu-campo-tel');
 */
function email_tracker(clientName, extraEmail, extraPhone) {
  var eventName = clientName.slice(-EVENT_SUFFIX.length) === EVENT_SUFFIX
    ? clientName
    : clientName + EVENT_SUFFIX;
  var postUrl = 'https://events.mymetric.app/posts?event_name=' + encodeURIComponent(eventName);

  // Combina seletores padrão com os extras informados (se houver)
  var emailSelector = extraEmail
    ? DEFAULT_EMAIL_SELECTORS + ', ' + extraEmail
    : DEFAULT_EMAIL_SELECTORS;

  var phoneSelector = extraPhone
    ? DEFAULT_PHONE_SELECTORS + ', ' + extraPhone
    : DEFAULT_PHONE_SELECTORS;

  // ─── Cookies ───────────────────────────────────────────────────────────────

  function setCookie(name, value, days) {
    var expires = '';
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
  }

  function hasConversionFired() {
    return getCookie('mm_lead_fired') === '1';
  }

  function markConversionFired() {
    setCookie('mm_lead_fired', '1');
  }

  // ─── Hash ──────────────────────────────────────────────────────────────────

  function sha256hex(str) {
    if (!window.crypto || !window.crypto.subtle) {
      console.warn('[tracker] crypto.subtle indisponível — hash SHA-256 ignorado.');
      return Promise.resolve(null);
    }
    var encoder = new TextEncoder();
    return window.crypto.subtle.digest('SHA-256', encoder.encode(str)).then(function (buffer) {
      return Array.from(new Uint8Array(buffer))
        .map(function (b) { return b.toString(16).padStart(2, '0'); })
        .join('');
    });
  }

  // ─── Normalização ──────────────────────────────────────────────────────────

  function normalizeAndHashEmail(raw) {
    var normalized = raw.trim().toLowerCase();
    return sha256hex(normalized).then(function (hashed) {
      return { normalized: normalized, hashed: hashed };
    });
  }

  function normalizeAndHashPhone(raw) {
    var stripped = raw.trim();
    var hasPlus = stripped.charAt(0) === '+';
    var digitsOnly = stripped.replace(/\D/g, '');

    var forMyMetric = (hasPlus ? '+' : '') + digitsOnly;
    var forGA4 = '+' + digitsOnly;
    var forMeta = digitsOnly.replace(/^0+/, '');

    return Promise.all([
      sha256hex(forGA4),
      sha256hex(forMeta)
    ]).then(function (hashes) {
      return {
        forMyMetric: forMyMetric,
        forGA4hash: hashes[0],
        forMetaHash: hashes[1]
      };
    });
  }

  // ─── Identificador do form/input ───────────────────────────────────────────

  function getFieldIdentifier(input) {
    var form = input.closest ? input.closest('form') : null;
    if (form && form.id) return form.id;
    if (input.id) return input.id;
    if (input.name) return input.name;
    return null;
  }

  // ─── URL da página onde o lead foi capturado ───────────────────────────────

  function getPageUrl() {
    try {
      return window.location.href;
    } catch (e) {
      return null;
    }
  }

  // ─── MyMetric ──────────────────────────────────────────────────────────────

function sendToMyMetric(field, value, identifier) {
  if (!field || typeof field !== 'string') {
    console.warn('[tracker] Campo inválido para MyMetric.');
    return;
  }

  var mmTracker = getCookie('mm_tracker');

  var payload = {
    mm_tracker: mmTracker
  };

  if (field !== 'mm_tracker') {
    payload[field] = value;
  }

  if (identifier) {
    payload.identifier = identifier;
  }

  var pageUrl = getPageUrl();
  if (pageUrl) {
    payload.url = pageUrl;
  }

  var formData = JSON.stringify(payload);

  var xhr = new XMLHttpRequest();
  xhr.open('POST', postUrl, true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log('[tracker] MyMetric — dados enviados:', xhr.responseText);
      } else {
        console.error('[tracker] MyMetric — erro ao enviar:', xhr.statusText);
      }
    }
  };

  xhr.send(formData);
}

  // ─── GA4 ───────────────────────────────────────────────────────────────────

  function sendToGA4(userData) {
    if (typeof gtag !== 'function') {
      console.warn('[tracker] GA4 — gtag não encontrado.');
      return;
    }

    gtag('set', 'user_data', userData);
    console.log('[tracker] GA4 — user_data definido:', userData);

    if (!hasConversionFired()) {
      gtag('event', 'generate_lead');
      console.log('[tracker] GA4 — generate_lead disparado.');
    }
  }

  // ─── Meta Pixel ────────────────────────────────────────────────────────────

  function sendToMetaPixel(userData) {
    if (typeof fbq !== 'function') {
      console.warn('[tracker] Meta Pixel — fbq não encontrado.');
      return;
    }

    if (Object.keys(userData).length === 0) {
      console.warn('[tracker] Meta Pixel — nenhum hash disponível, Advanced Matching ignorado.');
      return;
    }

    if (!hasConversionFired()) {
      fbq('track', 'Lead', {}, { user_data: userData });
      console.log('[tracker] Meta Pixel — Lead disparado com user_data:', userData);
    } else {
      fbq('init', undefined, userData);
      console.log('[tracker] Meta Pixel — Advanced Matching atualizado (sem evento):', userData);
    }
  }

  // ─── Captura de E-mail ─────────────────────────────────────────────────────

  function logEmailOnChange(input) {
    if (input._emailListenerAttached) return;
    input._emailListenerAttached = true;

    input.addEventListener('change', function (e) {
      var rawEmail = e.target.value;

      // Rejeita se o valor não contiver '@' — não é um e-mail válido
      if (rawEmail.indexOf('@') === -1) {
        console.warn('[tracker] E-mail ignorado — valor não parece ser um e-mail:', rawEmail);
        return;
      }

      console.log('[tracker] E-mail capturado:', rawEmail);

      setCookie('mm_email', btoa(rawEmail), 365);

      var identifier = getFieldIdentifier(e.target);

      normalizeAndHashEmail(rawEmail).then(function (result) {
        sendToMyMetric('email', result.normalized, identifier);

        var ga4UserData = result.hashed
          ? { sha256_email_address: result.hashed }
          : { email: result.normalized };
        sendToGA4(ga4UserData);

        if (result.hashed) {
          sendToMetaPixel({ em: result.hashed });
        }

        markConversionFired();
      }).catch(function (err) {
        console.error('[tracker] Erro ao processar e-mail:', err);
        sendToMyMetric('email', rawEmail.trim().toLowerCase(), identifier);
      });
    });
  }

  // ─── Captura de Telefone ───────────────────────────────────────────────────

  // Campo de cartão usa input[type="tel"] para abrir o teclado numérico, e o
  // seletor padrão de telefone pega esse tipo — de ago a out/2026 o número do
  // cartão subiu cru como "phone" em ~10 lojas. Por isso o telefone passa por
  // duas barreiras: o campo não pode se descrever como pagamento/documento, e
  // o valor tem que ter formato de telefone (nunca 14+ dígitos).
  var RE_CAMPO_PROIBIDO = /(card|cart[aã]o|\bcc\b|cc[-_]|cvv|cvc|credit|cr[eé]dito|d[eé]bito|payment|pagamento|pagbank|pagar|mercadopago|\bmp\b|validade|expir|cpf|cnpj|documento|\brg\b|senha|password|cupom|voucher)/i;

  function descreveCampo(input) {
    var form = input.closest ? input.closest('form') : null;
    var partes = [input.name, input.id, typeof input.className === 'string' ? input.className : '',
      input.placeholder, input.getAttribute('autocomplete'), input.getAttribute('aria-label'),
      input.getAttribute('data-testid')];
    if (form) {
      partes.push(form.id, form.getAttribute('name'), form.getAttribute('action'),
        typeof form.className === 'string' ? form.className : '');
    }
    return partes.join(' ');
  }

  function campoProibido(input) {
    var ac = input.getAttribute('autocomplete') || '';
    if (/^cc-|\scc-/.test(ac)) return true;
    return RE_CAMPO_PROIBIDO.test(descreveCampo(input));
  }

  function passaLuhn(digits) {
    var soma = 0;
    for (var i = 0; i < digits.length; i++) {
      var d = +digits.charAt(digits.length - 1 - i);
      if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
      soma += d;
    }
    return soma % 10 === 0;
  }

  // Brasil: 10 dígitos fixo (3º dígito 2-5) ou 11 celular (3º dígito 9),
  // com ou sem o 55 na frente. Fora do Brasil só com '+' explícito.
  function pareceTelefone(raw) {
    var s = String(raw || '').trim();
    var d = s.replace(/\D/g, '');
    if (d.length >= 13 && d.length <= 19 && passaLuhn(d) && d.indexOf('55') !== 0) return false;
    if (s.charAt(0) === '+' && d.indexOf('55') !== 0) return d.length >= 8 && d.length <= 13;
    if ((d.length === 12 || d.length === 13) && d.indexOf('55') === 0) d = d.slice(2);
    if (d.length === 11) return d.charAt(2) === '9';
    if (d.length === 10) return /[2-5]/.test(d.charAt(2));
    return false;
  }

  // Limpa o mm_phone gravado por versões anteriores quando não é telefone
  // (cartão de crédito ficou nesse cookie por até 365 dias).
  (function limpaCookieTelefone() {
    var atual = getCookie('mm_phone');
    if (!atual) return;
    var valor = '';
    try { valor = atob(decodeURIComponent(atual)); } catch (err) { valor = ''; }
    if (!pareceTelefone(valor)) {
      document.cookie = 'mm_phone=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    }
  })();

  function logPhoneOnChange(input) {
    if (input._phoneListenerAttached) return;
    input._phoneListenerAttached = true;
    if (campoProibido(input)) return;

    input.addEventListener('change', function (e) {
      var rawPhone = e.target.value;

      // Nunca logar o valor rejeitado: pode ser número de cartão.
      if (campoProibido(e.target) || !pareceTelefone(rawPhone)) {
        return;
      }

      console.log('[tracker] Telefone capturado:', rawPhone);

      setCookie('mm_phone', btoa(rawPhone), 365);

      var identifier = getFieldIdentifier(e.target);

      normalizeAndHashPhone(rawPhone).then(function (result) {
        sendToMyMetric('phone', result.forMyMetric, identifier);

        var ga4UserData = result.forGA4hash
          ? { sha256_phone_number: result.forGA4hash }
          : { phone_number: '+' + rawPhone.replace(/\D/g, '') };
        sendToGA4(ga4UserData);

        if (result.forMetaHash) {
          sendToMetaPixel({ ph: result.forMetaHash });
        }

        markConversionFired();
      }).catch(function (err) {
        console.error('[tracker] Erro ao processar telefone:', err);
        sendToMyMetric('phone', rawPhone.replace(/\D/g, ''), identifier);
      });
    });
  }

  // ─── Scan & Observer ───────────────────────────────────────────────────────

  function deepScan(root) {
    if (!root) return;

    try {
      var emailFields = root.querySelectorAll(emailSelector);
      for (var i = 0; i < emailFields.length; i++) {
        logEmailOnChange(emailFields[i]);
      }

      var phoneFields = root.querySelectorAll(phoneSelector);
      for (var j = 0; j < phoneFields.length; j++) {
        logPhoneOnChange(phoneFields[j]);
      }
    } catch (e) {
      // Alguns tipos de nó podem lançar exceção no querySelectorAll
    }

    var children = root.children || [];
    for (var k = 0; k < children.length; k++) {
      var child = children[k];
      if (child.shadowRoot) deepScan(child.shadowRoot);
      deepScan(child);
    }
  }

  function matchesAnySelector(node) {
    if (!node.matches) return false;
    if (node.matches(emailSelector)) return 'email';
    if (node.matches(phoneSelector)) return 'phone';
    return false;
  }

  deepScan(document);

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      for (var i = 0; i < mutation.addedNodes.length; i++) {
        var node = mutation.addedNodes[i];
        if (node.nodeType !== 1) continue;

        var match = matchesAnySelector(node);
        if (match === 'email') {
          logEmailOnChange(node);
        } else if (match === 'phone') {
          logPhoneOnChange(node);
        } else {
          deepScan(node);
          if (node.shadowRoot) deepScan(node.shadowRoot);
        }
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// ─── IWannaSleep AB Tests ──────────────────────────────────────────────────────

(function () {
  if (typeof window === 'undefined' || !window.location) return;
  if (window.location.hostname.indexOf('iwannasleep') === -1) return;
  if (document.querySelector('script[src*="iws-ab-tests.js"]')) return;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/mymetric/iws@main/iws-ab-tests.js';
  s.async = true;
  (document.head || document.documentElement).appendChild(s);
})();
