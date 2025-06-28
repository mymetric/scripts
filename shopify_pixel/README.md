## MyMetric Shopify Pixel

```javascript
  // atualizar os IDs de Google Tag e Meta Pixel
  window.analytics_tools_ids = {
    ga: 'G-XXXXXXXXX',
    meta: [
      '9999999999999999',
      '8888888888888888'
    ],
    tiktok: [
      '9999999999999999',
      '8888888888888888'
    ]
  };
  
  var mmtr = document.createElement("script");
  mmtr.src = "https://cdn.jsdelivr.net/gh/mymetric/scripts@main/shopify_pixel/main.js";
  document.head.appendChild(mmtr);
  
  mmtr.onload = function() {
    analytics.subscribe('all_events', (event) => {
        mymetric_shopify_pixel(window.analytics_tools_ids, event.name, event.data);
    });
  };
```