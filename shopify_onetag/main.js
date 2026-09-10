// 🎨 Função para logs discretos do MyMetric Hub
function logMyMetricEvent(eventType, eventData) {
  const timestamp = new Date().toLocaleTimeString();
 
  const eventConfigs = {
    'page_view': {
      icon: '📄',
      title: 'Page View',
      fields: [
        `URL: ${eventData.location || 'Unknown'}`,
        `Title: ${eventData.title || 'Unknown'}`,
        `Time: ${timestamp}`
      ]
    },
    'product_view': {
      icon: '👁️',
      title: 'Product View',
      fields: [
        `Product: ${eventData.product || 'Unknown'}`,
        `Brand: ${eventData.brand || 'Unknown'}`,
        `Price: ${eventData.price || 'N/A'}`,
        `Category: ${eventData.category || 'Unknown'}`,
        `Time: ${timestamp}`
      ]
    },
    'add_to_cart': {
      icon: '🛒',
      title: 'Add to Cart',
      fields: [
        `Product: ${eventData.product || 'Unknown'}`,
        `Quantity: ${eventData.quantity || 1}`,
        `Price: ${eventData.price || 'N/A'}`,
        `Total: ${eventData.total || 'N/A'}`,
        `Variant: ${eventData.variant || 'Default'}`,
        `Time: ${timestamp}`
      ]
    },
    'checkout_start': {
      icon: '💳',
      title: 'Checkout Start',
      fields: [
        `Total: ${eventData.total || 'N/A'}`,
        `Currency: ${eventData.currency || 'Unknown'}`,
        `Time: ${timestamp}`
      ]
    },
    'payment_info': {
      icon: '💳',
      title: 'Payment Info Added',
      fields: [
        `Payment Method: ${eventData.paymentMethod || 'Unknown'}`,
        `Currency: ${eventData.currency || 'Unknown'}`,
        `Total: ${eventData.total || 'N/A'}`,
        `Time: ${timestamp}`
      ]
    },
    'shipping_info': {
      icon: '🚚',
      title: 'Shipping Info Added',
      fields: [
        `Country: ${eventData.country || 'Unknown'}`,
        `City: ${eventData.city || 'Unknown'}`,
        `Postal Code: ${eventData.postalCode || 'N/A'}`,
        `Shipping Method: ${eventData.shippingMethod || 'Standard'}`,
        `Time: ${timestamp}`
      ]
    },
    'alert_displayed': {
      icon: '⚠️',
      title: 'Alert Displayed',
      fields: [
        `Target: ${eventData.target || 'Unknown'}`,
        `Type: ${eventData.type || 'Unknown'}`,
        `Message: ${eventData.message || 'N/A'}`,
        `Time: ${timestamp}`
      ]
    },
    'cart_viewed': {
      icon: '🛒',
      title: 'Cart Viewed',
      fields: [
        `Total Cost: ${eventData.totalCost || 'N/A'}`,
        `Currency: ${eventData.currency || 'Unknown'}`,
        `Items Count: ${eventData.itemsCount || 0}`,
        `First Item: ${eventData.firstItemName || 'N/A'}`,
        `Time: ${timestamp}`
      ]
    },
    'checkout_address_info': {
      icon: '📍',
      title: 'Address Info Submitted',
      fields: [
        `Address: ${eventData.addressLine1 || 'N/A'}`,
        `City: ${eventData.city || 'Unknown'}`,
        `Country: ${eventData.country || 'Unknown'}`,
        `Address Line 2: ${eventData.addressLine2 || 'N/A'}`,
        `Time: ${timestamp}`
      ]
    },
    'checkout_contact_info': {
      icon: '📧',
      title: 'Contact Info Submitted',
      fields: [
        `Email: ${eventData.email || 'N/A'}`,
        `Phone: ${eventData.phone || 'N/A'}`,
        `Time: ${timestamp}`
      ]
    },
    'collection_viewed': {
      icon: '📚',
      title: 'Collection Viewed',
      fields: [
        `Collection: ${eventData.collectionTitle || 'Unknown'}`,
        `First Item Price: ${eventData.priceFirstItem || 'N/A'}`,
        `Time: ${timestamp}`
      ]
    },
    'product_removed_from_cart': {
      icon: '❌',
      title: 'Product Removed from Cart',
      fields: [
        `Product: ${eventData.productName || 'Unknown'}`,
        `Variant: ${eventData.variantTitle || 'N/A'}`,
        `Cost: ${eventData.cartLineCost || 'N/A'}`,
        `Currency: ${eventData.currency || 'Unknown'}`,
        `Time: ${timestamp}`
      ]
    },
    'search_submitted': {
      icon: '🔍',
      title: 'Search Submitted',
      fields: [
        `Query: ${eventData.searchQuery || 'Unknown'}`,
        `First Product: ${eventData.firstProductTitle || 'N/A'}`,
        `Time: ${timestamp}`
      ]
    },
    'ui_extension_errored': {
      icon: '🚨',
      title: 'UI Extension Errored',
      fields: [
        `App Name: ${eventData.appName || 'Unknown'}`,
        `App Version: ${eventData.appVersion || 'N/A'}`,
        `API Version: ${eventData.apiVersion || 'N/A'}`,
        `App ID: ${eventData.appId || 'N/A'}`,
        `Time: ${timestamp}`
      ]
    }
  };
 
  const config = eventConfigs[eventType];
  if (!config) return;
 
  const fieldsString = config.fields.join('\n');
 
  // Log moderno com cores vibrantes
  console.log(
    `%c${config.icon} MyMetricHUB - ${config.title}`,
    'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600; font-size: 12px; padding: 4px 8px; border-radius: 6px;'
  );
  console.log(
    `%c${fieldsString}`,
    'color: #6366f1; font-size: 11px; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;'
  );
  console.log(
    `%c─────────────────────────`,
    'color: #a5b4fc; font-size: 10px; opacity: 0.6;'
  );
}
// 🎯 Função centralizada para disparos do GA4
function trackGA4Event(eventName, eventData, pageLocation, pageTitle) {
  if (window.gtag) {
    const params = {
      ...eventData,
      page_location: pageLocation || eventData.page_location,
      page_title: pageTitle || eventData.page_title
    };
    window.gtag("event", eventName, params);
  }
}
// 📘 Função centralizada para disparos do Meta Pixel
function trackMetaEvent(eventName, eventData = {}) {
  if (window.fbq) {
    window.fbq('track', eventName, eventData);
  }
}
// 📡 URL do endpoint de webhook (configurado via mymetric_onetag_shopify_init)
let mmWebhookUrl = null;
// 🍪 Cache dos cookies de identificação lidos do top frame (mm_tracker, mm_fid, _fbp, _fbc).
// A leitura é assíncrona, então mantemos o último valor conhecido em memória e
// revalidamos em background — o envio do evento nunca espera pelo cookie.
// 🍪 mm_fid é o espelho legível do cookie mm_fpid, que o servidor grava no /id.
// O mm_fpid em si é HttpOnly e não chega aqui de jeito nenhum: o pixel roda em
// iframe de origem opaca, então não manda header Cookie e o browser.cookie.get
// não lê HttpOnly. O espelho existe só pra atravessar essa parede. Ao contrário
// do mm_tracker, ele não depende do gtag ter respondido o client_id, então
// costuma estar presente já no primeiro evento da visita.
// 🍪 mm_cid é o client_id REAL do GA4, devolvido pelo /id num cookie legível.
// Vale mais que o mm_tracker para os eventos de abertura: o mm_tracker só nasce
// depois que o gtag responde, enquanto o mm_cid já está no navegador quando a
// página abre, vindo de uma visita anterior.
let mmCookieCache = { mm_tracker: null, mm_fid: null, mm_cid: null, fbp: null, fbc: null };
// 🍪 Lê um cookie do TOP FRAME (a página da loja), não do iframe do pixel.
// Dentro de um custom pixel do Shopify o `document.cookie` nativo é o do sandbox e
// não enxerga os cookies da loja; a Web Pixels API expõe `browser.cookie.get` (async)
// justamente pra isso. Fora do sandbox (instalação via tema/GTM, ex: Yampi) o
// `browser` não existe e o fallback pro document.cookie nativo mantém o comportamento.
function readTopFrameCookie(name) {
  try {
    if (typeof browser !== 'undefined' && browser && browser.cookie && typeof browser.cookie.get === 'function') {
      return Promise.resolve(browser.cookie.get(name)).catch(() => null);
    }
    const parts = ('; ' + document.cookie).split('; ' + name + '=');
    return Promise.resolve(parts.length === 2 ? parts.pop().split(';').shift() : null);
  } catch (e) {
    return Promise.resolve(null);
  }
}
// 🍪 Revalida o cache de cookies. Chamada na init e após cada envio (para o próximo evento).
function refreshMmCookies() {
  return Promise.all([
    readTopFrameCookie('mm_tracker'),
    readTopFrameCookie('mm_fid'),
    readTopFrameCookie('mm_cid'),
    readTopFrameCookie('_fbp'),
    readTopFrameCookie('_fbc')
  ])
    .then(([mm, fid, cid, fbp, fbc]) => {
      mmCookieCache = { mm_tracker: mm || null, mm_fid: fid || null, mm_cid: cid || null, fbp: fbp || null, fbc: fbc || null };
      return mmCookieCache;
    })
    .catch(() => mmCookieCache);
}
// 🍪 O mm_tracker é gravado como JSON string (client_id, session_id, fbp, fbc, gclid,
// ttclid, ua). Mandamos parseado pra facilitar a consulta no destino; se não for JSON
// válido, vai o valor cru em vez de descartar o dado.
function parseMmTracker(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch (e) {
    try {
      return JSON.parse(raw);
    } catch (e2) {
      return raw;
    }
  }
}
// 📡 Envia o payload bruto de TODOS os eventos do Shopify para um endpoint HTTP configurável.
// Ativado passando `webhookUrl` em mymetric_onetag_shopify_init. Não interfere no fluxo de
// GA4/Meta/etc, é apenas um "espelho" cru dos eventos capturados via analytics.subscribe('all_events').
function sendEventToWebhook(event, customerSlug, debugMode = false) {
  if (!mmWebhookUrl) return;

  // 🍪 O cache é preenchido na init e revalidado só DEPOIS de cada envio, então
  // o primeiro evento de uma visita sairia com o que existia antes do /id ter
  // respondido — e o mm_fid iria null justamente nos eventos de abertura, que
  // são a maioria. Quando ele falta, relê antes de montar o payload. O teto de
  // 400ms existe pra que uma leitura travada nunca segure o evento: passado o
  // prazo, manda com o que tiver, que é o comportamento antigo.
  const pronto = mmCookieCache.mm_fid && mmCookieCache.mm_cid
    ? Promise.resolve()
    : Promise.race([
        refreshMmCookies(),
        new Promise(resolve => setTimeout(resolve, 400))
      ]);

  pronto.then(() => montarEEnviar(event, customerSlug, debugMode));
}

function montarEEnviar(event, customerSlug, debugMode) {
  // ⚠️ Não usar a chave `event_name` no topo do payload: o coletor
  // (events.mymetric.app/posts) remove essa chave do body antes de gravar,
  // porque usa esse nome pra própria coluna da tabela. Por isso `shopify_event_name`.
  const payload = {
    customer: customerSlug,
    shopify_event_name: event?.name,
    event_id: event?.id,
    timestamp: event?.timestamp || new Date().toISOString(),
    // 🍪 Identificadores do top frame, pro consumidor conseguir montar a CAPI/Ads
    mm_tracker: parseMmTracker(mmCookieCache.mm_tracker),
    // O coletor normaliza esse campo para mm_fpid ao publicar. Vai null nas
    // lojas que ainda não têm o /id instalado — campo novo, não quebra nada.
    mm_fid: mmCookieCache.mm_fid,
    // client_id real do GA4, resiliente: não depende do gtag ter respondido.
    mm_cid: mmCookieCache.mm_cid,
    fbp: mmCookieCache.fbp,
    fbc: mmCookieCache.fbc,
    context: event?.context,
    data: event?.data
  };

  fetch(mmWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => {
      if (debugMode) {
        console.log(`%c📡 MyMetricHUB - Evento enviado ao webhook: ${event?.name} (${res.status})`, 'color: #10b981; font-size: 10px;');
      }
    })
    .catch(err => {
      if (debugMode) {
        console.error('MyMetricHUB: erro ao enviar evento para webhook', err);
      }
    });

  // Revalida os cookies pro próximo evento (não bloqueia o envio deste)
  refreshMmCookies();
}
// 🚀 Função principal do MyMetric OneTag Shopify
function mymetric_onetag_shopify_init(trackingIds, customerSlug, debugMode = true, event = false, webhookUrl = null) {
  // Configurar envio de todos os eventos para um endpoint HTTP, se informado
  mmWebhookUrl = webhookUrl || null;
  if (debugMode && mmWebhookUrl) {
    console.log(`%c📡 Webhook de eventos habilitado: ${mmWebhookUrl}`, 'color: #10b981; font-size: 12px; font-weight: 500;');
  }
  // Pré-carrega mm_tracker/_fbp/_fbc pra que o primeiro evento já saia com os identificadores
  if (mmWebhookUrl) {
    refreshMmCookies().then(c => {
      if (debugMode) {
        console.log(`%c🍪 Cookies do top frame: mm_tracker=${c.mm_tracker ? 'ok' : 'ausente'} mm_fid=${c.mm_fid ? 'ok' : 'ausente'} mm_cid=${c.mm_cid ? 'ok' : 'ausente'} _fbp=${c.fbp ? 'ok' : 'ausente'} _fbc=${c.fbc ? 'ok' : 'ausente'}`, 'color: #10b981; font-size: 11px;');
      }
    });
  }
  // Log de inicialização
  if (debugMode) {
    console.log(
      `%c🚀 MyMetricHUB - Inicializando OneTag Shopify`,
      'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600; font-size: 14px; padding: 6px 12px; border-radius: 8px;'
    );
    console.log(
      `%c📊 Tracking IDs recebidos: ${trackingIds.length}`,
      'color: #6366f1; font-size: 12px; font-weight: 500;'
    );
    console.log(
      `%c👤 Customer: ${customerSlug}`,
      'color: #8b5cf6; font-size: 12px; font-weight: 500;'
    );
  }
  // Validar se trackingIds é um array
  if (!Array.isArray(trackingIds)) {
    console.error('MyMetricHUB: trackingIds deve ser um array');
    return;
  }
  // Separar IDs por tipo de ferramenta
  const ga4Ids = trackingIds.filter(id => id.startsWith('G-'));
  const metaIds = trackingIds.filter(id => id.startsWith('meta_') || id.startsWith('fb_'));
  const tiktokIds = trackingIds.filter(id => id.startsWith('tiktok_'));
  const pinterestIds = trackingIds.filter(id => id.startsWith('pinterest_') || id.startsWith('pin_'));
  // Log de separação por tipo
  if (debugMode) {
    console.log(
      `%c🔍 Análise dos IDs:`,
      'color: #8b5cf6; font-weight: 600; font-size: 12px;'
    );
    console.log(`%c 📊 GA4: ${ga4Ids.length} IDs`, 'color: #3b82f6; font-size: 11px;');
    console.log(`%c 📘 Meta: ${metaIds.length} IDs`, 'color: #1877f2; font-size: 11px;');
    console.log(`%c 🎵 TikTok: ${tiktokIds.length} IDs`, 'color: #000000; font-size: 11px;');
    console.log(`%c 📌 Pinterest: ${pinterestIds.length} IDs`, 'color: #e60023; font-size: 11px;');
  }
  // Inicializar GA4 se houver IDs
  if (ga4Ids.length > 0) {
    if (debugMode) {
      console.log(`%c✅ Inicializando GA4 com ${ga4Ids.length} ID(s)`, 'color: #10b981; font-size: 11px;');
    }
    initGA4(ga4Ids, debugMode, event);
  }
  // Inicializar Meta Pixel se houver IDs
  if (metaIds.length > 0) {
    if (debugMode) {
      console.log(`%c✅ Inicializando Meta Pixel com ${metaIds.length} ID(s)`, 'color: #10b981; font-size: 11px;');
    }
    initMetaPixel(metaIds, debugMode);
  }
  // Inicializar TikTok Pixel se houver IDs
  if (tiktokIds.length > 0) {
    if (debugMode) {
      console.log(`%c✅ Inicializando TikTok Pixel com ${tiktokIds.length} ID(s)`, 'color: #10b981; font-size: 11px;');
    }
    initTikTokPixel(tiktokIds, debugMode);
  }
  // Inicializar Pinterest Tag se houver IDs
  if (pinterestIds.length > 0) {
    if (debugMode) {
      console.log(`%c✅ Inicializando Pinterest Tag com ${pinterestIds.length} ID(s)`, 'color: #10b981; font-size: 11px;');
    }
    initPinterestTag(pinterestIds, debugMode);
  }
  // Configurar eventos do Shopify
  if (debugMode) {
    console.log(`%c🛍️ Configurando eventos do Shopify`, 'color: #f59e0b; font-size: 11px;');
  }
  // Log de conclusão
  if (debugMode) {
    console.log(
      `%c🎉 MyMetricHUB - Inicialização concluída!`,
      'background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; font-weight: 600; font-size: 12px; padding: 4px 8px; border-radius: 6px;'
    );
  }
}
// 📊 Inicializar GA4
function initGA4(ga4Ids, debugMode = false, event = false) {
  if (debugMode) {
    console.log(`%c 📊 Carregando gtag.js para: ${ga4Ids[0]}`, 'color: #3b82f6; font-size: 10px;');
  }
 
    // Carregar gtag.js dinamicamente
    var gtagScript = document.createElement("script");
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Ids[0]}`;
    gtagScript.async = true;
    document.head.appendChild(gtagScript);
 
    // Inicializar gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag; // expõe globalmente
    gtag("js", new Date());

  // Configurar todos os IDs do GA4.
  // Nao setar page_location / page_path / page_title aqui: dentro do custom pixel da
  // Shopify o `window.location` e a URL do iframe sandbox
  // (/web-pixels@<hash>/custom/web-pixel-<id>@<v>/sandbox/modern/<caminho real>), e o
  // config nao tem acesso ao contexto do evento pra saber a URL de verdade. Pior: os
  // parametros do config sao sticky e o `page_path` nunca era sobrescrito por evento,
  // entao o caminho do sandbox grudava em todos os eventos da sessao e era ele que os
  // relatorios "Paginas e telas" do GA4 exibiam.
  // Cada evento manda seu proprio page_location/page_title a partir de
  // event.context.document (ver mymetric_onetag_shopify_events e trackGA4Event), e o
  // GA4 deriva o caminho do page_location sozinho.
  ga4Ids.forEach(id => {
    
    gtag("config", id, {
      send_page_view: false
    });
    
    if (debugMode) {
      console.log(`%c ✅ GA4 configurado: ${id}`, 'color: #10b981; font-size: 10px;');
    }
  });
}
// 📘 Inicializar Meta Pixel
function initMetaPixel(metaIds, debugMode = false) {
  if (debugMode) {
    console.log(`%c 📘 Carregando Meta Pixel para: ${metaIds.join(', ')}`, 'color: #1877f2; font-size: 10px;');
  }
  // Carregar Meta Pixel base code
  !function(f,b,e,v,n,t,s) {
    if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)
  }(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  // Expor fbq globalmente
  window.fbq = window.fbq || function() {
    (window.fbq.queue = window.fbq.queue || []).push(arguments);
  };
  // Inicializar todos os pixels
  metaIds.forEach(id => {
    // Remover prefixo "meta_" ou "fb_" se existir
    const cleanId = id.replace(/^(meta_|fb_)/, '');
   
    window.fbq('init', cleanId);
   
    if (debugMode) {
      console.log(`%c ✅ Meta Pixel configurado: ${cleanId}`, 'color: #10b981; font-size: 10px;');
    }
  });
  // Enviar PageView inicial
  window.fbq('track', 'PageView');
}
// 🎵 Inicializar TikTok Pixel
function initTikTokPixel(tiktokIds, debugMode = false) {
  if (debugMode) {
    console.log(`%c 🎵 TikTok Pixel IDs: ${tiktokIds.join(', ')}`, 'color: #000000; font-size: 10px;');
  }
  // TODO: Implementar TikTok Pixel
}
// 📌 Inicializar Pinterest Tag
function initPinterestTag(pinterestIds, debugMode = false) {
  if (debugMode) {
    console.log(`%c 📌 Pinterest Tag IDs: ${pinterestIds.join(', ')}`, 'color: #e60023; font-size: 10px;');
  }
  // TODO: Implementar Pinterest Tag
}
// 🛍️ Configurar eventos do Shopify
function mymetric_onetag_shopify_events(event, customerSlug = 'unknown', debugMode = false) {
  // Extrair contexto da página para todos os eventos GA4 e Telemetry (exceto page_view, que já tem)
  const pageLocation = event.context?.document?.location?.href || window.location.href;
  const pageTitle = event.context?.document?.title || document.title;

  if (debugMode) {
    console.log(`%c 🛍️ Configurando 13 eventos do Shopify`, 'color: #f59e0b; font-size: 10px;');
  }

  // 📡 Envia o evento cru (todos os tipos, sem filtro) para o webhook configurado, se houver.
  // Isolado em try/catch: essa chamada roda ANTES dos dispatches de GA4/Meta abaixo, então
  // um erro síncrono aqui (ex: URL de webhook malformada faz fetch lançar TypeError na hora)
  // derrubaria todo o tracking do evento em silêncio.
  try {
    sendEventToWebhook(event, customerSlug, debugMode);
  } catch (err) {
    if (debugMode) {
      console.error('MyMetricHUB: webhook falhou (ignorado, tracking segue)', err);
    }
  }

  if(event.name === "page_viewed") {
    logMyMetricEvent('page_view', {
      location: event.context.document.location.href,
      title: event.context.document.title
    });
   
    trackGA4Event("page_view", {
        page_location: event.context.document.location.href,
        page_title: event.context.document.title
    });
   
    trackMetaEvent("PageView");
   
  }
  if(event.name === "product_viewed") {
    const product = event.data.productVariant?.product;
   
    logMyMetricEvent('product_view', {
      product: product?.title,
      brand: product?.vendor,
      price: event.data.productVariant?.price?.amount,
      category: product?.type
    });
   
    trackGA4Event("view_item", {
        items: [{
          item_id: product?.id,
          item_name: product?.title,
          item_brand: product?.vendor,
          item_category: product?.type,
          price: event.data.productVariant?.price?.amount
        }]
      }, pageLocation, pageTitle);
   
    trackMetaEvent("ViewContent", {
      content_name: product?.title,
      content_ids: [product?.id],
      content_type: 'product',
      value: event.data.productVariant?.price?.amount,
      currency: event.data.productVariant?.price?.currencyCode || 'USD'
    });
   
  }
  if(event.name === "product_added_to_cart") {
    const cartLine = event.data.cartLine;
    const product = cartLine?.merchandise?.product;
   
    logMyMetricEvent('add_to_cart', {
      product: product?.title,
      quantity: cartLine?.quantity,
      price: cartLine?.merchandise?.price?.amount,
      total: cartLine?.cost?.totalAmount?.amount,
      variant: cartLine?.merchandise?.title
    });
 
    trackGA4Event("add_to_cart", {
        currency: cartLine?.merchandise?.price?.currencyCode,
        value: cartLine?.cost?.totalAmount?.amount,
        items: [{
          item_id: product?.id,
          item_name: product?.title,
          item_brand: product?.vendor,
          item_category: product?.type,
          item_variant: cartLine?.merchandise?.title, // ex: "36/37"
          price: cartLine?.merchandise?.price?.amount,
          quantity: cartLine?.quantity,
          sku: cartLine?.merchandise?.sku
        }]
      }, pageLocation, pageTitle);
   
    trackMetaEvent("AddToCart", {
      content_name: product?.title,
      content_ids: [product?.id],
      content_type: 'product',
      value: cartLine?.cost?.totalAmount?.amount,
      currency: cartLine?.merchandise?.price?.currencyCode || 'USD',
      contents: [{
        id: product?.id,
        quantity: cartLine?.quantity
      }]
    });
   
  }
  if(event.name === "checkout_started") {
    logMyMetricEvent('checkout_start', {
      total: event.data.checkout?.totalPrice?.amount,
      currency: event.data.checkout?.currencyCode
    });
   
    trackGA4Event("begin_checkout", {
        currency: event.data.checkout?.currencyCode,
        value: event.data.checkout?.totalPrice?.amount
      }, pageLocation, pageTitle);
   
    trackMetaEvent("InitiateCheckout", {
      value: event.data.checkout?.totalPrice?.amount,
      currency: event.data.checkout?.currencyCode || 'USD',
      num_items: event.data.checkout?.lineItems?.length || 0
    });
   
  }
  if(event.name === "payment_info_submitted") {
    logMyMetricEvent('payment_info', {
      paymentMethod: event.data.paymentMethod?.type || 'Unknown',
      currency: event.data.checkout?.currencyCode,
      total: event.data.checkout?.totalPrice?.amount
    });
   
    trackGA4Event("add_payment_info", {
      currency: event.data.checkout?.currencyCode,
      value: event.data.checkout?.totalPrice?.amount,
      payment_type: event.data.paymentMethod?.type
    }, pageLocation, pageTitle);
   
    trackMetaEvent("AddPaymentInfo", {
      value: event.data.checkout?.totalPrice?.amount,
      currency: event.data.checkout?.currencyCode || 'USD'
    });
   
  }
  if(event.name === "checkout_shipping_info_submitted") {
    logMyMetricEvent('shipping_info', {
      country: event.data.checkout?.shippingAddress?.country,
      city: event.data.checkout?.shippingAddress?.city,
      postalCode: event.data.checkout?.shippingAddress?.zip,
      shippingMethod: event.data.checkout?.shippingLine?.title || 'Standard'
    });
   
    trackGA4Event("add_shipping_info", {
      currency: event.data.checkout?.currencyCode,
      value: event.data.checkout?.totalPrice?.amount,
      shipping_tier: event.data.checkout?.shippingLine?.title
    }, pageLocation, pageTitle);
   
  }
  if(event.name === "alert_displayed") {
    const alert = event.data.alert;
   
    logMyMetricEvent('alert_displayed', {
      target: alert?.target,
      type: alert?.type,
      message: alert?.message
    });
   
    // Enviar evento customizado para GA4
    trackGA4Event("alert_displayed", {
      alert_target: alert?.target,
      alert_type: alert?.type,
      alert_message: alert?.message
    }, pageLocation, pageTitle);
   
  }
  if(event.name === "cart_viewed") {
    const cart = event.data.cart;
    const firstCartLine = cart?.lines?.[0];
   
    logMyMetricEvent('cart_viewed', {
      totalCost: cart?.cost?.totalAmount?.amount,
      currency: cart?.cost?.totalAmount?.currencyCode,
      itemsCount: cart?.lines?.length || 0,
      firstItemName: firstCartLine?.merchandise?.product?.title
    });
   
    trackGA4Event("view_cart", {
      currency: cart?.cost?.totalAmount?.currencyCode,
      value: cart?.cost?.totalAmount?.amount,
      items: cart?.lines?.map(line => ({
        item_id: line?.merchandise?.product?.id,
        item_name: line?.merchandise?.product?.title,
        item_brand: line?.merchandise?.product?.vendor,
        item_category: line?.merchandise?.product?.type,
        item_variant: line?.merchandise?.title,
        price: line?.merchandise?.price?.amount,
        quantity: line?.quantity
      }))
    }, pageLocation, pageTitle);
   
    trackMetaEvent("ViewCart", {
      value: cart?.cost?.totalAmount?.amount,
      currency: cart?.cost?.totalAmount?.currencyCode || 'USD',
      num_items: cart?.lines?.length || 0,
      content_ids: cart?.lines?.map(line => line?.merchandise?.product?.id) || []
    });
   
  }
  if(event.name === "checkout_address_info_submitted") {
    const checkout = event.data.checkout;
    const address = checkout?.shippingAddress;
   
    logMyMetricEvent('checkout_address_info', {
      addressLine1: address?.address1,
      addressLine2: address?.address2,
      city: address?.city,
      country: address?.country
    });
   
    trackGA4Event("add_shipping_info", {
      currency: checkout?.currencyCode,
      value: checkout?.totalPrice?.amount,
      shipping_tier: checkout?.shippingLine?.title
    }, pageLocation, pageTitle);
   
  }
  if(event.name === "checkout_contact_info_submitted") {
    const checkout = event.data.checkout;
   
    logMyMetricEvent('checkout_contact_info', {
      email: checkout?.email,
      phone: checkout?.phone
    });
   
    trackGA4Event("add_contact_info", {
      currency: checkout?.currencyCode,
      value: checkout?.totalPrice?.amount
    }, pageLocation, pageTitle);
   
  }
  if(event.name === "collection_viewed") {
    const collection = event.data.collection;
    const firstProduct = collection?.productVariants?.[0];
   
    logMyMetricEvent('collection_viewed', {
      collectionTitle: collection?.title,
      priceFirstItem: firstProduct?.price?.amount
    });
   
    trackGA4Event("view_item_list", {
      item_list_name: collection?.title,
      items: collection?.productVariants?.slice(0, 10).map(variant => ({
        item_id: variant?.product?.id,
        item_name: variant?.product?.title,
        item_brand: variant?.product?.vendor,
        item_category: variant?.product?.type,
        price: variant?.price?.amount
      }))
    }, pageLocation, pageTitle);
   
    trackMetaEvent("ViewCategory", {
      content_name: collection?.title,
      content_category: collection?.title,
      content_ids: collection?.productVariants?.slice(0, 7).map(v => v?.product?.id) || []
    });
   
  }
  if(event.name === "product_removed_from_cart") {
    const cartLine = event.data.cartLine;
    const product = cartLine?.merchandise?.product;
   
    logMyMetricEvent('product_removed_from_cart', {
      productName: product?.title,
      variantTitle: cartLine?.merchandise?.title,
      cartLineCost: cartLine?.cost?.totalAmount?.amount,
      currency: cartLine?.cost?.totalAmount?.currencyCode
    });
   
    trackGA4Event("remove_from_cart", {
      currency: cartLine?.cost?.totalAmount?.currencyCode,
      value: cartLine?.cost?.totalAmount?.amount,
      items: [{
        item_id: product?.id,
        item_name: product?.title,
        item_brand: product?.vendor,
        item_category: product?.type,
        item_variant: cartLine?.merchandise?.title,
        price: cartLine?.merchandise?.price?.amount,
        quantity: cartLine?.quantity
      }]
    }, pageLocation, pageTitle);
   
    // Meta Pixel doesn't have a standard RemoveFromCart event, using custom event
    if (window.fbq) {
      window.fbq('trackCustom', 'RemoveFromCart', {
        content_name: product?.title,
        content_ids: [product?.id],
        content_type: 'product',
        value: cartLine?.cost?.totalAmount?.amount,
        currency: cartLine?.cost?.totalAmount?.currencyCode || 'USD'
      });
    }
   
  }
  if(event.name === "search_submitted") {
    const searchResult = event.data.searchResult;
    const firstProduct = searchResult?.productVariants?.[0];
   
    logMyMetricEvent('search_submitted', {
      searchQuery: searchResult?.query,
      firstProductTitle: firstProduct?.product?.title
    });
   
    trackGA4Event("search", {
      search_term: searchResult?.query,
      items: searchResult?.productVariants?.slice(0, 10).map(variant => ({
        item_id: variant?.product?.id,
        item_name: variant?.product?.title,
        item_brand: variant?.product?.vendor,
        item_category: variant?.product?.type,
        price: variant?.price?.amount
      }))
    }, pageLocation, pageTitle);
   
    trackMetaEvent("Search", {
      search_string: searchResult?.query,
      content_ids: searchResult?.productVariants?.slice(0, 10).map(v => v?.product?.id) || []
    });
   
  }
  if(event.name === "ui_extension_errored") {
    const alert = event.data.alert;
   
    logMyMetricEvent('ui_extension_errored', {
      appName: alert?.appName,
      appVersion: alert?.appVersion,
      apiVersion: alert?.apiVersion,
      appId: alert?.appId
    });
   
    trackGA4Event("exception", {
      description: `UI Extension Error: ${alert?.appName} v${alert?.appVersion}`,
      fatal: false
    }, pageLocation, pageTitle);
   
  }
}
