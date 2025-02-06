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

## MyMetric Experiment

```
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
