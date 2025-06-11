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

  // Escaneia um root (normal ou shadow) e recursivamente entra em shadow roots
  function deepScanForEmailFields(root) {
    if (!root) return;

    try {
      var emailFields = root.querySelectorAll(emailSelector);
      for (var i = 0; i < emailFields.length; i++) {
        logEmailOnChange(emailFields[i]);
      }
    } catch (e) {
      // Pode lançar erro em alguns tipos de nós (ex: document-fragment)
    }

    // Verifica se há shadow roots nos elementos filhos
    var children = root.children || [];
    for (var j = 0; j < children.length; j++) {
      var child = children[j];
      if (child.shadowRoot) {
        deepScanForEmailFields(child.shadowRoot);
      }
      deepScanForEmailFields(child); // recursivamente entra nos filhos normais também
    }
  }

  function matchesEmailSelector(node) {
    return node.matches && node.matches(emailSelector);
  }

  // Inicial
  deepScanForEmailFields(document);

  // Observer para DOM normal
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      for (var i = 0; i < mutation.addedNodes.length; i++) {
        var node = mutation.addedNodes[i];
        if (node.nodeType === 1) {
          if (matchesEmailSelector(node)) {
            logEmailOnChange(node);
          } else {
            deepScanForEmailFields(node);
            // Se o novo nó tiver shadow root, escaneia também
            if (node.shadowRoot) {
              deepScanForEmailFields(node.shadowRoot);
            }
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
