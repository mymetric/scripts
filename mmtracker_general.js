function mymetric_tracker(domain, measurementId, encoded = false) {
    function fetchGtagFields(measurementId) {
        function gtag(command, measurementId, field, callback) {
            if (typeof window.gtag === 'function') {
                window.gtag(command, measurementId, field, callback);
            } else {
                console.error('gtag não está definido');
                callback(null);
            }
        }

        let fields = ['client_id', 'session_id', 'gclid'];
        const dataObj = {};

        return new Promise((resolve) => {
            function gtagGet() {
                gtag('get', measurementId, fields[0], val => {
                    dataObj[fields[0]] = val;
                    fields.shift();
                    if (fields.length) {
                        gtagGet();
                    } else {
                        resolve(dataObj);
                    }
                });
            }

            if (fields.length) {
                gtagGet();
            } else {
                resolve(dataObj);
            }
        });
    }

    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length === 2) return parts.pop().split(";").shift();
    }

    function set_cookie(name, value, days, domain) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; domain=." + domain + "; path=/";
    }

    // Captura o click id da Awin (?awc=) da URL e persiste por 30 dias, a janela
    // padrao de cookie da Awin. Sem isto o awin_click_id abaixo so existia quando o
    // cliente tinha uma tag de GTM propria gravando o cookie `awc` (era o caso do
    // waz), e o S2S da Awin (parametro cks) fica sem referencia de clique.
    // Nao grava o AwinChannelCookie: quem decide o canal (aw/other/direct) e a
    // MasterTag da Awin, com as regras de dedup deles.
    function capture_awc(domain) {
        try {
            var m = window.location.search.match(/[?&]awc=([^&#]*)/);
            if (m && m[1]) {
                var awc = decodeURIComponent(m[1].replace(/\+/g, " "));
                if (awc) {
                    set_cookie("awc", awc, 30, domain);
                    return awc;
                }
            }
        } catch (e) {}
        return getCookie("awc");
    }

    // Antes do fetchGtagFields pra que o proprio pageview de entrada (o que traz
    // ?awc= na URL) ja escreva o click id dentro do mm_tracker.
    var awin_click_id = capture_awc(domain);

    fetchGtagFields(measurementId).then(dataObj => {
        console.log('Dados obtidos:', dataObj);
        var client_id = dataObj.client_id;
        var session_id = dataObj.session_id;

        // Check if client_id and session_id are not null before proceeding
        if (client_id !== null && session_id !== null) {
            var cookies = {
                client_id: client_id,
                session_id: session_id,
                fbp: getCookie("_fbp"),
                fbc: getCookie("_fbc"),
                gclid: getCookie("_gcl_aw"),
                awin_channel: getCookie("AwinChannelCookie"),
                awin_click_id: awin_click_id || getCookie("awc"),
                ua: btoa(navigator.userAgent)
            };

            var cookiesJson = JSON.stringify(cookies);
            
            if(encoded) {
                var cookiesJson = encodeURIComponent(cookiesJson);
            }
            
            set_cookie("mm_tracker", cookiesJson, 365, domain);
        } else {
            console.log('Skipping mm_tracker cookie creation: client_id or session_id is null');
        }
    });
}
