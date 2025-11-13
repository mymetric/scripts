// Flags independentes
let hasTriggeredError = false;
let hasTriggeredSuccess = false;

// Função para extrair código de erro
function extractCouponFromError() {
  const elements = document.querySelectorAll('span.vtex-front-messages-detail');
  if (elements.length === 0) return null;
  
  for (let element of elements) {
    const text = element.textContent.trim();
    // console.log(`[DEBUG ERRO] Texto: "${text}"`); // Descomente se precisar
    
    const match = text.match(/cupom\s+([^\s]+)/i);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// Função para extrair código de sucesso
function extractCouponFromSuccess() {
  const infoSpan = document.querySelector('.coupon-form .info');
  if (!infoSpan) return null;
  
  const computedStyle = getComputedStyle(infoSpan);
  if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
    // console.log(`[DEBUG SUCESSO] .info não visível: display=${computedStyle.display}`); // Descomente
    return null;
  }
  
  const codeSpan = infoSpan.querySelector('span');
  if (codeSpan && codeSpan.textContent.trim()) {
    const couponCode = codeSpan.textContent.trim();
    // console.log(`[DEBUG SUCESSO] Aplicado: "${couponCode}" (display=${computedStyle.display})`); // Descomente
    return couponCode;
  }
  
  return null;
}

// Função para push no dataLayer (evento unificado: coupon_added)
function pushDataLayer(couponCode, status, extra = {}) {
  if (typeof dataLayer !== 'undefined') {
    dataLayer.push({
      'event': 'coupon_added',
      'status': status,
      'coupon_code': couponCode,
      ...extra
    });
    console.log(`[SUCESSO] DataLayer: coupon_added com status "${status}" e código "${couponCode}"`);
  } else {
    console.warn('dataLayer não encontrado. Adicione window.dataLayer = [];');
  }
}

// Observador único e amplo para ambos (childList + attributes no body)
const observer = new MutationObserver(function(mutations) {
  let hasRelevantChange = false;
  
  mutations.forEach(function(mutation) {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      hasRelevantChange = true; // Qualquer adição pode ser erro ou sucesso
    } else if (mutation.type === 'attributes') {
      const target = mutation.target;
      if (target.classList && (target.classList.contains('info') || target.matches('.vtex-front-messages-detail'))) {
        hasRelevantChange = true; // Mudança em visibilidade/estilo
      }
    }
  });
  
  if (hasRelevantChange) {
    // Checa ERRO
    const errorCode = extractCouponFromError();
    if (!hasTriggeredError && errorCode) {
      hasTriggeredError = true;
      const errorText = document.querySelector('span.vtex-front-messages-detail')?.textContent.toLowerCase() || '';
      const errorType = errorText.includes('inválido') ? 'inválido' : (errorText.includes('expirado') ? 'expirado' : 'outro');
      pushDataLayer(errorCode, 'error', { error_type: errorType });
      // observer.disconnect(); // Descomente para parar após erro
    }
    
    // Checa SUCESSO
    const successCode = extractCouponFromSuccess();
    if (!hasTriggeredSuccess && successCode) {
      hasTriggeredSuccess = true;
      pushDataLayer(successCode, 'success');
      // observer.disconnect(); // Descomente para parar após sucesso
    }
  }
});

// Iniciar observador
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['style', 'class']
});

// Verificação inicial para ambos
function initialCheck() {
  // Erro
  const initialError = extractCouponFromError();
  if (!hasTriggeredError && initialError) {
    hasTriggeredError = true;
    const errorText = document.querySelector('span.vtex-front-messages-detail')?.textContent.toLowerCase() || '';
    const errorType = errorText.includes('inválido') ? 'inválido' : (errorText.includes('expirado') ? 'expirado' : 'outro');
    pushDataLayer(initialError, 'error', { error_type: errorType });
  }
  
  // Sucesso
  const initialSuccess = extractCouponFromSuccess();
  if (!hasTriggeredSuccess && initialSuccess) {
    hasTriggeredSuccess = true;
    pushDataLayer(initialSuccess, 'success');
  }
  
  if (!initialError && !initialSuccess) {
    // console.log('[DEBUG] Nada detectado na inicial.'); // Descomente
  }
}

initialCheck(); // Agora
setTimeout(initialCheck, 1000); // +1s

console.log('[INFO] Monitor unificado iniciado (coupon_added com status success/error). Teste um cupom!');
