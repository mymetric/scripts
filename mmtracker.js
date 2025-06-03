function mymetric_tracker(domain, measurementId, useJQuery = false) {
    function injectGtagIfMissing(measurementId, callback) {
        if (typeof window.gtag === 'function') {
            return callback();
        }

        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { dataLayer.push(arguments); };

        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
        script.onload = function () {
            gtag('js', new Date());
            gtag('config', measurementId);
            callback();
        };
        document.head.appendChild(script);
    }

    function fetchGtagFields(measurementId) {
        function gtagGetField(field) {
            return new Promise(resolve => {
                if (typeof window.gtag === 'function') {
                    window.gtag('get', measurementId, field, val => resolve({ field, val }));
                } else {
                    console.error('gtag não está definido');
                    resolve({ field, val: null });
                }
            });
        }

        let fields = ['client_id', 'session_id', 'gclid'];

        return Promise.all(fields.map(gtagGetField)).then(results => {
            return results.reduce((acc, { field, val }) => {
                acc[field] = val;
                return acc;
            }, {});
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

    injectGtagIfMissing(measurementId, function () {
        fetchGtagFields(measurementId).then(dataObj => {
            console.log('Dados obtidos:', dataObj);
            var client_id = dataObj.client_id;
            var session_id = dataObj.session_id;

            if (client_id !== null && session_id !== null) {
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
            } else {
                console.log('Skipping mm_tracker cookie creation: client_id or session_id is null');
                updateCart(null);
            }
        });
    });

    function updateCart(cookiesJson) {
        if (useJQuery && typeof jQuery !== 'undefined') {
            $.getJSON('/cart.js')
                .done(function (cart) {
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
                        success: function (data) {
                            console.log('Cart updated successfully (jQuery):', data);
                        },
                        error: function (xhr, status, error) {
                            console.error('Error updating cart (jQuery):', error);
                        }
                    });
                })
                .fail(function (error) {
                    console.error('Error fetching cart (jQuery):', error);
                });
        } else {
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
