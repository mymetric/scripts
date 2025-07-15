function getCookie(name) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }
  
  function setCookie(name, value, days, domain) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    const cookieStr = `${name}=${value || ""}${expires}; domain=.${domain}; path=/`;
    document.cookie = cookieStr;
    console.log("[mm_tracker] Cookie set:", cookieStr);
  }
  
  function getUrlParameter(name) {
    return new URLSearchParams(window.location.search).get(name);
  }
  
  function extractClientIdFromGaCookie() {
    const ga = getCookie('_ga'); // ex: GA1.1.123456789.987654321
    if (!ga) return null;
    const parts = ga.split('.');
    if (parts.length === 4) {
      return `${parts[2]}.${parts[3]}`;
    }
    return null;
  }
  
  function extractSessionIdFromGaCookie() {
    const cookieEntry = Object.entries(document.cookie.split('; ').reduce((acc, c) => {
      const [k, v] = c.split('=');
      acc[k] = v;
      return acc;
    }, {})).find(([k]) => k.startsWith('_ga_') && k !== '_ga');
  
    if (!cookieEntry) return null;
  
    const cookieValue = decodeURIComponent(cookieEntry[1] || '');
  
    // Exemplo: GS2.1.s1751840343$o25$g1$t1751841408$j60$l0$h674897968
    const match = cookieValue.match(/\$t(\d{10})/);
    if (match && match[1]) {
      return match[1]; // session_id como timestamp UNIX
    }
  
    return null;
  }
  
  function mymetric_tracker(domain, measurementId) {
    console.log("[mm_tracker] Iniciando rastreamento");
  
    const trackedParams = ["ttclid", "msclkid"];
    trackedParams.forEach(param => {
      const value = getUrlParameter(param);
      if (value) {
        setCookie("_" + param, value, 365, domain);
      }
    });
  
    if (typeof window.gtag !== "function") {
      console.log("[mm_tracker] gtag ausente, carregando...");
  
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
  
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  
      script.onload = () => {
        console.log("[mm_tracker] gtag carregado");
        gtag("js", new Date());
        gtag("config", measurementId);
        continueTracking();
      };
  
      script.onerror = () => {
        console.warn("[mm_tracker] Falha ao carregar gtag.js");
        fallbackTracking(); // usa cookies mesmo assim
      };
  
      document.head.appendChild(script);
  
      setTimeout(() => {
        if (typeof gtag === "function") {
          console.log("[mm_tracker] gtag disponível após fallback, continuando");
          continueTracking();
        } else {
          console.warn("[mm_tracker] Timeout: gtag não disponível após 3s");
          fallbackTracking();
        }
      }, 3000);
    } else {
      console.log("[mm_tracker] gtag já presente, continuando...");
      continueTracking();
    }
  
    function continueTracking() {
      fetchGtagFields(measurementId).then(data => {
        if (!data?.client_id) {
          console.warn("[mm_tracker] gtag.get falhou, usando fallback via cookie _ga");
          return fallbackTracking();
        }
        buildAndStoreTracker(data.client_id, data.session_id);
      });
    }
  
    function fallbackTracking() {
      const clientId = extractClientIdFromGaCookie();
      const sessionId = extractSessionIdFromGaCookie();
      if (!clientId) {
        console.warn("[mm_tracker] client_id indisponível até via _ga");
        return;
      }
      buildAndStoreTracker(clientId, sessionId);
    }
  
    function buildAndStoreTracker(client_id, session_id) {
      const trackerPayload = {
        client_id,
        session_id,
        fbp: getCookie("_fbp"),
        fbc: getCookie("_fbc"),
        gclid: getCookie("_gcl_aw"),
        ttclid: getCookie("_ttclid"),
        ua: btoa(navigator.userAgent)
      };
  
      setCookie("mm_tracker", JSON.stringify(trackerPayload), 365, domain);
      console.log("[mm_tracker] Cookie 'mm_tracker_' gravado com:", trackerPayload);
    }
  
    function fetchGtagFields(measurementId) {
      return new Promise(resolve => {
        const fields = ["client_id", "session_id"];
        const result = {};
  
        function getNext() {
          const field = fields.shift();
          if (!field) return resolve(result);
  
          if (typeof gtag !== "function") {
            console.warn("[mm_tracker] gtag não disponível durante fetch");
            return resolve(null);
          }
  
          try {
            gtag("get", measurementId, field, val => {
              console.log(`[mm_tracker] ${field}:`, val);
              result[field] = val;
              getNext();
            });
          } catch (err) {
            console.error(`[mm_tracker] Erro ao obter ${field}:`, err);
            resolve(null);
          }
        }
  
        getNext();
      });
    }
  }

  function mymetric_tracker_checkout(slug, token) {

    const mm_tracker = getCookie("mm_tracker");
    
    const payload = {
      event_name: slug+"_shopify_checkout_started",
      cart_id: token,
      mm_tracker: mm_tracker ? JSON.parse(mm_tracker) : null
    };
  
    fetch("https://hkdk.events/kpprra7w39ztyk/?event_name="+slug+"_shopify_checkout_started", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
    .then(res => console.log("[mm_tracker] enviado com sucesso", res.status))
    .catch(err => console.error("[mm_tracker] erro ao enviar", err));
  }
  