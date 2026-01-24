/**
 * MyMetric Tracker Library
 * Biblioteca para tracking de cookies GA4 e integração com VTEX
 */

(function(window) {
    'use strict';

    // ========================================
    // UTILIDADES
    // ========================================
    
    function getCookie(name) {
        var value = '; ' + document.cookie;
        var parts = value.split('; ' + name + '=');
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    function setCookie(name, value, days, domain) {
        var expires = '';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + (value || '') + expires + '; domain=.' + domain + '; path=/';
    }

    function isCheckoutPage() {
        return window.location.href.toLowerCase().indexOf('checkout') > -1;
    }

    // ========================================
    // MÓDULO GA4 TRACKER
    // ========================================

    function waitForGtag(maxWait, callback) {
        maxWait = maxWait || 5000;
        var startTime = Date.now();

        function check() {
            if (typeof window.gtag === 'function') {
                callback(true);
                return;
            }

            if (window.dataLayer && !window.gtag) {
                window.gtag = function() {
                    window.dataLayer.push(arguments);
                };
                callback(true);
                return;
            }

            if (Date.now() - startTime < maxWait) {
                setTimeout(check, 100);
            } else {
                console.warn('MyMetric: gtag não encontrado após timeout');
                callback(false);
            }
        }

        check();
    }

    function fetchGtagFields(measurementId, callback) {
        var fields = ['client_id', 'session_id', 'gclid'];
        var dataObj = {};
        var index = 0;

        function gtagGet() {
            var field = fields[index];
            var responded = false;

            var fieldTimeout = setTimeout(function() {
                if (!responded) {
                    responded = true;
                    console.warn('MyMetric: Timeout ao obter ' + field);
                    dataObj[field] = null;
                    index++;
                    if (index < fields.length) {
                        gtagGet();
                    } else {
                        callback(dataObj);
                    }
                }
            }, 2000);

            try {
                window.gtag('get', measurementId, field, function(val) {
                    if (!responded) {
                        responded = true;
                        clearTimeout(fieldTimeout);
                        dataObj[field] = val || null;
                        index++;
                        if (index < fields.length) {
                            gtagGet();
                        } else {
                            callback(dataObj);
                        }
                    }
                });
            } catch (e) {
                if (!responded) {
                    responded = true;
                    clearTimeout(fieldTimeout);
                    console.error('MyMetric: Erro ao obter ' + field + ':', e);
                    dataObj[field] = null;
                    index++;
                    if (index < fields.length) {
                        gtagGet();
                    } else {
                        callback(dataObj);
                    }
                }
            }
        }

        gtagGet();
    }

    function getClientIdFromCookie() {
        var gaCookie = getCookie('_ga');
        if (gaCookie) {
            var parts = gaCookie.split('.');
            if (parts.length >= 4) {
                return parts.slice(2).join('.');
            }
        }
        return null;
    }

    function getSessionIdFromCookie(measurementId) {
        var cookieName = '_ga_' + measurementId.replace('G-', '');
        var sessionCookie = getCookie(cookieName);
        if (sessionCookie) {
            var parts = sessionCookie.split('.');
            if (parts.length >= 3) {
                return parts[2];
            }
        }
        return null;
    }

    // ========================================
    // FUNÇÃO PRINCIPAL DO TRACKER
    // ========================================

    function initTracker(config) {
        var domain = config.domain;
        var measurementId = config.measurementId;
        var encoded = config.encoded !== undefined ? config.encoded : false;

        function createCookie(dataObj) {
            if (dataObj.client_id && dataObj.session_id) {
                var cookies = {
                    client_id: dataObj.client_id,
                    session_id: dataObj.session_id,
                    fbp: getCookie('_fbp'),
                    fbc: getCookie('_fbc'),
                    gclid: dataObj.gclid || getCookie('_gcl_aw'),
                    awin_channel: getCookie('AwinChannelCookie'),
                    awin_click_id: getCookie('awc'),
                    ua: btoa(navigator.userAgent)
                };

                var cookiesJson = JSON.stringify(cookies);

                if (encoded) {
                    cookiesJson = encodeURIComponent(cookiesJson);
                }

                setCookie('mm_tracker', cookiesJson, 365, domain);
                console.log('MyMetric: Cookie mm_tracker criado com sucesso');
                return true;
            } else {
                console.warn('MyMetric: Não foi possível obter client_id ou session_id', dataObj);
                return false;
            }
        }

        function run() {
            waitForGtag(5000, function(gtagReady) {
                var dataObj = {
                    client_id: null,
                    session_id: null,
                    gclid: null
                };

                if (gtagReady) {
                    fetchGtagFields(measurementId, function(result) {
                        console.log('MyMetric: Dados obtidos via gtag:', result);

                        if (!result.client_id) {
                            result.client_id = getClientIdFromCookie();
                            if (result.client_id) {
                                console.log('MyMetric: client_id obtido via cookie _ga');
                            }
                        }

                        if (!result.session_id) {
                            result.session_id = getSessionIdFromCookie(measurementId);
                            if (result.session_id) {
                                console.log('MyMetric: session_id obtido via cookie _ga_*');
                            }
                        }

                        createCookie(result);
                    });
                } else {
                    dataObj.client_id = getClientIdFromCookie();
                    dataObj.session_id = getSessionIdFromCookie(measurementId);

                    if (dataObj.client_id) {
                        console.log('MyMetric: client_id obtido via cookie _ga (fallback)');
                    }
                    if (dataObj.session_id) {
                        console.log('MyMetric: session_id obtido via cookie _ga_* (fallback)');
                    }

                    createCookie(dataObj);
                }
            });
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', run);
        } else {
            run();
        }
    }

    // ========================================
    // MÓDULO VTEX CART
    // ========================================

    function initVtexCart(config) {
        // Só executa em páginas de checkout
        if (!isCheckoutPage()) {
            console.log('MyMetric: Não é página de checkout, VTEX cart não iniciado');
            return;
        }

        console.log('MyMetric: Página de checkout detectada, iniciando VTEX cart');

        var endpoint = config.endpoint;
        var slug = config.slug;
        var eventName = slug + '_vtex_cart';
        var maxRetries = config.maxRetries || 10;
        var retryCount = 0;

        function getOrderFormId(callback, errorCallback) {
            if (typeof vtexjs === 'undefined' || !vtexjs.checkout) {
                errorCallback(new Error('vtexjs.checkout não disponível'));
                return;
            }
            
            vtexjs.checkout.getOrderForm()
                .done(function(orderForm) {
                    callback(orderForm.orderFormId);
                })
                .fail(function(err) {
                    errorCallback(err);
                });
        }

        function sendData(orderFormId, mmTrackerCookie) {
            var data = JSON.stringify({
                event_name: eventName,
                event_params: {
                    order_form_id: orderFormId,
                    mm_tracker: mmTrackerCookie
                }
            });

            fetch(endpoint + '?event_name=' + eventName, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: data
            })
            .then(function(response) {
                if (response.ok) {
                    console.log('MyMetric: VTEX cart data sent successfully (' + eventName + ')');
                } else {
                    console.error('MyMetric: Failed to send VTEX cart data');
                    retry();
                }
            })
            .catch(function(error) {
                console.error('MyMetric: Error sending VTEX cart data:', error);
                retry();
            });
        }

        function retry() {
            if (retryCount < maxRetries) {
                retryCount++;
                console.log('MyMetric: Retrying VTEX cart... attempt ' + retryCount);
                setTimeout(run, 1000);
            } else {
                console.error('MyMetric: Max retries reached for VTEX cart');
            }
        }

        function run() {
            var mmTrackerCookie = getCookie('mm_tracker');
            if (!mmTrackerCookie) {
                console.error('MyMetric: mm_tracker cookie not found');
                retry();
                return;
            }

            getOrderFormId(function(orderFormId) {
                sendData(orderFormId, mmTrackerCookie);
            }, function(err) {
                console.error('MyMetric: Error getting orderFormId:', err);
                retry();
            });
        }

        // Aguarda window load para garantir que vtexjs está disponível
        if (document.readyState === 'complete') {
            run();
        } else {
            window.addEventListener('load', run);
        }
    }

    // ========================================
    // FUNÇÃO INIT UNIFICADA
    // ========================================

    function init(config) {
        // Inicializa tracker GA4
        initTracker({
            domain: config.domain,
            measurementId: config.measurementId,
            encoded: config.encoded !== undefined ? config.encoded : true
        });

        // Inicializa VTEX Cart se configurado
        if (config.vtexEndpoint && config.slug) {
            initVtexCart({
                endpoint: config.vtexEndpoint,
                slug: config.slug,
                maxRetries: config.maxRetries || 10
            });
        }
    }

    // ========================================
    // EXPORTAR API PÚBLICA
    // ========================================

    window.MyMetric = {
        init: init,
        initTracker: initTracker,
        initVtexCart: initVtexCart,
        getCookie: getCookie,
        isCheckoutPage: isCheckoutPage
    };

})(window);
