function mmShopifyPixel(gtm_id, ga_id, meta_id) {

    // Função para log estilizado no console
    function MMConsoleLog(content) {
        var mmBadge = 'MM Shopify Pixel';
        var style1 = "background: #8430ce; color: white; padding: 1px 3px; border-radius: 1px; margin-right: 10px;";
        var style2 = "color: white; font-weight: bold;";
        console.log(`%c${mmBadge}%c${content}`, style1, style2);
    }
  
    MMConsoleLog('Pixel Loaded');
  
    // Função para carregar o Meta Pixel
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', meta_id);
    fbq('track', 'PageView');
  
    // Função para carregar o GTM
    (function(w,d,s,l,i){
      w[l]=w[l]||[];
      w[l].push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
      var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),
          dl=l!='dataLayer'?'&l='+l:'';
      j.async=true;
      j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
      f.parentNode.insertBefore(j,f);
    })(window, document, 'script', 'dataLayer', gtm_id);
  
  
    // Função para garantir que o GA4 esteja carregado
    function waitForGA4(callback, timeout = 5000) {
        const start = Date.now();
        const interval = setInterval(() => {
            if (typeof gtag === 'function') {
                MMConsoleLog('GA4 carregado.');          
                clearInterval(interval);
                callback();
            } else if (Date.now() - start > timeout) {
                clearInterval(interval);
                MMConsoleLog('GA4 não carregado no tempo limite.');
            }
        }, 100);
    }
  
    // Função para disparar eventos do GA4
    function sendToGA4(eventName, data) {
      data.send_to = ga_id;
      data.debug_mode = true;
  
      MMConsoleLog('GA4 Event | ' + ga_id + ' | ' + eventName);
      console.log(data);
      
      waitForGA4(() => {
        gtag('event', eventName, data);
      });
    }
  
    // Função para disparar eventos no Meta (Facebook)
    function sendToMeta(eventName, data) {
        const metaData = typeof data === 'object' ? {
            content_type: 'product',
            contents: data.items.map(item => ({
                id: item.item_id,
                quantity: item.quantity
            })),
            currency: 'BRL',
            value: data.value || 0,
            content_name: data.items[0]?.item_name,
            content_category: data.items[0]?.item_category
        } : data;
  
        MMConsoleLog('Meta Event | ' + meta_id + ' | ' + eventName);
        console.log(metaData);
  
        fbq('track', eventName, metaData);
    }
  
  
    // Função para aguardar o carregamento do dataLayer
    function waitForDataLayer(callback) {
      if (window.dataLayer) {
        MMConsoleLog('dataLayer carregado.');              
        callback();
      } else {        
        setTimeout(() => waitForDataLayer(callback), 1000);
      }
    }
  
    function convertItems(event) {
      return (event.data?.checkout?.lineItems || []).map(item => ({
        item_id: item.product?.id?.toString() || '',
        item_name: item.product?.title || item.product?.untranslatedTitle || 'Unknown',
        price: parseFloat(item.price?.amount) || 0,
        currency: item.price?.currencyCode || 'Unknown',
        quantity: parseInt(item.quantity) || 1,
        item_category: item.product?.type || 'Unknown',
      }));
    }
    
}
