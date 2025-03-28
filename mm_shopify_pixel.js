//  Função para log estilizado no console
MMConsoleLog('🟢 Pixel ready - v2.1.6');

if (typeof window.analytics_tools_ids  !== 'undefined') {
    var ga_id = window.analytics_tools_ids.ga;
    var meta_id = window.analytics_tools_ids.meta;
} else {
    MMConsoleLog("⚠️ analytics_tools_ids não definido!");
}

function MMConsoleLog(content) {
    var mmBadge = 'MyMetric Shopify Pixel';
    var style1 = "background: #8430ce; color: white; padding: 1px 3px; border-radius: 1px; margin-right: 10px;";
    var style2 = "font-weight: bold;";
    console.log(`%c${mmBadge}%c${content}`, style1, style2);
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
function gtag(){ dataLayer.push(arguments); }
var mmGtagScript = document.createElement('script');
mmGtagScript.async = true;
mmGtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + ga_id;
document.head.appendChild(mmGtagScript);
mmGtagScript.onload = function() {
    MMConsoleLog('🟢 Google Tag ready');
    gtag('js', new Date());
    gtag('config', ga_id);
};

// gtag.js load checker
function waitForGA4(callback, timeout = 7000) {
    const start = Date.now();
    const interval = setInterval(() => {
        if (typeof gtag === 'function') {
            MMConsoleLog('🟢 gtag() ready');
            clearInterval(interval);
            callback();
        } else if (Date.now() - start > timeout) {
            clearInterval(interval);
            MMConsoleLog('⚠️ gtag() not loaded (timeout)');
        }
    }, 100);
}

// Meta Pixel load
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
    MMConsoleLog('🟢 Meta Pixel ready | ' + meta_id[i]);
}
fbq('track', 'PageView');

function mmShopifyPixel(ga_id, meta_id, eventName, eventData) {

    const convertEvents = {
        'search_submitted': {
            'ga': 'search',
            'meta': 'Search'
        },
        'collection_viewed': {
            'ga': 'view_item_list'
        },
        'product_viewed': {
            'ga': 'view_item',
            'meta': 'ViewContent'
        },
        'product_added_to_cart': {
            'ga': 'add_to_cart',
            'meta': 'AddToCart'
        },
        'product_removed_from_cart': {
            'ga': 'remove_from_cart'
        },
        'cart_viewed': {
            'ga': 'view_cart'
        },
        'checkout_started': {
            'ga': 'begin_checkout',
            'meta': 'InitiateCheckout'
        },
        'checkout_shipping_info_submitted': {
            'ga': 'add_shipping_info'
        },
        'payment_info_submitted': {
            'ga': 'add_payment_info'
        },
        'checkout_completed': {
            'ga': 'purchase',
            'meta': 'Purchase'
        }
    }

    const mmEmail = getCookie('mm_email') || null;
    const mmPhone = getCookie('mm_phone') || null;

    if(eventName in convertEvents) {
        MMConsoleLog('🚩 [Shopify event] ' + eventName);
        console.log(eventData);
    }

    // Função para disparar eventos no GA4
    function sendToGA4(eventName, data) {
        data.send_to = ga_id;
    
        // Tenta obter a URL real da página principal
        let realPageUrl;
        try {
            // Se o script está em um iframe, tenta acessar a URL do topo (página principal)
            realPageUrl = window.top.location.href;
        } catch (e) {
            // Fallback: reconstrói a URL com base no domínio, caminho e parâmetros
            realPageUrl = window.location.origin + window.location.pathname + window.location.search;
        }
    
        // Remove referências ao sandbox, se presentes
        if (realPageUrl.includes('/wpm@') || realPageUrl.includes('/sandbox/')) {
            realPageUrl = window.location.origin + window.location.pathname.replace(/\/wpm@.*$|\/sandbox.*$/, '');
        }
    
        // Define o parâmetro 'dl' com a URL "limpa" e completa
        data.dl = realPageUrl;
    
        gaEventName = convertEvents[eventName].ga;
    
        MMConsoleLog('🚀 [GA4 Event] ' + ga_id + ' | ' + gaEventName);
        console.log(data);
    
        waitForGA4(() => {
            gtag('event', gaEventName, data);
        });
    }

    // Função para disparar eventos no Meta Pixel (Facebook)
    function sendToMeta(eventName, data) {
        fbEventName = convertEvents[eventName].meta;
        const metaData = typeof data === 'object' ? {
            content_type: 'product',
            contents: data.items.map(item => ({
                id: item.item_id,
                quantity: item.quantity
            })),
            currency: 'BRL',
            value: data.value || 0,
            content_name: data.items[0]?.item_name,
            content_category: data.items[0]?.item_category,
            em: data.email || mmEmail,
            ph: data.phone || mmPhone
        } : Object.fromEntries([ data.split(": ").map(item => item.trim()) ]);

        fbq('track', fbEventName, metaData);

        for (let i = 0; i < meta_id.length; i++) {
            MMConsoleLog('🚀 [Meta Event] ' + meta_id[i] + ' | ' + fbEventName);
        }

        console.log(metaData);

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
    };
    
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
    };    

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
    };    

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
    };

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
    };

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
                phone: eventData.checkout.phone || null
            },
            fired_from: 'custom_pixel'
        };

        sendToGA4(eventName, checkoutData.ecommerce);
        sendToMeta(eventName, checkoutData.ecommerce);
    };

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
            },
            fired_from: 'custom_pixel'
        };

        sendToGA4(eventName, checkoutData.ecommerce);
    };

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
            },
            fired_from: 'custom_pixel'
        };

        sendToGA4(eventName, checkoutData.ecommerce);
        sendToMeta(eventName, checkoutData.ecommerce);

    };  

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
    };    

}
