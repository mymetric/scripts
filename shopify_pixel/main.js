//  Função para log estilizado no console
mymetric_log('🟢 Pixel ready - v2.3');

if (typeof window.analytics_tools_ids  !== 'undefined') {
    var ga_id = window.analytics_tools_ids.ga;
    var meta_id = window.analytics_tools_ids.meta;
    var tiktok_id = window.analytics_tools_ids.tiktok;
} else {
    mymetric_log("⚠️ analytics_tools_ids não definido!");
}

function mymetric_log(content) {

    if (window.analytics_tools_ids.debug) {
        var mmBadge = 'MyMetric Shopify Pixel';
        var style1 = "background: #8430ce; color: white; padding: 1px 3px; border-radius: 1px; margin-right: 10px;";
        var style2 = "font-weight: bold;";
        console.log(`%c${mmBadge}%c${content}`, style1, style2);
    }
}


function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}


// gtag.js load
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
if (typeof ga_id !== 'undefined' && ga_id) {
    var mmGtagScript = document.createElement('script');
    mmGtagScript.async = true;
    mmGtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + ga_id;
    document.head.appendChild(mmGtagScript);
    mmGtagScript.onload = function() {
        mymetric_log('🟢 Google Tag ready');

        // Limpar a URL
        const url = window.location.href;
        const regex = /wpm@[^/]+\/custom\/web-pixel-[^/]+@[^/]+\/sandbox\/modern\//;
        const cleanedUrl = url.replace(regex, '');

        gtag('js', new Date());
        gtag('config', ga_id, {
            send_page_view: false,
            page_location: cleanedUrl, // Forçar a URL limpa
            page_path: new URL(cleanedUrl).pathname, // Opcional: caminho limpo
            page_title: document.title || 'Iframe Content' // Opcional: título personalizado
        });

        mymetric_log('🟢 Configured GA4 with cleaned URL: ' + cleanedUrl);
    };
}


// gtag.js load checker
function waitForGA4(callback, timeout = 7000) {
    const start = Date.now();
    const interval = setInterval(() => {
        if (typeof gtag === 'function') {
            mymetric_log('🟢 gtag() ready');
            clearInterval(interval);
            callback();
        } else if (Date.now() - start > timeout) {
            clearInterval(interval);
            mymetric_log('⚠️ gtag() not loaded (timeout)');
        }
    }, 100);
}

// Meta Pixel load
if (Array.isArray(meta_id) && meta_id.length > 0) {
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    for (let i = 0; i < meta_id.length; i++) {
        fbq('init', meta_id[i]);
        mymetric_log('🟢 Meta Pixel ready | ' + meta_id[i]);
    }
    fbq('track', 'PageView');
}

// TikTok Pixel load
if (Array.isArray(tiktok_id) && tiktok_id.length > 0) {
    !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))};};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
      var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e;};ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
      ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e);};
      }(window, document, 'ttq');

    for (let i = 0; i < tiktok_id.length; i++) {
        mymetric_log('🟢 TikTok Pixel ready | ' + tiktok_id[i]);
        ttq.load(tiktok_id[i]);
    }
    ttq.page();
}

function md5cycle(x, k) {
    function cmn(q, a, b, x, s, t) {
        a = (((a + q) | 0) + ((x + t) | 0)) | 0;
        return (((a << s) | (a >>> (32 - s))) + b) | 0;
    }

    function ff(a, b, c, d, x, s, t) {
        return cmn((b & c) | (~b & d), a, b, x, s, t);
    }

    function gg(a, b, c, d, x, s, t) {
        return cmn((b & d) | (c & ~d), a, b, x, s, t);
    }

    function hh(a, b, c, d, x, s, t) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function ii(a, b, c, d, x, s, t) {
        return cmn(c ^ (b | ~d), a, b, x, s, t);
    }

    let [a, b, c, d] = x;

    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = (x[0] + a) | 0;
    x[1] = (x[1] + b) | 0;
    x[2] = (x[2] + c) | 0;
    x[3] = (x[3] + d) | 0;
}

function md5blk(s) {
    const md5blks = [];
    for (let i = 0; i < 64; i += 4) {
        md5blks[i >> 2] =
            s.charCodeAt(i) +
            (s.charCodeAt(i + 1) << 8) +
            (s.charCodeAt(i + 2) << 16) +
            (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
}

function md5(input) {
    input = input.toLowerCase().trim();
    let n = input.length;
    let state = [1732584193, -271733879, -1732584194, 271733878];

    let i;
    for (i = 64; i <= n; i += 64) {
        md5cycle(state, md5blk(input.substring(i - 64, i)));
    }

    input = input.substring(i - 64);
    const tail = Array(16).fill(0);
    for (i = 0; i < input.length; i++)
        tail[i >> 2] |= input.charCodeAt(i) << ((i % 4) << 3);
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);

    if (i > 55) {
        md5cycle(state, tail);
        for (i = 0; i < 16; i++) tail[i] = 0;
    }

    tail[14] = n * 8;
    md5cycle(state, tail);

    return state
        .map(s =>
            ('00000000' + (s >>> 0).toString(16)).slice(-8)
        )
        .join('');
}

function decodeBase64(str) {
    try {
        return atob(str).trim(); // remove espaços antes/depois do decode
    } catch (e) {
        return null;
    }
}

function formatPhoneInternational(phone) {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) return `+55${digits}`;
    if (digits.length === 13 && digits.startsWith('55')) return `+${digits}`;
    return null;
}

const emailRaw = decodeBase64(getCookie('mm_email'));
const phoneRaw = decodeBase64(getCookie('mm_phone'));

const cleanEmail = emailRaw ? emailRaw.toLowerCase().trim() : null;
const cleanPhone = phoneRaw ? formatPhoneInternational(phoneRaw.trim()) : null;

var emailHashed = cleanEmail ? md5(cleanEmail) : null;
var phoneHashed = cleanPhone ? md5(cleanPhone) : null;

mymetric_log('✉️ Email Limpo: ' + cleanEmail);
mymetric_log('✉️ Email Hash: ' + emailHashed);

mymetric_log('📞 Phone Limpo: ' + cleanPhone);
mymetric_log('📞 Phone Hash: ' + phoneHashed);

function mymetric_shopify_pixel(analytics_tools_ids, eventName, eventData) {

    const ga_id = analytics_tools_ids.ga;
    const meta_id = analytics_tools_ids.meta;
    const tiktok_id = analytics_tools_ids.tiktok;

    const convertEvents = {
        'search_submitted': {
            'ga': 'search',
            'meta': 'Search',
            'tiktok': 'Search'
        },
        'collection_viewed': {
            'ga': 'view_item_list'
        },
        'product_viewed': {
            'ga': 'view_item',
            'meta': 'ViewContent',
            'tiktok': 'ViewContent'
        },
        'product_added_to_cart': {
            'ga': 'add_to_cart',
            'meta': 'AddToCart',
            'tiktok': 'AddToCart'
        },
        'product_removed_from_cart': {
            'ga': 'remove_from_cart'
        },
        'cart_viewed': {
            'ga': 'view_cart'
        },
        'checkout_started': {
            'ga': 'begin_checkout',
            'meta': 'InitiateCheckout',
            'tiktok': 'InitiateCheckout'
        },
        'checkout_shipping_info_submitted': {
            'ga': 'add_shipping_info'
        },
        'payment_info_submitted': {
            'ga': 'add_payment_info',
            'meta': 'AddPaymentInfo',
            'tiktok': 'AddPaymentInfo'
        },
        'checkout_completed': {
            'ga': 'purchase',
            'meta': 'Purchase',
            'tiktok': 'Purchase'
        },
        'checkout_error': {
            'ga': 'checkout_error',
            'meta': 'checkout_error'
        }
    }



    if(eventName in convertEvents) {
        mymetric_log('🚩 [Shopify event] ' + eventName);
        console.log(eventData);
    }

    // Função para disparar eventos no GA4
    function sendToGA4(eventName, data) {
        if (!ga_id) {
            mymetric_log('⚠️ GA4 ID não configurado, evento ignorado: ' + eventName);
            return;
        }
        
        data.send_to = ga_id;
        //data.debug_mode = true;
        gaEventName = convertEvents[eventName].ga;

        mymetric_log('🚀 [GA4 Event] ' + ga_id + ' | ' + gaEventName);
        console.log(cleanEmail, cleanPhone);
        console.log(data);

        waitForGA4(() => {
            gtag('set', 'user_data', {
                email: cleanEmail || data.email || undefined,
                phone_number: cleanPhone || data.phone || undefined
            });
            gtag('event', gaEventName, data);
        });
    }

    // Função para disparar eventos no Meta Pixel (Facebook)
    function sendToMeta(eventName, data) {
        if (!Array.isArray(meta_id) || meta_id.length === 0) {
            mymetric_log('⚠️ Meta ID não configurado, evento ignorado: ' + eventName);
            return;
        }
        
        if(data.email && !emailHashed) {
            emailHashed = sha256(data.email.toLowerCase().trim());
        }
        if(data.phone && !phoneHashed) {
            phoneHashed = sha256(formatPhoneInternational(data.phone.trim()));
        }
        
        fbEventName = convertEvents[eventName].meta;

        const metaData = typeof data === 'object' ? {
            content_type: 'product',
            contents: Array.isArray(data.items) ? data.items.map(item => ({
                id: item.item_id,
                quantity: item.quantity
            })) : [],
            currency: 'BRL',
            value: data.value || 0,
            content_name: data.items?.[0]?.item_name,
            content_category: data.items?.[0]?.item_category,
            em: emailHashed,
            ph: phoneHashed,
            content_id: Array.isArray(data.items) && data.items.length > 0 ? data.items.map(item => item.item_id)
                : undefined
        } : Object.fromEntries([ data.split(": ").map(item => item.trim()) ]);

        fbq('track', fbEventName, metaData);

        for (let i = 0; i < meta_id.length; i++) {
            mymetric_log('🚀 [Meta Event] ' + meta_id[i] + ' | ' + fbEventName);
        }

        console.log(metaData);
    }

    function sendToTiktok(eventName, data) {
        if (!Array.isArray(tiktok_id) || tiktok_id.length === 0) {
            mymetric_log('⚠️ TikTok ID não configurado, evento ignorado: ' + eventName);
            return;
        }

        if(data.email && !emailHashed) {
            emailHashed = sha256(data.email.toLowerCase().trim());
        }
        if(data.phone && !phoneHashed) {
            phoneHashed = sha256(formatPhoneInternational(data.phone.trim()));
        }

        const ttqData = typeof data === 'object' ? {
            content_type: 'product',
            contents: Array.isArray(data.items) ? data.items.map(item => ({
                content_id: item.item_id,
                content_type: 'product',
                quantity: item.quantity
            })) : [],
            currency: 'BRL',
            value: data.value || 0,
            content_name: data.items?.[0]?.item_name,
            content_category: data.items?.[0]?.item_category,
            em: emailHashed,
            ph: phoneHashed
        } : Object.fromEntries([ data.split(": ").map(item => item.trim()) ]);

        const tkEventName = convertEvents[eventName].tiktok;

        ttq.track(tkEventName, ttqData);

        for (let i = 0; i < tiktok_id.length; i++) {
            mymetric_log('🚀 [TikTok Event] ' + tiktok_id[i] + ' | ' + tkEventName);
        }
        console.log(ttqData);
    }

    // Disparado quando um usuário realiza uma busca no site
    if (eventName === 'search_submitted') {

        let items = eventData.searchResult.productVariants.map(item => ({
            item_id: item.product.id.toString(),
            item_name: item.product.title || item.product.untranslatedTitle,
            price: parseFloat(item.price.amount) || 0,
            currency: item.price.currencyCode,
            quantity: 1,
            item_category: item.product.type || null,
        }));

        let searchData = {
            search_term: eventData.searchResult.query
        };

        sendToGA4(eventName, searchData);
        sendToMeta(eventName, 'search_string: ' + eventData.searchResult.query);
        sendToTiktok(eventName, 'search_string: ' + eventData.searchResult.query);
    }
    
  // Disparado quando um usuário visualiza uma lista de produtos
    if (eventName === 'collection_viewed') {
    
        let items = eventData.collection.productVariants.map(item => ({
            item_id: item.product.id.toString(),
            item_name: item.product.title || item.product.untranslatedTitle,
            price: parseFloat(item.price.amount) || 0,
            currency: item.price.currencyCode,
            quantity: 1,
            item_category: item.product.type || null,
        }));

        let collectionData = {
        event: 'mymetric_view_item_list',
        ecommerce: {
            item_list_name: eventData.collection.title,
            items: items || [],
        },
        fired_from: 'custom_pixel'
        };

        sendToGA4(eventName, collectionData.ecommerce);
    }

    // Disparado na visualização de um produto
    if (eventName === 'product_viewed') {
        let items = [{
            item_id: eventData.productVariant.product.id.toString(),
            item_name: eventData.productVariant.product.title,
            price: parseFloat(eventData.productVariant.price.amount),
            currency: eventData.productVariant.price.currencyCode,
            quantity: 1,
            item_category: eventData.productVariant.product.type || null,
        }];

        let productData = {
            event: 'mymetric_view_item',
            ecommerce: {
                currency: eventData.productVariant.price.currencyCode,
                value: eventData.productVariant.price.amount,
                items: items || [],
            },
            fired_from: 'custom_pixel'
        };

        sendToGA4(eventName, productData.ecommerce);
        sendToMeta(eventName, productData.ecommerce);
        sendToTiktok(eventName, productData.ecommerce);
    }

    // Disparado quando um produto é adicionado ao carrinho
    if (eventName === 'product_added_to_cart') {
        let items = [{
            item_id: eventData.cartLine.merchandise.id.toString(),
            item_name: eventData.cartLine.merchandise.product.title || eventData.cartLine.merchandise.product.untranslatedTitle,
            price: parseFloat(eventData.cartLine.merchandise.price.amount),
            currency: eventData.cartLine.merchandise.price.currencyCode,
            quantity: eventData.cartLine.quantity,
            item_category: eventData.cartLine.merchandise.product.type || null,
        }];

        let cartData = {
        event: 'mymetric_add_to_cart',
        ecommerce: {
            currency: eventData.cartLine.cost.totalAmount.currencyCode,
            value: parseFloat(eventData.cartLine.cost.totalAmount.amount) || 0,
            items: items || [],
        },
        fired_from: 'custom_pixel'
        };

        sendToGA4(eventName, cartData.ecommerce);
        sendToMeta(eventName, cartData.ecommerce);
        sendToTiktok(eventName, cartData.ecommerce);
    }

    // Disparado quando um produto é removido do carrinho
    if (eventName === 'product_removed_from_cart') {
        let items = [{
            item_id: eventData.cartLine.merchandise.id.toString(),
            item_name: eventData.cartLine.merchandise.product.title || eventData.cartLine.merchandise.product.untranslatedTitle,
            price: parseFloat(eventData.cartLine.merchandise.price.amount),
            currency: eventData.cartLine.merchandise.price.currencyCode,
            quantity: eventData.cartLine.quantity,
            item_category: eventData.cartLine.merchandise.product.type || null,
        }];

        let removeCartData = {
        event: 'mymetric_remove_from_cart',
        ecommerce: {
            items: items || [],
        },
        fired_from: 'custom_pixel'
        };

        sendToGA4(eventName, removeCartData.ecommerce);
    }

    // Disparado quando o usuário visualiza a página do carrinho de compras
    if (eventName === 'cart_viewed') {
        let items = eventData.cart.lines.map(item => ({
            item_id: item.merchandise.product.id.toString(),
            item_name: item.merchandise.product.title || item.merchandise.product.untranslatedTitle,
            price: parseFloat(item.merchandise.price.amount),
            currency: item.merchandise.price.currencyCode,
            quantity: parseInt(item.quantity) || 1,
            item_category: item.merchandise.product.type || null,
        }));

        let cartViewData = {
        event: 'mymetric_view_cart',
        ecommerce: {
            currency: eventData.cart.cost.totalAmount.currencyCode,
            value: parseFloat(eventData.cart.cost.totalAmount.amount) || 0,
            items: items || [],
        },
        fired_from: 'custom_pixel'
        };

        sendToGA4(eventName, cartViewData.ecommerce);
    }

    // Disparado quando o usuário inicia o checkout
    if (eventName === 'checkout_started') {
        let items = eventData.checkout.lineItems.map(item => ({
            item_id: item.variant.product.id.toString(),
            item_name: item.variant.product.title || item.merchandise.product.untranslatedTitle,
            price: parseFloat(item.variant.price.amount),
            currency: item.variant.price.currencyCode,
            quantity: parseInt(item.quantity) || 1,
            item_category: item.variant.product.type || null,
        }));
    
        let checkoutData = {
            event: 'mymetric_checkout_started',
            ecommerce: {
                currency: eventData.checkout.totalPrice.currencyCode,
                value: parseFloat(eventData.checkout.totalPrice.amount) || 0,
                items: items || [],
                email: eventData.checkout.email || null,
                phone: eventData.checkout.shippingAddress.phone || null
            },
            fired_from: 'custom_pixel'
        };

        sendToGA4(eventName, checkoutData.ecommerce);
        sendToMeta(eventName, checkoutData.ecommerce);
        sendToTiktok(eventName, checkoutData.ecommerce);
    }

    // Disparado quando o usuário informa os dados de entrega
    if (eventName === 'checkout_shipping_info_submitted') {
        let items = eventData.checkout.lineItems.map(item => ({
            item_id: item.variant.product.id.toString(),
            item_name: item.variant.product.title || item.merchandise.product.untranslatedTitle,
            price: parseFloat(item.variant.price.amount),
            currency: item.variant.price.currencyCode,
            quantity: parseInt(item.quantity) || 1,
            item_category: item.variant.product.type || null,
        }));
    
        let checkoutData = {
            event: 'mymetric_checkout_shipping_info_submitted',
            ecommerce: {
                currency: eventData.checkout.totalPrice.currencyCode,
                value: parseFloat(eventData.checkout.totalPrice.amount) || 0,
                items: items || [],
                email: eventData.checkout.email || null,
                phone: eventData.checkout.shippingAddress.phone || null
            },
            fired_from: 'custom_pixel'
        };

        sendToGA4(eventName, checkoutData.ecommerce);
    }

    // Disparado quando o usuário informa os dados de pagamento
    if (eventName === 'payment_info_submitted') {
        let items = eventData.checkout.lineItems.map(item => ({
            item_id: item.variant.product.id.toString(),
            item_name: item.variant.product.title || item.merchandise.product.untranslatedTitle,
            price: parseFloat(item.variant.price.amount),
            currency: item.variant.price.currencyCode,
            quantity: parseInt(item.quantity) || 1,
            item_category: item.variant.product.type || null,
        }));
    
        let checkoutData = {
            event: 'mymetric_payment_info_submitted',
            ecommerce: {
                currency: eventData.checkout.totalPrice.currencyCode,
                value: parseFloat(eventData.checkout.totalPrice.amount) || 0,
                items: items || [],
                email: eventData.checkout.email || null,
                phone: eventData.checkout.shippingAddress.phone || null
            },
            fired_from: 'custom_pixel'
        };

        sendToGA4(eventName, checkoutData.ecommerce);
        sendToMeta(eventName, checkoutData.ecommerce);
        sendToTiktok(eventName, checkoutData.ecommerce);

    }

    // Disparado quando o usuário conclui uma transação
    if (eventName === 'checkout_completed') {
        let discountApplications = eventData.checkout.discountApplications;
        let titleCoupons = discountApplications.map(e => e.title).join(", ");

        let purchaseData = {
        event: 'mymetric_purchase',
        ecommerce: {
            currency: eventData.checkout.currencyCode,
            value: eventData.checkout.totalPrice.amount,
            coupon: titleCoupons || "",
            items: convertItems(event) || [],
            transaction_id: eventData.checkout.order.id,
            tax: parseFloat(eventData.checkout.totalTax.amount) || 0,
            shipping: parseFloat(eventData.checkout.shippingLine.price.amount) || 0
        },
        user_email: eventData.checkout.email,
        fired_from: 'custom_pixel',
        };

        //sendToGA4(eventName, purchaseData.ecommerce);
        //sendToMeta(eventName, purchaseData.ecommerce);
    }

    if (eventName === 'alert_displayed') {

        let errorData = {
            error_name: eventData.name,
            error_message: eventData.data.alert.message,
            error_target: eventData.data.alert.target,
            error_type: eventData.data.alert.type,
            error_value: eventData.data.alert.value,
            error_event_name: eventData.name,
            error_event_type: eventData.type
        };

        sendToGA4("checkout_error", errorData);
        
    }

}
