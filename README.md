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
(function(d, s, url) {
  var img = 'https://cdn.shopify.com/s/files/1/0619/0206/1748/files/img_popup_desk.png?v=1737035623';
  var title = 'Ganhe 20% OFF e um brinde';
  var subtitle = 'Receba seu desconto e novidades fresquinhas, lançamentos imperdíveis e dicas para nutrir não só o corpo, mas também a alma.';
  var postUrl = 'https://mymetric-hub-shopify.ue.r.appspot.com/?source=holysoup_popup_subscribe';
  var buttonText = 'EU QUERO';
  var closeText = 'Não gosto de promoçoes';
  var afterMessage = 'Parabéns! Utilize o código <strong>CARNA20</strong> para obter 20% OFF';
  var gtmPreviewCode = 'ZW52LTh8LWhwLTZLZ3JUc1BNMkdublhyMFA3Z3wxOTRhZGMxZjAzNjhhMGJmNWJkMmQ=';
  var closeDays = 7;
  var buttonColor = '#fff';
  var buttonBgColor = '#00b45a';
  var disablePhoneField = false;
  
  var js = d.createElement(s);
  js.src = url;
  js.onload = function() {
    createPopup(img, title, subtitle, postUrl, buttonText, closeText, afterMessage, gtmPreviewCode, closeDays, buttonColor, buttonBgColor, disablePhoneField);
  };
  d.head.appendChild(js);
})(document, 'script', 'https://cdn.jsdelivr.net/gh/mymetric/scripts@main/popup.js');
```
