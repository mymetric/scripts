# scripts

## MyMetric Tracker

```
<script type="text/javascript">
 
var s = document.createElement("script");
s.src = "https://cdn.jsdelivr.net/gh/mymetric/scripts@main/mmtracker.js";
s.onload = function() {
    // alterar domínio
    mymetric_tracker("meurodape.com", {{gtagApiResult.client_id}}, {{gtagApiResult.session_id}});
};
document.head.appendChild(s);
  
</script>
```
