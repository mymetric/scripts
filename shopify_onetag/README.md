# Shopify OneTag

Este é um script para integração do MyMetric com a Shopify utilizando Customer Events.

## Plataformas Suportadas

- 📊 **Google Analytics 4 (GA4)** - IDs começando com `G-`
- 📘 **Meta Pixel (Facebook Ads)** - IDs começando com `meta_` ou `fb_`
- 🎵 **TikTok Pixel** - IDs começando com `tiktok_` (em desenvolvimento)
- 📌 **Pinterest Tag** - IDs começando com `pinterest_` ou `pin_` (em desenvolvimento)

## Como usar

1. Adicione o script no Customer Events do seu Shopify
2. Substitua os seguintes parâmetros:
   - `ids`: Array com os IDs de rastreamento (GA4, Meta Pixel, etc.)
   - `slug`: Nome da sua loja no MyMetric
   - `debugMode`: `true` para modo de desenvolvimento, `false` para produção

## Exemplo de implementação



```js
var mmtr = document.createElement("script");
mmtr.src = "https://cdn.jsdelivr.net/gh/mymetric/scripts@main/shopify_onetag/main.js";
document.head.appendChild(mmtr);

// Adicione seus IDs de rastreamento (GA4, Meta Pixel, etc.)
var ids = [
    "G-0KME5VNC5L",           // Google Analytics 4
    "meta_1234567890123456",  // Meta Pixel (Facebook Ads)
    // "tiktok_ABC123DEF456",  // TikTok Pixel (em breve)
    // "pinterest_123456789"   // Pinterest Tag (em breve)
];
var slug = "linus";
var debugMode = true;

// (Opcional) Endpoint HTTP que vai receber, via POST, o payload bruto de TODOS os
// eventos do Shopify capturados por analytics.subscribe('all_events'). Deixe null/undefined
// para desativar (comportamento padrão, sem envio extra nenhum).
var webhookUrl = null; // ex: "https://meu-endpoint.com/shopify-events"

mmtr.onload = function() {
    
    mymetric_onetag_shopify_init(ids, slug, debugMode, false, webhookUrl);

    analytics.subscribe('all_events', (event) => {
        mymetric_onetag_shopify_events(event, slug, debugMode);
    });
};
```

## Enviar todos os eventos para um endpoint (webhook)

Além do disparo padrão para GA4/Meta/etc, é possível ativar o envio de **todos** os
eventos brutos do Shopify (qualquer `event.name`, incluindo os que hoje não têm
dispatch específico) para um endpoint HTTP próprio via `POST`.

Basta passar a URL como 5º parâmetro de `mymetric_onetag_shopify_init`:

```js
mymetric_onetag_shopify_init(ids, slug, debugMode, false, "https://meu-endpoint.com/shopify-events");
```

O payload enviado (JSON, `Content-Type: application/json`) tem o formato:

```json
{
  "customer": "linus",
  "shopify_event_name": "product_added_to_cart",
  "event_id": "...",
  "timestamp": "...",
  "mm_tracker": { "client_id": "...", "session_id": "...", "fbp": "...", "fbc": "...", "gclid": "...", "ttclid": "...", "ua": "..." },
  "fbp": "fb.1....",
  "fbc": "fb.1....",
  "context": { "...": "..." },
  "data": { "...": "..." }
}
```

### Identificadores (`mm_tracker`, `fbp`, `fbc`)

São lidos do **top frame** (a página da loja), não do iframe do pixel. Num custom
pixel do Shopify o `document.cookie` nativo é o do sandbox e não enxerga os cookies
da loja — por isso a leitura usa
[`browser.cookie.get`](https://shopify.dev/docs/api/web-pixels-api/standard-api/browser)
da Web Pixels API, com fallback pro `document.cookie` quando o script roda fora do
sandbox (instalação via tema/GTM, ex: Yampi).

A leitura é assíncrona e fica em cache: é feita na init e revalidada após cada envio.
O envio do evento nunca espera pelo cookie, então os campos podem vir `null` no
primeiro evento de uma sessão nova.

O `mm_tracker` é gravado pelo script [`mymetric_tracker`](../mymetric_tracker/) e vai
parseado no payload (se não for JSON válido, vai o valor cru).

> ⚠️ O nome do evento vai em `shopify_event_name`, **não** em `event_name`. O coletor
> da MyMetric (`events.mymetric.app/posts`) remove a chave `event_name` do topo do body
> antes de gravar, porque usa esse nome pra própria coluna da tabela.

Se `webhookUrl` não for informado (ou for `null`), nada é enviado — comportamento
100% retrocompatível com integrações existentes.

## Eventos Rastreados

O script rastreia automaticamente os seguintes eventos do Shopify:

### Eventos E-commerce (com suporte Meta Pixel)
- ✅ **Page View** - Visualização de páginas (Meta: `PageView`)
- ✅ **Product View** - Visualização de produto (Meta: `ViewContent`)
- ✅ **Add to Cart** - Adicionar ao carrinho (Meta: `AddToCart`)
- ✅ **Cart Viewed** - Visualização do carrinho (Meta: `ViewCart`)
- ✅ **Checkout Started** - Início do checkout (Meta: `InitiateCheckout`)
- ✅ **Payment Info** - Informações de pagamento (Meta: `AddPaymentInfo`)
- ✅ **Collection Viewed** - Visualização de coleção (Meta: `ViewCategory`)
- ✅ **Search** - Busca de produtos (Meta: `Search`)
- ✅ **Remove from Cart** - Remoção do carrinho (Meta: custom event)

### Eventos Auxiliares (GA4 apenas)
- Shipping Info
- Address Info
- Contact Info
- Alerts
- UI Extension Errors