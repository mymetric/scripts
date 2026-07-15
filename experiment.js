//helpers

function set_cookie(name, value, expirationDays) {
	const date = new Date();
	date.setTime(date.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
	const expires = "expires=" + date.toUTCString();
	document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }
  
  function get_cookie(name) {
	const cookies = document.cookie.split("; ");
	for (let i = 0; i < cookies.length; i++) {
	  const cookie = cookies[i].split("=");
	  if (cookie[0] === name) {
		return cookie[1];
	  }
	}
	return "";
  }
  
  function random_number() {
	  
	  var randomNumber = Math.random() * 10;
	  
	  return randomNumber;
  
  }
  
  // bucket
  
  function bucket_sort() {
  
	  var bucket = parseInt(get_cookie("mm_exp_bucket"));

	  if (isNaN(bucket)) {

		  bucket = Math.round(random_number());
		  set_cookie("mm_exp_bucket", bucket, 365);
  
	  }
  
	  return bucket;
  
  }
  
  
  // experiment
function new_experiment(id, name, experimentCallback) {
    if (name === undefined) name = null;

    var cookie_name = "mm_exp_id_" + id;
    var exp = get_cookie(cookie_name);
    var exp_id = '';
    var variant = '';

    if (exp) {
        exp_id = exp.split(".")[0];
        variant = exp.split(".")[1];
    }

    if (exp_id !== id) {
        if (random_number() <= 5) {
            variant = 0;
        } else {
            variant = 1;
        }
        set_cookie(cookie_name, id + "." + variant, 365);
    }

    // Função que executa a variante — só roda APÓS a impressão ser enviada.
    // Idempotente: roda uma única vez, seja pelo callback do GA/GTM ou pelo timeout de fallback.
    var _variantRan = false;
    function runVariant() {
        if (_variantRan) return;
        _variantRan = true;
        if (variant == '0') {
            if (typeof experiment_original !== 'undefined') {
                experiment_original();
            }
        }
        if (variant == '1') {
            experimentCallback(id);
        }
    }

    if (typeof gtag == 'function') {
        gtag("event", "experiment_impression", {
            experiment_id: id,
            experiment_variant: variant,
            experiment_name: name,
            event_callback: runVariant,          // GA chama após confirmar o envio da impressão
            event_timeout: 500                   // fallback do gtag: executa após 500ms
        });
        // Garantia extra: se o callback do gtag não vier, roda mesmo assim (idempotente).
        setTimeout(runVariant, 700);
    } else {
        dataLayer.push({
            event: "experiment_impression",
            experiment_id: id,
            experiment_variant: variant,
            experiment_name: name,
            eventCallback: runVariant,           // GTM chama após disparar as tags do push
            eventTimeout: 500
        });
        // FIX (split torto): NÃO rodar runVariant() síncrono aqui. Antes, o redirect/variante
        // rodava ANTES do GTM disparar a tag de experiment_impression, então a variante era
        // subcontada. Agora espera o GTM enviar a impressão; se o callback não vier, roda após
        // 700ms como fallback (idempotente garante execução única). Assim o evento dispara
        // sempre — nem que seja logo antes do redirect.
        setTimeout(runVariant, 700);
    }
}

// Iwannasleep: load AB tests unconditionally (bypass legacy callback gating).
// Hostname-gated so other clients are unaffected. Idempotent guard inside
// iws-ab-tests.js itself prevents duplicate impressions if multiple
// injection paths fire.
(function () {
  if (typeof window === 'undefined' || !window.location) return;
  if (window.location.hostname.indexOf('iwannasleep') === -1) return;
  if (document.querySelector('script[src*="iws-ab-tests.js"]')) return;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/mymetric/iws@main/iws-ab-tests.js';
  s.async = true;
  (document.head || document.documentElement).appendChild(s);
})();
