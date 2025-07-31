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

---

**Versão**: 1.0.0
