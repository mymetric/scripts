/**
 * MyMetric Tracker — Oracle Commerce Cloud (OCC) cart capture
 *
 * Captura o cart_id do OCC em /cart, /checkout e /confirmation e envia
 * junto com o cookie mm_tracker para o coletor do Heimdall.
 *
 * Serve via jsDelivr:
 *   <script src="https://cdn.jsdelivr.net/gh/mymetric/scripts@main/mmtracker_occ.js"></script>
 *   <script>
 *     MyMetricOcc.init({ slug: 'confianca' });
 *   </script>
 */
(function (window) {
    'use strict';

    var ENDPOINT = 'https://events.mymetric.app/posts';

    function getCookie(name) {
        var value = '; ' + document.cookie;
        var parts = value.split('; ' + name + '=');
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    function isCartOrCheckoutPage() {
        var url = window.location.href.toLowerCase();
        return url.indexOf('/cart') > -1
            || url.indexOf('/checkout') > -1
            || url.indexOf('/confirmation') > -1;
    }

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
                    console.log('MyMetric: OCC cart data sent (' + eventName + ')');
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

    window.MyMetricOcc = {
        init: initOccCart,
        getCookie: getCookie,
        isCartOrCheckoutPage: isCartOrCheckoutPage
    };
})(window);
