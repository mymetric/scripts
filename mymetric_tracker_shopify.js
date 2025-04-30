function mymetric_tracker(domain, measurementId, useJQuery = false) {
    // Stylized log function with purple theme
    function log(message, type = 'info', data = null) {
        const prefix = '[mymetric.hub]';
        const styles = {
            info: 'background: #6f42c1; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;',
            error: 'background: #4b0082; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;'
        };
        const style = styles[type] || styles.info;
        
        console.log(`%c${prefix} ${message}`, style);
        if (data !== null) {
            console.dir(data); // Use dir for better object inspection
        }
    }

    // Function to load gtag script dynamically
    function loadGtagScript(measurementId) {
        return new Promise((resolve, reject) => {
            // Check if gtag is already loaded
            if (typeof window.gtag === 'function') {
                resolve();
                return;
            }

            // Create script element
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
            
            // Handle script load
            script.onload = () => {
                // Initialize gtag
                window.dataLayer = window.dataLayer || [];
                window.gtag = function() { window.dataLayer.push(arguments); };
                window.gtag('js', new Date());
                // Configure gtag without pageview
                window.gtag('config', measurementId, { 'send_page_view': false });
                resolve();
            };
            
            // Handle script error
            script.onerror = () => {
                log('Failed to load gtag script', 'error');
                reject(new Error('Failed to load gtag script'));
            };

            // Append script to document
            document.head.appendChild(script);
        });
    }

    function fetchGtagFields(measurementId) {
        function gtag(command, measurementId, field, callback) {
            if (typeof window.gtag === 'function') {
                window.gtag(command, measurementId, field, callback);
            } else {
                log('gtag não está definido', 'error');
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

    // Load gtag script first, then proceed with fetching fields
    loadGtagScript(measurementId)
        .then(() => {
            fetchGtagFields(measurementId).then(dataObj => {
                log('Dados obtidos:', 'info', dataObj);
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
                        ua: btoa(navigator.userAgent)
                    };

                    var cookiesJson = JSON.stringify(cookies);
                    set_cookie("mm_tracker", cookiesJson, 365, domain);
                    updateCart(cookiesJson);
                } else {
                    log('Skipping mm_tracker cookie creation: client_id or session_id is null', 'info');
                    updateCart(null); // Still call updateCart but with null value
                }
            });
        })
        .catch(error => {
            log('Error loading gtag script:', 'error', error);
            // Optionally, still attempt to update cart with cookie data
            updateCart(getCookie("mm_tracker"));
        });

    function updateCart(cookiesJson) {
        // Use XMLHttpRequest to fetch cart
        const xhrGet = new XMLHttpRequest();
        xhrGet.open('GET', '/cart.js', true);
        xhrGet.setRequestHeader('Content-Type', 'application/json');
        xhrGet.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        xhrGet.onreadystatechange = function () {
            if (xhrGet.readyState === 4) {
                if (xhrGet.status === 200) {
                    try {
                        const cart = JSON.parse(xhrGet.responseText);
                        var existingAttributes = cart.attributes || {};
                        var mmData = cookiesJson || getCookie("mm_tracker");
                        if (domain.includes('orthocrin')) {
                            mmData = mmData.replace(/:/g, ';');
                        }

                        var updatedAttributes = {
                            ...existingAttributes,
                            mm_tracker: mmData
                        };

                        // Use XMLHttpRequest to update cart
                        const xhrUpdate = new XMLHttpRequest();
                        xhrUpdate.open('POST', '/cart/update.js', true);
                        xhrUpdate.setRequestHeader('Content-Type', 'application/json');
                        xhrUpdate.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

                        xhrUpdate.onreadystatechange = function () {
                            if (xhrUpdate.readyState === 4) {
                                if (xhrUpdate.status === 200) {
                                    try {
                                        const data = JSON.parse(xhrUpdate.responseText);
                                        log('Cart updated successfully (XMLHttpRequest):', 'info', data);
                                    } catch (e) {
                                        log('Error parsing update response:', 'error', e);
                                    }
                                } else {
                                    log(`Error updating cart (XMLHttpRequest): ${xhrUpdate.status}`, 'error', xhrUpdate.responseText);
                                }
                            }
                        };

                        xhrUpdate.send(JSON.stringify({ attributes: updatedAttributes }));
                    } catch (e) {
                        log('Error parsing cart response:', 'error', e);
                    }
                } else {
                    log(`Error fetching cart (XMLHttpRequest): ${xhrGet.status}`, 'error', xhrGet.responseText);
                }
            }
        };

        xhrGet.send();
        log("====================", 'info');
    }
}
