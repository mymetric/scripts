function mymetric_tracker(domain, measurementId, useJQuery = false) {
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

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

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
            ua: btoa(navigator.userAgent)
        };

        var cookiesJson = JSON.stringify(cookies);
        set_cookie("mm_tracker", cookiesJson, 365, domain);

        updateCart(cookiesJson);
    });

    function updateCart(cookiesJson) {
        if (useJQuery && typeof jQuery !== 'undefined') {
            // Modo jQuery
            $.getJSON('/cart.js')
                .done(function(cart) {
                    var existingAttributes = cart.attributes || {};
                    var mmData = cookiesJson || getCookie("mm_tracker");
                    if (domain.includes('orthocrin')) {
                        mmData = mmData.replace(/:/g, ';');
                    }

                    var updatedAttributes = {
                        ...existingAttributes,
                        mm_tracker: mmData
                    };

                    $.ajax({
                        url: '/cart/update.js',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({ attributes: updatedAttributes }),
                        success: function(data) {
                            console.log('Cart updated successfully (jQuery):', data);
                        },
                        error: function(xhr, status, error) {
                            console.error('Error updating cart (jQuery):', error);
                        }
                    });
                })
                .fail(function(error) {
                    console.error('Error fetching cart (jQuery):', error);
                });
        } else {
            // Modo Fetch nativo
            fetch('/cart.js')
                .then(response => response.json())
                .then(cart => {
                    var existingAttributes = cart.attributes || {};
                    var mmData = cookiesJson || getCookie("mm_tracker");
                    if (domain.includes('orthocrin')) {
                        mmData = mmData.replace(/:/g, ';');
                    }

                    var updatedAttributes = {
                        ...existingAttributes,
                        mm_tracker: mmData
                    };

                    return fetch('/cart/update.js', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ attributes: updatedAttributes })
                    });
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Cart updated successfully (fetch):', data);
                })
                .catch(error => {
                    console.error('Error updating cart (fetch):', error);
                });
        }
        console.log("====================");
    }
}
