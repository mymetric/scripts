function email_tracker(sourceParam, emailSelector) {

  var postUrl = 'https://mymetric-hub-shopify.ue.r.appspot.com/?source=' + encodeURIComponent(sourceParam);

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
  }

  function logEmailOnChange(input) {
    if (input._emailListenerAttached) return;
    input._emailListenerAttached = true;

    input.addEventListener('change', function (e) {
      var email = e.target.value;
      console.log('Email capturado:', email);

      var mmTracker = getCookie('mm_tracker');
      var formData = JSON.stringify({
        email: email,
        mm_tracker: mmTracker
      });

      var xhr = new XMLHttpRequest();
      xhr.open('POST', postUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('Dados enviados com sucesso:', xhr.responseText);
          } else {
            console.error('Erro ao enviar dados:', xhr.statusText);
          }
        }
      };
      xhr.send(formData);
    });
  }

  function scanForEmailFields(root) {
    if (!root) root = document;
    var emailFields = root.querySelectorAll(emailSelector);
    for (var i = 0; i < emailFields.length; i++) {
      logEmailOnChange(emailFields[i]);
    }
  }

  function matchesEmailSelector(node) {
    return node.matches && node.matches(emailSelector);
  }

  // Inicial: captura campos já presentes
  scanForEmailFields();

  // Observa mudanças no DOM para detectar novos campos
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      for (var i = 0; i < mutation.addedNodes.length; i++) {
        var node = mutation.addedNodes[i];
        if (node.nodeType === 1) {
          if (matchesEmailSelector(node)) {
            logEmailOnChange(node);
          } else {
            scanForEmailFields(node);
          }
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

}
  
