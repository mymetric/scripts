function email_tracker(sourceParam, emailSelector) {
  var postUrl = 'https://events.mymetric.app/posts?event_name=' + encodeURIComponent(sourceParam);

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

  function hashEmail(raw) {
    var normalized = raw.trim().toLowerCase();

    // Contexto não-seguro (HTTP): crypto.subtle não existe
    if (!window.crypto || !window.crypto.subtle) {
      console.warn('[email_tracker] crypto.subtle indisponível — hash SHA-256 ignorado.');
      return Promise.resolve({ normalized: normalized, hashed: null });
    }

    var encoder = new TextEncoder();
    var data = encoder.encode(normalized);

    return window.crypto.subtle.digest('SHA-256', data).then(function (buffer) {
      var hexArray = Array.from(new Uint8Array(buffer));
      var hashed = hexArray.map(function (b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
      return { normalized: normalized, hashed: hashed };
    });
  }

  function sendToMyMetric(email) {
    var mmTracker = getCookie('mm_tracker');
    var formData = JSON.stringify({ email: email, mm_tracker: mmTracker });

    var xhr = new XMLHttpRequest();
    xhr.open('POST', postUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('[email_tracker] MyMetric — dados enviados:', xhr.responseText);
        } else {
          console.error('[email_tracker] MyMetric — erro ao enviar:', xhr.statusText);
        }
      }
    };
    xhr.send(formData);
  }

  function sendToGA4(normalized, hashed) {
    if (typeof gtag !== 'function') {
      console.warn('[email_tracker] GA4 — gtag não encontrado.');
      return;
    }

    // Envia o hash se disponível; caso contrário, envia texto plano como fallback.
    var emailValue = hashed || normalized;

    gtag('set', 'user_data', {
      email: emailValue
    });

    console.log('[email_tracker] GA4 — user_data definido:', emailValue);
  }

  function sendToMetaPixel(hashed) {
    if (typeof fbq !== 'function') {
      console.warn('[email_tracker] Meta Pixel — fbq não encontrado.');
      return;
    }

    if (!hashed) {
      console.warn('[email_tracker] Meta Pixel — hash indisponível, Advanced Matching ignorado.');
      return;
    }

    fbq('track', 'Lead', { em: hashed });

    console.log('[email_tracker] Meta Pixel — Advanced Matching enviado com em:', hashed);
  }

  function logEmailOnChange(input) {
    if (input._emailListenerAttached) return;
    input._emailListenerAttached = true;

    input.addEventListener('change', function (e) {
      var rawEmail = e.target.value;
      console.log('[email_tracker] E-mail capturado:', rawEmail);

      // Persiste e-mail (base64) no cookie para uso interno
      setCookie('mm_email', btoa(rawEmail), 365);

      // Gera hash e dispara as três integrações em paralelo
      hashEmail(rawEmail).then(function (result) {
        sendToMyMetric(result.normalized);  // MyMetric recebe texto plano (comportamento original)
        sendToGA4(result.normalized, result.hashed);
        sendToMetaPixel(result.hashed);
      }).catch(function (err) {
        console.error('[email_tracker] Erro ao gerar hash:', err);
        // Mesmo em caso de erro no hash, mantém o envio para o MyMetric
        sendToMyMetric(rawEmail.trim().toLowerCase());
      });
    });
  }

  function deepScanForEmailFields(root) {
    if (!root) return;
    try {
      var emailFields = root.querySelectorAll(emailSelector);
      for (var i = 0; i < emailFields.length; i++) {
        logEmailOnChange(emailFields[i]);
      }
    } catch (e) {
      // Alguns tipos de nó podem lançar exceção no querySelectorAll
    }

    var children = root.children || [];
    for (var j = 0; j < children.length; j++) {
      var child = children[j];
      if (child.shadowRoot) {
        deepScanForEmailFields(child.shadowRoot);
      }
      deepScanForEmailFields(child);
    }
  }

  function matchesEmailSelector(node) {
    return node.matches && node.matches(emailSelector);
  }

  deepScanForEmailFields(document);

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      for (var i = 0; i < mutation.addedNodes.length; i++) {
        var node = mutation.addedNodes[i];
        if (node.nodeType === 1) {
          if (matchesEmailSelector(node)) {
            logEmailOnChange(node);
          } else {
            deepScanForEmailFields(node);
            if (node.shadowRoot) {
              deepScanForEmailFields(node.shadowRoot);
            }
          }
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
