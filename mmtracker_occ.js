/**
 * MyMetric Tracker — Oracle Commerce Cloud (OCC)
 *
 * Gera o cookie mm_tracker (GA4, Meta, Google Ads, TikTok, Awin, UTMs)
 * e captura o cart_id do OCC em /cart, /checkout e /confirmation,
 * enviando ao coletor do Heimdall.
 *
 * Serve via jsDelivr:
 *   <script src="https://cdn.jsdelivr.net/gh/mymetric/scripts@main/mmtracker_occ.js"></script>
 *   <script>
 *     MyMetricOcc.init({
 *       domain: 'lojaconfianca.com.br',
 *       measurementId: 'G-XXXXXXXXXX',
 *       slug: 'confianca'
 *     });
 *   </script>
 */
(function (window) {
    'use strict';

    var ENDPOINT = 'https://events.mymetric.app/posts';

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

    function getUrlParam(name) {
        try {
            var url = new URL(window.location.href);
            return url.searchParams.get(name);
        } catch (e) {
            return null;
        }
    }

    function isCartOrCheckoutPage() {
        var url = window.location.href.toLowerCase();
        return url.indexOf('/cart') > -1
            || url.indexOf('/checkout') > -1
            || url.indexOf('/confirmation') > -1;
    }

    // ========================================
    // EXTRAÇÃO DE CLICK IDS DA URL
    // ========================================

    function getGclidFromUrl()  { return getUrlParam('gclid'); }
    function getFbclidFromUrl() { return getUrlParam('fbclid'); }
    function getTtclidFromUrl() { return getUrlParam('ttclid'); }

    function buildFbc(fbclid) {
        if (!fbclid) return null;
        var timestamp = Math.floor(Date.now() / 1000);
        return 'fb.1.' + timestamp + '.' + fbclid;
    }

    function getUtmParams() {
        return {
            utm_source:   getUrlParam('utm_source'),
            utm_medium:   getUrlParam('utm_medium'),
            utm_campaign: getUrlParam('utm_campaign')
        };
    }

    // ========================================
    // GA4 (gtag) — espera + leitura de campos
    // ========================================

    function waitForGtag(maxWait, callback) {
        maxWait = maxWait || 8000;
        var startTime = Date.now();

        function check() {
            if (typeof window.gtag === 'function') {
                callback(true);
                return;
            }
            if (window.dataLayer && !window.gtag) {
                window.gtag = function () { window.dataLayer.push(arguments); };
                callback(true);
                return;
            }
            if (Date.now() - startTime < maxWait) {
                setTimeout(check, 200);
            } else {
                console.warn('MyMetricOcc: gtag not found after timeout');
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

            var fieldTimeout = setTimeout(function () {
                if (!responded) {
                    responded = true;
                    dataObj[field] = null;
                    index++;
                    if (index < fields.length) gtagGet();
                    else callback(dataObj);
                }
            }, 2000);

            try {
                window.gtag('get', measurementId, field, function (val) {
                    if (!responded) {
                        responded = true;
                        clearTimeout(fieldTimeout);
                        dataObj[field] = val || null;
                        index++;
                        if (index < fields.length) gtagGet();
                        else callback(dataObj);
                    }
                });
            } catch (e) {
                if (!responded) {
                    responded = true;
                    clearTimeout(fieldTimeout);
                    dataObj[field] = null;
                    index++;
                    if (index < fields.length) gtagGet();
                    else callback(dataObj);
                }
            }
        }
        gtagGet();
    }

    function getClientIdFromCookie() {
        var gaCookie = getCookie('_ga');
        if (gaCookie) {
            var parts = gaCookie.split('.');
            if (parts.length >= 4) return parts.slice(2).join('.');
        }
        return null;
    }

    function getSessionIdFromCookie(measurementId) {
        var cookieName = '_ga_' + measurementId.replace('G-', '');
        var sessionCookie = getCookie(cookieName);
        if (sessionCookie) {
            var parts = sessionCookie.split('.');
            if (parts.length >= 3) return parts[2];
        }
        return null;
    }

    // ========================================
    // GERAÇÃO DO mm_tracker
    // ========================================

    function initTracker(config) {
        var domain = config.domain;
        var measurementId = config.measurementId;
        var encoded = config.encoded !== undefined ? config.encoded : true;
        var retryCount = 0;
        var maxRetries = config.maxRetries || 3;

        function createCookie(dataObj) {
            var fbp = getCookie('_fbp');
            var fbc = getCookie('_fbc');
            var gclid = dataObj.gclid || getCookie('_gcl_aw') || getGclidFromUrl();
            var ttclid = getCookie('_ttp') || getTtclidFromUrl();

            if (!fbc) {
                var fbclid = getFbclidFromUrl();
                if (fbclid) fbc = buildFbc(fbclid);
            }

            var utms = getUtmParams();

            var cookies = {
                client_id:     dataObj.client_id || null,
                session_id:    dataObj.session_id || null,
                fbp:           fbp || null,
                fbc:           fbc || null,
                gclid:         gclid || null,
                ttclid:        ttclid || null,
                awin_channel:  getCookie('AwinChannelCookie') || null,
                awin_click_id: getCookie('awc') || null,
                ua:            btoa(navigator.userAgent)
            };

            if (utms.utm_source)   cookies.utm_source   = utms.utm_source;
            if (utms.utm_medium)   cookies.utm_medium   = utms.utm_medium;
            if (utms.utm_campaign) cookies.utm_campaign = utms.utm_campaign;

            var hasAnyData = cookies.client_id || cookies.fbp || cookies.fbc ||
                             cookies.gclid || cookies.ttclid;

            if (!hasAnyData) {
                console.warn('MyMetricOcc: No tracking data available');
                if (retryCount < maxRetries) {
                    retryCount++;
                    console.log('MyMetricOcc: Retrying tracker in 2s (attempt ' + retryCount + ')');
                    setTimeout(run, 2000);
                }
                return false;
            }

            var cookiesJson = JSON.stringify(cookies);
            if (encoded) cookiesJson = encodeURIComponent(cookiesJson);

            setCookie('mm_tracker', cookiesJson, 365, domain);
            console.log('MyMetricOcc: mm_tracker cookie created', cookies.client_id ? '(with GA4)' : '(without GA4)');
            return true;
        }

        function run() {
            waitForGtag(8000, function (gtagReady) {
                if (gtagReady) {
                    fetchGtagFields(measurementId, function (result) {
                        if (!result.client_id) result.client_id = getClientIdFromCookie();
                        if (!result.session_id) result.session_id = getSessionIdFromCookie(measurementId);
                        createCookie(result);
                    });
                } else {
                    createCookie({
                        client_id:  getClientIdFromCookie(),
                        session_id: getSessionIdFromCookie(measurementId),
                        gclid:      null
                    });
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
    // MÓDULO OCC CART
    // ========================================

    function getOccCartId(callback, errorCallback) {
        try {
            fetch('/ccstore/v1/cart', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Accept': 'application/json' }
            })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
                if (data) {
                    var id = data.orderId || data.id || data.cartId;
                    if (id) { callback(id); return; }
                }
                if (window.CC && typeof window.CC.cart === 'function') {
                    var cart = window.CC.cart();
                    var id2 = cart && (cart.orderId || cart.id);
                    if (id2) { callback(id2); return; }
                }
                errorCallback(new Error('OCC cart id not found'));
            })
            .catch(errorCallback);
        } catch (e) {
            errorCallback(e);
        }
    }

    function initOccCart(config) {
        if (!isCartOrCheckoutPage()) return;

        var slug = config && config.slug;
        if (!slug) {
            console.warn('MyMetricOcc: slug é obrigatório');
            return;
        }

        var eventName = slug + '_occ_cart';
        var maxRetries = config.maxRetries || 10;
        var retryDelay = config.retryDelay || 1000;
        var retryCount = 0;

        function sendData(cartId, mmTracker) {
            var body = JSON.stringify({
                event_name: eventName,
                event_params: {
                    order_form_id: cartId,
                    cart_id: cartId,
                    mm_tracker: mmTracker
                }
            });

            fetch(ENDPOINT + '?event_name=' + eventName, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: body
            })
            .then(function (r) {
                if (r.ok) {
                    console.log('MyMetricOcc: cart data sent (' + eventName + ')');
                } else {
                    retry();
                }
            })
            .catch(retry);
        }

        function retry() {
            if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(run, retryDelay);
            }
        }

        function run() {
            var mmTracker = getCookie('mm_tracker');
            if (!mmTracker) { retry(); return; }

            getOccCartId(function (cartId) {
                sendData(cartId, mmTracker);
            }, retry);
        }

        if (document.readyState === 'complete') {
            run();
        } else {
            window.addEventListener('load', run);
        }
    }

    // ========================================
    // INIT UNIFICADO
    // ========================================

    function init(config) {
        if (!config || !config.domain || !config.measurementId || !config.slug) {
            console.warn('MyMetricOcc: domain, measurementId e slug são obrigatórios');
            return;
        }

        initTracker({
            domain: config.domain,
            measurementId: config.measurementId,
            encoded: config.encoded !== undefined ? config.encoded : true,
            maxRetries: config.maxRetries || 3
        });

        initOccCart({
            slug: config.slug,
            maxRetries: config.cartMaxRetries || 10,
            retryDelay: config.cartRetryDelay || 1000
        });
    }

    window.MyMetricOcc = {
        init: init,
        initTracker: initTracker,
        initOccCart: initOccCart,
        getCookie: getCookie,
        isCartOrCheckoutPage: isCartOrCheckoutPage
    };
})(window);
