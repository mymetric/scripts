function mymetric_tracker(domain, measurementId) {

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
                        gtagGet();  // Continua recursão
                    } else {
                        resolve(dataObj);  // Retorna o resultado final
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

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    // Chama a função assíncrona antes de usar os valores
    fetchGtagFields(measurementId).then(dataObj => {
        console.log('Dados obtidos:', dataObj);
        var client_id = dataObj.client_id;
        var session_id = dataObj.session_id;

        var cookies = {
            client_id: client_id,
            session_id: session_id,
            fbp: getCookie("_fbp"),
            fbc: getCookie("_fbc"),
            gclid: getCookie("_gcl_aw"),
            ua: btoa(navigator.userAgent) // Encode the user agent
        };

        var cookiesJson = JSON.stringify(cookies);

        // Define o cookie corretamente
        mm_tracker: domain.includes('orthocrin') ? getCookie("mm_tracker").replace(/:/g, ';') : getCookie("mm_tracker")

        // Atualiza o carrinho após garantir que os valores estão definidos
        updateCart();
    });

    function updateCart() {
    fetch('/cart.js')
        .then(response => response.json())
        .then(cart => {
            var existingAttributes = cart.attributes || {}; // Mantém atributos antigos

            var updatedAttributes = {
                ...existingAttributes, // Mantém os atributos atuais
                mm_tracker: getCookie("mm_tracker") // Adiciona/atualiza o novo
            };

            return fetch('/cart/update.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attributes: updatedAttributes })
            });
        })
        .then(response => response.json())
        .then(data => {
            console.log('Cart updated successfully:', data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    }

    console.log("====================");
}
