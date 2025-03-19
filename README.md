# scripts

## MyMetric Tracker

```html
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

## MyMetric Experiment

```html
<script type="text/javascript">
 
var mmtr_exp = document.createElement("script");
mmtr_exp.src = "https://cdn.jsdelivr.net/gh/mymetric/scripts@main/experiment.js";
mmtr_exp.onload = function() {
    
    var bucket = bucket_sort();
      
    // if(bucket > 4) {
    new_experiment("8EdeRUP2EvmEStY", "Novo Fluxo de Cadastro", experiment_changes);
    // }



};
document.head.appendChild(mmtr_exp);

function experiment_original(exp_id) {}
    
function experiment_changes(exp_id) {

    // Alterações na versão variante

}

</script>
```

## MyMetric Popup

```html
<script type="text/javascript">

var img = 'https://orthocrin.com.br/cdn/shop/files/Serie_955.jpg?v=1729166167&width=1000';
var title = 'Você ganhou frete grátis e mais 3% de desconto na sua primeira compra.';
var subtitle = 'Preencha os seus dados para liberarmos o cupom.';
var postUrl = 'https://mymetric-hub-shopify.ue.r.appspot.com/?source=orthocrin_popup_subscribe';
var buttonText = 'Receber cupom';
var closeText = 'Não quero desconto';
var afterMessage = 'Parabéns! Utilize o código <strong>ORTHOLOVER</strong> para obter o desconto e o frete grátis na sua primeira compra!';
var gtmPreviewCode = 'ZW52LTh8LWhwLTZLZ3JUc1BNMkdublhyMFA3Z3wxOTRkNzRjZmRhYTU5YTcyNGEwNDk=';
var closeDays = 7;
var buttonColor = '#fff';
var buttonBgColor = '#910039';
var disablePhoneField = false;
var phoneRequired = true;



(function(d, s, url) {
  var js = d.createElement(s);
  js.src = url;
  js.onload = function() {
    createPopup(img, title, subtitle, postUrl, buttonText, closeText, afterMessage, gtmPreviewCode, closeDays, buttonColor, buttonBgColor, disablePhoneField, phoneRequired);
  };
  d.head.appendChild(js);
})(document, 'script', 'https://cdn.jsdelivr.net/gh/mymetric/scripts@main/popup.js');

</script>
```

## MyMetric Shopify Pixel

```javascript
// atualizar os IDs de Google Tag e Meta Pixel
window.analytics_tools_ids = {
  ga: 'G-XXXXXXXXXX',
  meta: '9999999999999'
};

const version = 'v1.51'
console.log('####### ' + version);

var mmtr = document.createElement("script");
mmtr.src = "https://spart.digital/sandbox/mymetric/mm-tracker.js";
document.head.appendChild(mmtr);

mmtr.onload = function() {
    analytics.subscribe('all_events', (event) => {
        const eventName = event.name;
        const eventData = event.data;
        mmShopifyPixel(window.analytics_tools_ids.ga, window.analytics_tools_ids.meta, eventName, eventData);
    });
};
```
