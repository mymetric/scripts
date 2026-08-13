# MyMetric Tracker

Script de rastreamento para Google Analytics 4 e Shopify.

## 🚀 Instalação

Adicione este código nos **Customer Events** do Shopify:

```javascript
var mmtr = document.createElement("script");
mmtr.src = "https://cdn.jsdelivr.net/gh/mymetric/scripts@main/mymetric_tracker/main.js";
mmtr.onload = function() {
    // Configure seu domínio e measurement ID do GA4
    mymetric_tracker("seu-dominio.com", "G-SEU-MEASUREMENT-ID");

    // Rastrear checkout
    analytics.subscribe("checkout_started", (event) => {
      mymetric_tracker_checkout("sua-marca", event.data.checkout.token);
    });
};
document.head.appendChild(mmtr);
```

Se for Yampi, fazer via GTM com esse código:

```html
<script>
var mmtr = document.createElement("script");
mmtr.src = "https://cdn.jsdelivr.net/gh/mymetric/scripts@main/mymetric_tracker/main.js";
mmtr.onload = function() {
    // Configure seu domínio e measurement ID do GA4
    mymetric_tracker("seu-dominio.com", "G-SEU-MEASUREMENT-ID");
    
    var cartId = (typeof checkout !== 'undefined' && checkout.cart && checkout.cart.id) ? checkout.cart.token : null;
    
    // Rastrear checkout se URL contiver "seguro"
    if (window.location.href.includes("seguro")) {
      mymetric_tracker_checkout("sua-marca", cartId, true);
    }
};
document.head.appendChild(mmtr);
</script>
```

### 📍 Localização no Shopify:
1. Acesse **Settings > Customer Events**
2. Cole o código acima no campo de eventos
3. Salve as configurações

## ⚙️ Configuração

- **domain**: Seu domínio (ex: "uselinus.com.br")
- **measurementId**: ID de medição do GA4 (ex: "G-WQKK3VE3KF")

## 🔗 Click IDs capturados

O cookie `mm_tracker` carrega o que permite atribuir o pedido a um clique de
anúncio:

| Campo | De onde vem |
|---|---|
| `gclid` | cookie `_gcl_aw` (Google Ads) |
| `fbp` / `fbc` | cookies `_fbp` / `_fbc` (Meta) |
| `ttclid` | parâmetro `?ttclid` → cookie `_ttclid` (TikTok) |
| `oppref` | parâmetro `?oppref` → cookie `_oppref`, com fallback no `__oppref` do SDK da OpenAI (ChatGPT Ads) |
| `obref` | cookie `__obref` do SDK da OpenAI |

O `oppref` é o click id do **ChatGPT Ads**. A Conversions API da OpenAI **não**
o captura sozinha: sem ele o pedido sobe mas casa mal com o clique. O parâmetro
da URL tem precedência sobre o cookie, para um clique novo sobrescrever o
anterior. `msclkid` (Microsoft Ads) também é persistido em cookie, mas ainda não
entra no payload.

---

**Versão**: 1.1.0
