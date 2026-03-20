// Yampi Cart Tracker - MyMetric
// Envia yampi_cart_id para events.mymetric.app/posts
// Instalar no front da loja que usa Yampi checkout

(function () {
  var script = document.currentScript || document.querySelector('script[data-slug][src*="yampi-tracker"]');
  var SLUG = script && script.getAttribute("data-slug");
  if (!SLUG) {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].getAttribute("data-slug") && (scripts[i].src || "").indexOf("yampi") !== -1) {
        SLUG = scripts[i].getAttribute("data-slug");
        break;
      }
    }
  }
  if (!SLUG) return console.warn("[yampi-tracker] data-slug não informado");
  var ENDPOINT = "https://events.mymetric.app/posts";
  var POLL_INTERVAL = 500;
  var MAX_ATTEMPTS = 60; // 30s máximo

  function getMmTracker() {
    try {
      var cookies = document.cookie.split(";");
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.indexOf("mm_tracker=") === 0) {
          return decodeURIComponent(cookie.substring("mm_tracker=".length));
        }
      }
    } catch (e) {}
    return null;
  }

  function getYampiCartId() {
    try {
      if (window.checkout && window.checkout.cart && window.checkout.cart.token) {
        return window.checkout.cart.token;
      }
    } catch (e) {}
    return null;
  }

  function sendEvent(cartId, mmTracker) {
    var payload = {
      event_name: SLUG + "_yampi_cart_id",
      body: JSON.stringify({
        cart_id: cartId,
        mm_tracker: mmTracker,
      }),
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, JSON.stringify(payload));
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", ENDPOINT, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify(payload));
    }
  }

  function trySync() {
    var attempts = 0;

    var interval = setInterval(function () {
      attempts++;

      var cartId = getYampiCartId();
      var mmTracker = getMmTracker();

      if (cartId && mmTracker) {
        clearInterval(interval);

        // Evita envio duplicado na mesma sessão
        var sentKey = "mm_yampi_sent_" + cartId;
        if (sessionStorage.getItem(sentKey)) return;

        sendEvent(cartId, mmTracker);
        sessionStorage.setItem(sentKey, "1");
      }

      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(interval);
      }
    }, POLL_INTERVAL);
  }

  // Inicia quando o DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", trySync);
  } else {
    trySync();
  }
})();
