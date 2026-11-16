// Allcatrazes — evento de frete do checkout (pixel personalizado, Shopify > Configurações >
// Eventos de clientes). Colar este arquivo inteiro num pixel próprio ("MyMetric - Frete"),
// separado da OneTag.
//
// Manda allcatrazes_shipping_calculation para events.mymetric.app (gtms.shipping_calculation),
// no mesmo formato do shipping_calc das lojas com calculadora no carrinho (Linus, ABC...),
// com step 'add_shipping_info': opção de frete escolhida, preço, CEP e itens.
// Um envio por (checkout, opção, preço): trocar de Sedex pra PAC gera outro, repetir não.
//
// Na Web Pixels API o checkout.shippingLine só tem `price`; nome e tipo do frete vêm de
// checkout.delivery.selectedDeliveryOptions.
(function () {
  var SLUG = 'allcatrazes';
  var GA4 = 'G-ND2G5PRHK4';
  var NOME = SLUG + '_shipping_calculation';
  var DEST = 'https://events.mymetric.app/posts?event_name=' + NOME;
  var enviados = {};

  // document.cookie primeiro: no pixel personalizado ele enxerga os cookies da loja
  // (_ga, _ga_XXXX, mm_tracker), e o browser.cookie.get devolve vazio (medido 16/11/2026).
  function cookie(nome) {
    try {
      var m = document.cookie.match(new RegExp('(?:^|; )' + nome + '=([^;]*)'));
      if (m && m[1]) return Promise.resolve(m[1]);
      if (typeof browser !== 'undefined' && browser && browser.cookie && browser.cookie.get) {
        return Promise.resolve(browser.cookie.get(nome)).catch(function () { return null; });
      }
    } catch (e) { /* segue sem */ }
    return Promise.resolve(null);
  }
  function mmTracker(raw) {
    if (!raw) return {};
    try { return JSON.parse(decodeURIComponent(raw)) || {}; } catch (e) {
      try { return JSON.parse(raw) || {}; } catch (e2) { return {}; }
    }
  }

  // _ga = GA1.1.<rand>.<ts> -> user_pseudo_id <rand>.<ts>
  function pseudoId(ga) {
    if (!ga) return null;
    var p = String(ga).split('.');
    return p.length >= 4 ? p.slice(-2).join('.') : null;
  }
  // _ga_XXXX = GS2.1.s1761144746$o3... ou GS1.1.1761144746.3... -> 1761144746
  function sessionId(v) {
    if (!v) return null;
    var m = String(v).match(/\.s(\d+)\$/) || String(v).match(/^GS1\.\d\.(\d+)\./);
    return m ? m[1] : null;
  }

  function freteDe(ck) {
    var op = ck && ck.delivery && ck.delivery.selectedDeliveryOptions && ck.delivery.selectedDeliveryOptions[0];
    var bruto = op && op.costAfterDiscounts && op.costAfterDiscounts.amount != null ? op.costAfterDiscounts.amount
      : op && op.cost && op.cost.amount != null ? op.cost.amount
      : ck && ck.shippingLine && ck.shippingLine.price ? ck.shippingLine.price.amount : null;
    if (!op && bruto == null) return null;
    var preco = Number(bruto);
    return {
      name: op && op.title || null,
      type: op && op.type ? String(op.type).toLowerCase() : 'delivery',
      handle: op && op.handle || null,
      price: isFinite(preco) ? preco : 0,
      price_before_discount: op && op.cost && op.cost.amount != null ? Number(op.cost.amount) : null,
      min_due_hours: null,
      max_due_hours: null,
      pickup_store_id: null
    };
  }

  function enviar(ck) {
    var frete = freteDe(ck);
    if (!frete) return;
    var chave = (ck.token || 'sem_token') + '|' + frete.name + '|' + frete.price;
    if (enviados[chave]) return;
    enviados[chave] = true;

    var items = (ck.lineItems || []).map(function (li) {
      var v = li && li.variant || {};
      var prod = v.product || {};
      var id = prod.id || null;
      var det = {};
      for (var k in frete) det[k] = frete[k];
      det.item_id = id;
      return {
        item_id: id,
        item_name: prod.title || li.title || null,
        item_brand: prod.vendor || null,
        item_variant: v.title || null,
        item_category: prod.type || null,
        price: v.price && v.price.amount != null ? Number(v.price.amount) : null,
        quantity: li.quantity || 1,
        shipping_details: [det]
      };
    });

    Promise.all([cookie('_ga'), cookie('_ga_' + GA4.replace('G-', '')), cookie('mm_fid'), cookie('mm_tracker')]).then(function (c) {
      var trk = mmTracker(c[3]);
      var corpo = {
        event_name: NOME,
        event_params: {
          user_pseudo_id: pseudoId(c[0]) || trk.client_id || null,
          ga_session_id: sessionId(c[1]) || trk.session_id || null,
          mm_fid: c[2] || null,
          step: 'add_shipping_info',
          zipcode: ((ck.shippingAddress && ck.shippingAddress.zip) || '').replace(/\D+/g, '') || null,
          province: ck.shippingAddress && ck.shippingAddress.provinceCode || null,
          checkout_token: ck.token || null,
          items: items,
          total_cart_items: ck.subtotalPrice && ck.subtotalPrice.amount != null ? Number(ck.subtotalPrice.amount) : null,
          total_shipping_price: frete.price
        }
      };
      return fetch(DEST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
        keepalive: true
      });
    }).catch(function () {});
  }

  analytics.subscribe('checkout_shipping_info_submitted', function (event) {
    try { enviar(event.data.checkout); } catch (e) { /* nunca quebra o checkout */ }
  });

  // Carrinho: a calculadora "Calcular frete" do drawer roda na página, que o pixel não vê.
  // O trecho do tema (allcatrazes_frete_carrinho_tema.html) publica mm_frete_carrinho com
  // o CEP, as opções de frete e o carrinho; aqui vira step 'view_cart', como na Linus.
  function postar(params) {
    return Promise.all([cookie('_ga'), cookie('_ga_' + GA4.replace('G-', '')), cookie('mm_fid'), cookie('mm_tracker')]).then(function (c) {
      var trk = mmTracker(c[3]);
      params.user_pseudo_id = pseudoId(c[0]) || trk.client_id || null;
      params.ga_session_id = sessionId(c[1]) || trk.session_id || null;
      params.mm_fid = c[2] || null;
      return fetch(DEST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_name: NOME, event_params: params }),
        keepalive: true
      });
    }).catch(function () {});
  }

  function enviarCarrinho(d) {
    if (!d || !d.zipcode) return;
    var rates = d.rates || [];
    var chave = 'cart|' + d.zipcode + '|' + d.cart_total + '|' + rates.length;
    if (enviados[chave]) return;
    enviados[chave] = true;
    var horas = function (dias) { return dias && dias.length ? Number(dias[dias.length - 1]) * 24 : null; };
    var horasMin = function (dias) { return dias && dias.length ? Number(dias[0]) * 24 : null; };
    var precos = rates.map(function (r) { return Number(r.price); }).filter(isFinite);
    var items = (d.items || []).map(function (i) {
      return {
        item_id: i.product_id || null,
        item_name: i.title || null,
        item_brand: i.vendor || null,
        item_variant: i.variant_title || null,
        item_category: i.product_type || null,
        price: i.price,
        quantity: i.quantity || 1,
        shipping_details: rates.map(function (r) {
          return {
            price: Number(r.price) || 0,
            min_due_hours: horasMin(r.delivery_days),
            max_due_hours: horas(r.delivery_days),
            type: 'delivery',
            name: r.name || null,
            pickup_store_id: null,
            item_id: i.product_id || null
          };
        })
      };
    });
    postar({
      step: 'view_cart',
      zipcode: d.zipcode,
      items: items,
      total_cart_items: d.cart_total,
      total_shipping_price: precos.length ? Math.min.apply(null, precos) : 0,
      status: d.status === 'freight_unavailable' ? 'freight_unavailable' : null
    });
  }

  analytics.subscribe('mm_frete_carrinho', function (event) {
    try { enviarCarrinho(event.customData); } catch (e) { /* segue */ }
  });
})();
