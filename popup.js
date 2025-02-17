function getCookie(name) {
  var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) {
    return match[2];
  } else {
    return null;
  }
}

function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function deleteCookie(name) {
  document.cookie = name + '=; Max-Age=-99999999; path=/';
}

function isMobileDevice() {
  return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

function isDebugMode() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('debug') && urlParams.get('debug') === 'true';
}

function isMetaBrowser() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  var isInstagram = userAgent.includes('Instagram');
  var isFacebook = userAgent.includes('FBAN') || userAgent.includes('FBAV');
  return isInstagram || isFacebook;
}

function getCookie(name) {
  var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) {
    return match[2];
  } else {
    return null;
  }
}

function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function deleteCookie(name) {
  document.cookie = name + '=; Max-Age=-99999999; path=/';
}

function isMobileDevice() {
  return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

function isDebugMode() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('debug') && urlParams.get('debug') === 'true';
}

function isMetaBrowser() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  var isInstagram = userAgent.includes('Instagram');
  var isFacebook = userAgent.includes('FBAN') || userAgent.includes('FBAV');
  return isInstagram || isFacebook;
}

function createPopup(imgUrl, titleText, subtitleText, postUrl, buttonText, closeText, afterMessage, gtmPreviewCode, closeDays, buttonColor, buttonBgColor, disablePhoneField) {

  // Verifica se a URL contém "crm", "email" ou "mautic"
  const currentUrl = window.location.href.toLowerCase();
  if (currentUrl.includes('crm') || currentUrl.includes('email') || currentUrl.includes('mautic') || currentUrl.includes('whatsapp')) {
    setCookie('popup_closed', 'true', 7);
    console.log('Popup fechado automaticamente devido à URL contendo termos específicos.');
    return;
  }

  // Check if popup should be shown
  if (getCookie('mm_email') || getCookie('mm_phone') || getCookie('popup_closed')) {
    return;
  }

  var overlay = document.createElement('div');
  overlay.setAttribute('id', 'image-popup-overlay');
  overlay.style.backgroundColor = '#00000080';
  overlay.style.position = 'fixed';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.top = '0';
  overlay.style.zIndex = '100000';

  var container = document.createElement('div');
  container.setAttribute('class', 'image-popup-container');
  container.style.flexDirection = 'row';
  container.style.boxShadow = '0px 0px 10px #382f2f';
  container.style.borderRadius = '10px';
  container.style.backgroundColor = '#fff';
  container.style.overflow = 'hidden';
  container.style.position = 'relative';

  if (!isMobileDevice()) {
    container.style.display = 'flex';
    container.style.maxWidth = '800px';
    container.style.maxHeight = '480px';
    container.style.width = '60vw';
    container.style.height = '480px';
  } else {
    container.style.width = '95%';
    container.style.height = '97%';
  }

  var image = document.createElement('img');
  image.setAttribute('src', imgUrl);
  image.style.objectFit = 'cover';

  image.onload = function() {
    // Imagem carregada com sucesso
  };

  if (!isMobileDevice()) {
    image.style.height = '100%';
    image.style.width = '50%';
  } else {
    image.style.display = 'block';
    image.style.height = '230px';
    image.style.width = '100%';
    image.style.objectPosition = 'bottom';
  }

  var formContainer = document.createElement('div');
  formContainer.style.display = 'flex';
  formContainer.style.flexDirection = 'column';
  formContainer.style.alignItems = 'center';
  formContainer.style.justifyContent = 'center';
  formContainer.style.overflow = 'auto';
  if (!isMobileDevice()) {
    formContainer.style.width = '50%';
    formContainer.style.padding = '20px';
  } else {
    formContainer.style.width = '100%';
    formContainer.style.padding = '2px 10px';
  }

  var title = document.createElement('h2');
  title.innerText = titleText;
  title.style.textAlign = 'center';
  title.style.marginBottom = '10px';
  title.style.color = '#333';

  var subtitle = document.createElement('p');
  subtitle.innerText = subtitleText;
  subtitle.style.textAlign = 'center';
  subtitle.style.marginBottom = '10px';
  subtitle.style.color = '#333';
  subtitle.style.lineHeight = '1.2';

  var nameInput = document.createElement('input');
  nameInput.setAttribute('placeholder', 'Seu Nome');
  nameInput.setAttribute('name', 'name');
  nameInput.setAttribute('type', 'text');
  nameInput.style.marginBottom = '10px';
  nameInput.style.padding = '15px';
  nameInput.style.width = '100%';
  nameInput.style.borderRadius = '5px';
  nameInput.style.border = '1px solid #ccc';
  nameInput.style.fontSize = '16px';

  var emailInput = document.createElement('input');
  emailInput.setAttribute('placeholder', 'Seu E-mail');
  emailInput.setAttribute('name', 'email');
  emailInput.setAttribute('type', 'email');
  emailInput.style.marginBottom = '10px';
  emailInput.style.padding = '15px';
  emailInput.style.width = '100%';
  emailInput.style.borderRadius = '5px';
  emailInput.style.border = '1px solid #ccc';
  emailInput.style.fontSize = '16px';

  var phoneInput;
  if (!disablePhoneField) {
    phoneInput = document.createElement('input');
    phoneInput.setAttribute('placeholder', 'Seu Telefone');
    phoneInput.setAttribute('name', 'phone');
    phoneInput.setAttribute('type', 'tel');
    phoneInput.style.marginBottom = '10px';
    phoneInput.style.padding = '15px';
    phoneInput.style.width = '100%';
    phoneInput.style.borderRadius = '5px';
    phoneInput.style.border = '1px solid #ccc';
    phoneInput.style.fontSize = '16px';

    phoneInput.addEventListener('input', function(e) {
      var x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
      e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
      
      // Adiciona evento de preenchimento de campo ao dataLayer
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "mm_modal",
        event_name: "field_changed",
        field_name: e.target.name
      });
    });
  }

  var errorMessage = document.createElement('div');
  errorMessage.style.color = 'white';
  errorMessage.style.marginBottom = '10px';
  errorMessage.style.display = 'none';
  errorMessage.style.background = '#b12727';
  errorMessage.style.width = '100%';
  errorMessage.style.padding = '3px 10px';
  errorMessage.style.fontSize = '12px';

  var submitButton = document.createElement('button');
  submitButton.innerText = buttonText;
  submitButton.style.padding = '15px';
  submitButton.style.width = '100%';
  submitButton.style.borderRadius = '5px';
  submitButton.style.border = 'none';
  submitButton.style.backgroundColor = buttonBgColor;
  submitButton.style.color = buttonColor;
  submitButton.style.fontSize = '16px';
  submitButton.style.cursor = 'pointer';
  submitButton.style.marginBottom = '10px';

  var closeLink = document.createElement('a');
  closeLink.innerHTML = closeText;
  closeLink.style.textAlign = 'center';
  closeLink.style.textDecoration = 'underline';
  closeLink.style.cursor = 'pointer';
  closeLink.style.color = '#333';
  closeLink.style.fontSize = '0.8em';

  closeLink.addEventListener('click', function() {
    overlay.remove();
    setCookie('popup_closed', 'true', closeDays);
    
    // Adiciona evento de fechamento ao dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "mm_modal",
      event_name: "popup_closed"
    });
  });

  if (isMetaBrowser()) {
    image.style.height = '45%';
    var ribbon = document.createElement('div');
    ribbon.innerHTML = 'Deixe o email ou abra o navegador externo para uma experiÃªncia completa <span style="font-size: 25px;position: absolute;right: 8px;top: 5px;">&#x2191;</span>';
    ribbon.style.position = 'absolute';
    ribbon.style.backgroundColor = '#ffcc00';
    ribbon.style.padding = '1px 40px 1px 8px';
    ribbon.style.borderRadius = '5px';
    ribbon.style.fontSize = '14px';
    ribbon.style.color = '#000';
    ribbon.style.zIndex = '100001';
    container.appendChild(ribbon);
  }

  formContainer.appendChild(title);
  formContainer.appendChild(subtitle);
  formContainer.appendChild(nameInput);
  formContainer.appendChild(emailInput);
  if (!disablePhoneField) {
    formContainer.appendChild(phoneInput);
  }
  formContainer.appendChild(errorMessage);
  formContainer.appendChild(submitButton);
  formContainer.appendChild(closeLink);

  container.appendChild(image);
  container.appendChild(formContainer);

  overlay.appendChild(container);
  document.body.appendChild(overlay);

  function validateEmail(email) {
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  if (isDebugMode()) {
    nameInput.value = "Thiago Morello";
    emailInput.value = "eu@thiagomorello.com.br";
    if (!disablePhoneField) {
      phoneInput.value = "(31) 99225-1502";
    }
    deleteCookie('mm_email');
    deleteCookie('mm_phone');
    deleteCookie('popup_closed');
  }

  submitButton.addEventListener('click', function() {
    var name = nameInput.value;
    var email = emailInput.value;
    var phone = disablePhoneField ? '' : phoneInput.value;
    var errors = [];

    if (!name) {
      errors.push('Nome Ã© obrigatÃ³rio.');
    }

    if (!email) {
      errors.push('Email Ã© obrigatÃ³rio.');
    } else if (!validateEmail(email)) {
      errors.push('Email invÃ¡lido.');
    }

    if (errors.length > 0) {
      errorMessage.innerHTML = errors.join('<br>');
      errorMessage.style.display = 'block';
      
      // Adiciona evento de erro de submit ao dataLayer
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "mm_modal",
        event_name: "submit_error"
      });
    } else {
      var mmTracker = getCookie('mm_tracker');
      var formData = JSON.stringify({ 
        name: name,
        email: email,
        phone: phone,
        mm_tracker: mmTracker,
        title_text: titleText,
        subtitle_text: subtitleText
      });

      console.log(formData);

      errorMessage.style.display = 'none';

      setCookie('mm_phone', btoa(name), 365);
      setCookie('mm_email', btoa(email), 365);
      
      if (!disablePhoneField) {
        setCookie('mm_phone', btoa(phone), 365);
      }

      fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gtm-Server-Preview': gtmPreviewCode
        },
        body: formData
      })
      .then(response => {
        if (response.ok) {
          console.log('Data sent successfully');

          var couponMessage = document.createElement('div');
          couponMessage.style.padding = '20px';
          couponMessage.style.textAlign = 'center';
          couponMessage.style.borderRadius = '5px';
          couponMessage.style.marginTop = '10px';
          couponMessage.style.backgroundColor = buttonBgColor;
          couponMessage.style.color = buttonColor;
          couponMessage.innerHTML = afterMessage;

          formContainer.innerHTML = '';
          formContainer.appendChild(couponMessage);
          closeLink.innerHTML = 'Fechar';
          closeLink.style.fontSize = '15px';
          closeLink.style.padding = '10px 0';
          formContainer.appendChild(closeLink);

          // Adiciona evento de submit com sucesso ao dataLayer
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: "mm_modal",
            event_name: "submit_success"
          });

        } else {
          console.error('Failed to send data');
        }
      })
      .catch(error => console.error('Error:', error));

    }

  });

}

// var img = 'https://cdn.shopify.com/s/files/1/0421/4764/3548/files/pop-up-coffee-mais.webp?v=1722346530';
// var title = 'VocÃª Ganhou Frete GrÃ¡tis na Sua Primeira Compra!';
// var subtitle = 'Preencha seus dados para liberarmos o cupom de desconto';
// var postUrl = 'https://gtm-ppnx52h-ytkzm.uc.r.appspot.com/?source=modal';
// var buttonText = 'Receber Meu Cupom';
// var closeText = 'NÃ£o quero desconto';
// var afterMessage = 'ParabÃ©ns! Utilize o cÃ³digo <strong>CROFRETEGRATIS</strong> para obter frete grÃ¡tis na sua primeira compra!';
// var gtmPreviewCode = 'ZW52LTl8bnQ0b3BXOEp2OW8taDh2Y2NLWUJ2Z3wxOTEwMmZhNGViODM2YzdkZmQ3OWI=';
// var closeDays = 7;
// var buttonColor = '#fff';
// var buttonBgColor = 'rgb(146 199 42)';
// var disablePhoneField = false;

// createPopup(img, title, subtitle, postUrl, buttonText, closeText, afterMessage, gtmPreviewCode, closeDays, buttonColor, buttonBgColor, disablePhoneField);
