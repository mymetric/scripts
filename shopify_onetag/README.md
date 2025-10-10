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

mmtr.onload = function() {
    
    mymetric_onetag_shopify_init(ids, slug, debugMode);

    analytics.subscribe('all_events', (event) => {
        mymetric_onetag_shopify_events(event, slug, debugMode);
    });
};
```

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