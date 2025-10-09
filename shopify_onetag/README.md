# Shopify OneTag

Este é um script para integração do MyMetric com a Shopify utilizando Customer Events.

## Como usar

1. Adicione o script no Customer Events do seu Shopify
2. Substitua os seguintes parâmetros:
   - `ids`: Array com os IDs do Google Analytics 4 (GA4)
   - `slug`: Nome da sua loja no MyMetric
   - `debugMode`: `true` para modo de desenvolvimento, `false` para produção

## Exemplo de implementação



```js
var mmtr = document.createElement("script");
mmtr.src = "https://mymetric.com.br/shopify_onetag.js";
document.head.appendChild(mmtr);

var ids = ["G-0KME5VNC5L"];
var slug = "linus";
var debugMode = true;

mmtr.onload = function() {
    
    mymetric_onetag_shopify_init(ids, slug, debugMode);

    analytics.subscribe('all_events', (event) => {
        mymetric_onetag_shopify_events(event, slug, debugMode);
    });
};
```