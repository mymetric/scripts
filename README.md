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
var img = 'https://i.imgur.com/ysabw5G.png';
var title = 'Ganhe até <b>R$100 OFF</b><br>Na Sua Primeira Compra';
var subtitle = 'Cadastre-se para receber seu cupom e ficar por dentro das novidades da Gringa!';
var postUrl = 'https://mymetric-hub-shopify.ue.r.appspot.com/?source=gringa_popup_subscribe';
var buttonText = 'Receber cupom';
var closeText = 'Não quero desconto';
var afterMessage = `<span class="title">Use o Cupom abaixo na sua Primeira Compra</span><br><br>\n
                    <strong class="code">GG100</strong>\n
                    <span>Utilize nas compras acima de R$ 3.000,00.</span><br><br>\n
                    <strong class="code">GG50</strong>\n
                    <span>Utilize nas compras abaixo de R$ 3.000,00.</span>`;
var gtmPreviewCode = 'ZW52LTh8LWhwLTZLZ3JUc1BNMkdublhyMFA3Z3wxOTRkNzRjZmRhYTU5YTcyNGEwNDk=';
var closeDays = 7;
var buttonColor = '#fff';
var buttonBgColor = 'rgb(255 51 0 / var(--tw-bg-opacity))';
var disablePhoneField = false;

(function(d, s, url) {
  var js = d.createElement(s);
  js.src = url;
  js.onload = function() {
    var style = d.createElement('style');
    style.textContent = `
      .image-popup-container img {
        object-position: top !important;
      }
      .image-popup-container h2 {
        font-family: 'Bodoni-72' !important;
        font-size: 26px !important;
        color: #4a4a4a !important;
      }
      .image-popup-container p {
        font-size: 13px !important;
        max-width: 230px !important;
      }
      .image-popup-container input {
        background: #f1f1f1 !important;
        border: none !important;
        border-radius: 10px !important;
        padding: 10px !important;
        max-width: 250px !important;
        font-size: 13px !important;
      }
      .image-popup-container button {
        max-width: 190px !important;
        border-radius: 40px !important;
      }
      .image-popup-container .coupon-message {
        background: none !important;
        color: #333 !important;
      }
      .image-popup-container .coupon-message .title {
        font-family: 'Bodoni-72' !important;
        font-size: 26px !important;
        color: #4a4a4a !important;
      }
      .image-popup-container .coupon-message .code {
        display: block !important;
        border: 2px dashed #333 !important;
        border-radius: 4px !important;
        margin: 0 auto 10px !important;
        padding: 5px !important;
        max-width: 250px !important;
      }
      .image-popup-container span {
        font-size: 12px !important;
      }
    `;
    d.head.appendChild(style);

    // Now create the popup
    createPopup(img, title, subtitle, postUrl, buttonText, closeText, afterMessage, gtmPreviewCode, closeDays, buttonColor, buttonBgColor, disablePhoneField);
  };
  d.head.appendChild(js);
})(document, 'script', 'https://cdn.jsdelivr.net/gh/mymetric/scripts@main/popup.js');
</script>
```

## MyMetric Email Tracker

```html
<script type="text/javascript">
 
var mmtr = document.createElement("script");
mmtr.src = "https://cdn.jsdelivr.net/gh/mymetric/scripts@main/email_tracker.js";
mmtr.onload = function() {
    email_tracker('havaianas_popup_subscribe', 'input[type="email"], #input-email');
};
document.head.appendChild(mmtr);
  
</script>
```

## VTEX Coupon Tracker

Rode esse código no checkout VTEX
```html
<script type="text/javascript">
 
var mmtr = document.createElement("script");
mmtr.src = "https://cdn.jsdelivr.net/gh/mymetric/scripts@main/vtex_coupon.js";
document.head.appendChild(mmtr);
  
</script>
```
Depois configure a tag no GTM
![setup gtm](https://i.imgur.com/XIFHSiN.png)
