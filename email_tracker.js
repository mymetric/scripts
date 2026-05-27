function email_tracker(sourceParam, emailSelector, phoneSelector) {
  var postUrl = 'https://events.mymetric.app/posts?event_name=' + encodeURIComponent(sourceParam);

  // ─── Cookies ────────────────────────────────────────────────────────────────

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

  /**
   * Verifica se o evento de conversão (generate_lead / Lead) já foi disparado
   * nesta sessão. Usa cookie sem data de expiração (some ao fechar o browser).
   */
  function hasConversionFired() {
    return getCookie('mm_lead_fired') === '1';
  }

  function markConversionFired() {
    // Sem parâmetro `days` → cookie de sessão
    setCookie('mm_lead_fired', '1');
  }

  // ─── Hash ───────────────────────────────────────────────────────────────────

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

  // ─── Normalização ────────────────────────────────────────────────────────────

  /**
   * Normalização de e-mail (igual ao comportamento original).
   * Retorna { normalized, hashed }.
   */
  function normalizeAndHashEmail(raw) {
    var normalized = raw.trim().toLowerCase();
    return sha256hex(normalized).then(function (hashed) {
      return { normalized: normalized, hashed: hashed };
    });
  }

  /**
   * Normalização de telefone conforme especificação de cada endpoint:
   *
   *   MyMetric → E.164 simplificado: mantém "+" inicial + apenas dígitos
   *   GA4      → remove não-dígitos → adiciona prefixo "+" → SHA-256
   *   Meta     → remove não-dígitos → remove zeros à esquerda → SHA-256
   *
   * Retorna { forMyMetric, forGA4hash, forMetaHash }.
   */
  function normalizeAndHashPhone(raw) {
    // Remove espaços e pontuação, preserva "+" somente se for o primeiro caractere
    var stripped = raw.trim();

    var hasPlus = stripped.charAt(0) === '+';
    var digitsOnly = stripped.replace(/\D/g, '');

    // MyMetric: E.164 simplificado
    var forMyMetric = (hasPlus ? '+' : '') + digitsOnly;

    // GA4: remove não-dígitos e adiciona "+" como prefixo
    var forGA4 = '+' + digitsOnly;

    // Meta: apenas dígitos, sem zeros à esquerda (leading zeros)
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

  // ─── MyMetric ────────────────────────────────────────────────────────────────

  function sendToMyMetric(value) {
    var mmTracker = getCookie('mm_tracker');
    var formData = JSON.stringify({ email: value, mm_tracker: mmTracker });

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

  // ─── GA4 ─────────────────────────────────────────────────────────────────────

  /**
   * Envia user_data ao GA4 e dispara generate_lead apenas na primeira captura
   * da sessão (seja e-mail ou telefone).
   *
   * @param {Object} userData  Campos aceitos: email, sha256_email_address,
   *                           phone_number, sha256_phone_number
   */
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

  // ─── Meta Pixel ──────────────────────────────────────────────────────────────

  /**
   * Envia Advanced Matching ao Meta Pixel e dispara Lead apenas na primeira
   * captura da sessão (seja e-mail ou telefone).
   *
   * @param {Object} userData  Campos aceitos: em (hash e-mail), ph (hash tel)
   */
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
      // Enriquece sem disparar evento duplicado
      fbq('init', undefined, userData);
      console.log('[tracker] Meta Pixel — Advanced Matching atualizado (sem evento):', userData);
    }
  }

  // ─── Captura de E-mail ────────────────────────────────────────────────────────

  function logEmailOnChange(input) {
    if (input._emailListenerAttached) return;
    input._emailListenerAttached = true;

    input.addEventListener('change', function (e) {
      var rawEmail = e.target.value;
      console.log('[tracker] E-mail capturado:', rawEmail);

      setCookie('mm_email', btoa(rawEmail), 365);

      normalizeAndHashEmail(rawEmail).then(function (result) {
        // MyMetric recebe texto plano (comportamento original)
        sendToMyMetric(result.normalized);

        // GA4: prefere hash; fallback para texto plano se crypto.subtle indisponível
        var ga4UserData = result.hashed
          ? { sha256_email_address: result.hashed }
          : { email: result.normalized };
        sendToGA4(ga4UserData);

        // Meta: envia hash se disponível
        if (result.hashed) {
          sendToMetaPixel({ em: result.hashed });
        }

        markConversionFired();
      }).catch(function (err) {
        console.error('[tracker] Erro ao processar e-mail:', err);
        sendToMyMetric(rawEmail.trim().toLowerCase());
      });
    });
  }

  // ─── Captura de Telefone ──────────────────────────────────────────────────────

  function logPhoneOnChange(input) {
    if (input._phoneListenerAttached) return;
    input._phoneListenerAttached = true;

    input.addEventListener('change', function (e) {
      var rawPhone = e.target.value;
      console.log('[tracker] Telefone capturado:', rawPhone);

      setCookie('mm_phone', btoa(rawPhone), 365);

      normalizeAndHashPhone(rawPhone).then(function (result) {
        // MyMetric: E.164 simplificado, texto plano
        sendToMyMetric(result.forMyMetric);

        // GA4: sha256_phone_number (remove não-dígitos + prefixo "+", hasheado)
        var ga4UserData = result.forGA4hash
          ? { sha256_phone_number: result.forGA4hash }
          : { phone_number: '+' + rawPhone.replace(/\D/g, '') };
        sendToGA4(ga4UserData);

        // Meta: ph (dígitos sem zeros à esquerda, hasheado)
        if (result.forMetaHash) {
          sendToMetaPixel({ ph: result.forMetaHash });
        }

        markConversionFired();
      }).catch(function (err) {
        console.error('[tracker] Erro ao processar telefone:', err);
        sendToMyMetric(rawPhone.replace(/\D/g, ''));
      });
    });
  }

  // ─── Scan & Observer ─────────────────────────────────────────────────────────

  function deepScan(root) {
    if (!root) return;

    try {
      if (emailSelector) {
        var emailFields = root.querySelectorAll(emailSelector);
        for (var i = 0; i < emailFields.length; i++) {
          logEmailOnChange(emailFields[i]);
        }
      }

      if (phoneSelector) {
        var phoneFields = root.querySelectorAll(phoneSelector);
        for (var j = 0; j < phoneFields.length; j++) {
          logPhoneOnChange(phoneFields[j]);
        }
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
    if (emailSelector && node.matches(emailSelector)) return 'email';
    if (phoneSelector && node.matches(phoneSelector)) return 'phone';
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

// Iwannasleep: load AB tests unconditionally (bypass legacy callback gating).
// Hostname-gated so other clients are unaffected. Idempotent guard inside
// iws-ab-tests.js itself prevents duplicate runs if multiple injection paths
// fire. Duplicated also in experiment.js bottom — whichever loads first
// triggers the load.
(function () {
  if (typeof window === 'undefined' || !window.location) return;
  if (window.location.hostname.indexOf('iwannasleep') === -1) return;
  if (document.querySelector('script[src*="iws-ab-tests.js"]')) return;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/mymetric/iws@main/iws-ab-tests.js';
  s.async = true;
  (document.head || document.documentElement).appendChild(s);
})();
