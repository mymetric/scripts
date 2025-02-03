# scripts

## MyMetric Tracker

```
<script type="text/javascript">
 
var mmtr = document.createElement("script");
mmtr.src = "https://cdn.jsdelivr.net/gh/mymetric/scripts@main/mmtracker.js";
mmtr.onload = function() {
    // alterar domínio e measurement id do GA
    mymetric_tracker('evoke.com.br', 'G-PT6GK7MY7');
};
document.head.appendChild(mmtr);
  
</script>
```
================================

## MyMetric Shopify Pixel

```
<script type="text/javascript">
 
 var mmshp = document.createElement("script");
 mmshp.src = "https://cdn.jsdelivr.net/gh/mymetric/scripts@main/mm_shopify_pixel.js";
 mmshp.onload = function() {
      const gtm_id = 'GTM-PDPQT372'; // GTM ID
      const ga_id = 'G-SFSKL08Y9J'; // GA4 Measurement ID
      const meta_id = '452255119039696'; // Meta Pixel ID
      mmShopifyPixel(gtm_id, ga_id, meta_id);
 };
 document.head.appendChild(mmshp);
   
 </script>
```
