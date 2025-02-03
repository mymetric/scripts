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

  // Disparado quando um usuário realiza uma busca no site
  analytics.subscribe('search_submitted', event => {
      let items = event.data.searchResult.productVariants.map(item => ({
        item_id: item.product.id.toString(),
        item_name: item.product.title || item.product.untranslatedTitle,
        price: parseFloat(item.price.amount) || 0,
        currency: item.price.currencyCode,
        quantity: 1,
        item_category: item.product.type || null,
      }));

      let searchData = {
        event: 'mymetric_view_search_results',
        search_term: event.data.searchResult.query,
        items: items || [],
        fired_from: 'custom_pixel'
      };

      sendToGA4('view_search_results', searchData);
      sendToMeta('Search', 'search_term: ' + event.data.searchResult.query);
  });


  // Disparado quando um usuário visualiza uma lista de produtos
  analytics.subscribe('collection_viewed', event => {
      let items = event.data.collection.productVariants.map(item => ({
        item_id: item.product.id.toString(),
        item_name: item.product.title || item.product.untranslatedTitle,
        price: parseFloat(item.price.amount) || 0,
        currency: item.price.currencyCode,
        quantity: 1,
        item_category: item.product.type || null,
      }));

      let collectionData = {
        event: 'mymetric_view_item_list',
        ecommerce: {
          item_list_name: event.data.collection.title,
          items: items || [],
        },
        fired_from: 'custom_pixel'
      };

      sendToGA4('view_item_list', collectionData.ecommerce);
  });

  // Disparado quando um usuário visualiza a página de um produto
  analytics.subscribe("product_viewed", event => {
      let items = [{
        item_id: event.data.productVariant.product.id.toString(),
        item_name: event.data.productVariant.product.title,
        price: parseFloat(event.data.productVariant.price.amount),
        currency: event.data.productVariant.price.currencyCode,
        quantity: 1,
        item_category: event.data.productVariant.product.type || null,
      }];

      let productData = {
        event: 'mymetric_view_item',
        ecommerce: {
          currency: event.data.productVariant.price.currencyCode,
          value: event.data.productVariant.price.amount,
          items: items || [],
        },
        fired_from: 'custom_pixel'
      };

      //window.dataLayer.push(productData);
      sendToGA4('view_item', productData.ecommerce);
      sendToMeta('ViewContent', productData.ecommerce);
  });


  // Disparado quando um produto é adicionado ao carrinho
  analytics.subscribe("product_added_to_cart", event => {
      let items = [{
        item_id: event.data.cartLine.merchandise.id.toString(),
        item_name: event.data.cartLine.merchandise.product.title || event.data.cartLine.merchandise.product.untranslatedTitle,
        price: parseFloat(event.data.cartLine.merchandise.price.amount),
        currency: event.data.cartLine.merchandise.price.currencyCode,
        quantity: event.data.cartLine.quantity,
        item_category: event.data.cartLine.merchandise.product.type || null,
      }];

      let cartData = {
        event: 'mymetric_add_to_cart',
        ecommerce: {
          currency: event.data.cartLine.cost.totalAmount.currencyCode,
          value: parseFloat(event.data.cartLine.cost.totalAmount.amount) || 0,
          items: items || [],
        },
        fired_from: 'custom_pixel'
      };

      sendToGA4('add_to_cart', cartData.ecommerce);
      sendToMeta('AddToCart', cartData.ecommerce);
  });

  // Disparado quando um produto é removido do carrinho
  analytics.subscribe("product_removed_from_cart", event => {
      let items = [{
        item_id: event.data.cartLine.merchandise.id.toString(),
        item_name: event.data.cartLine.merchandise.product.title || event.data.cartLine.merchandise.product.untranslatedTitle,
        price: parseFloat(event.data.cartLine.merchandise.price.amount),
        currency: event.data.cartLine.merchandise.price.currencyCode,
        quantity: event.data.cartLine.quantity,
        item_category: event.data.cartLine.merchandise.product.type || null,
      }];

      let removeCartData = {
        event: 'mymetric_remove_from_cart',
        ecommerce: {
          items: items || [],
        },
        fired_from: 'custom_pixel'
      };

      sendToGA4('remove_from_cart', removeCartData.ecommerce);
      sendToMeta('RemoveFromCart', removeCartData.ecommerce);
  });

  // Disparado quando o usuário visualiza a página do carrinho de compras
  analytics.subscribe('cart_viewed', event => {
      let items = event.data.cart.lines.map(item => ({
        item_id: item.merchandise.product.id.toString(),
        item_name: item.merchandise.product.title || item.merchandise.product.untranslatedTitle,
        price: parseFloat(item.merchandise.price.amount),
        currency: item.merchandise.price.currencyCode,
        quantity: parseInt(item.quantity) || 1,
        item_category: item.merchandise.product.type || null,
      }));

      let cartViewData = {
        event: 'mymetric_view_cart',
        ecommerce: {
          currency: event.data.cart.cost.totalAmount.currencyCode,
          value: parseFloat(event.data.cart.cost.totalAmount.amount) || 0,
          items: items || [],
        },
        fired_from: 'custom_pixel'
      };

      sendToGA4('view_cart', cartViewData.ecommerce);
  });

  // Disparado quando o usuário inicia o checkout
  analytics.subscribe('checkout_started', event => {
      let items = event.data.checkout.lineItems.map(item => ({
          item_id: item.variant.product.id.toString(),
          item_name: item.variant.product.title || item.merchandise.product.untranslatedTitle,
          price: parseFloat(item.variant.price.amount),
          currency: item.variant.price.currencyCode,
          quantity: parseInt(item.quantity) || 1,
          item_category: item.variant.product.type || null,
        }));
    
        let checkoutData = {
          event: 'mymetric_checkout_started',
          ecommerce: {
              currency: event.data.checkout.totalPrice.currencyCode,
              value: parseFloat(event.data.checkout.totalPrice.amount) || 0,
              items: items || [],
          },
          fired_from: 'custom_pixel'
        };

      sendToGA4('begin_checkout', checkoutData.ecommerce);
      sendToMeta('InitiateCheckout', checkoutData.ecommerce);
  });

  // Disparado quando o usuário informa os dados de entrega
  analytics.subscribe('checkout_shipping_info_submitted', event => {
        let items = event.data.checkout.lineItems.map(item => ({
            item_id: item.variant.product.id.toString(),
            item_name: item.variant.product.title || item.merchandise.product.untranslatedTitle,
            price: parseFloat(item.variant.price.amount),
            currency: item.variant.price.currencyCode,
            quantity: parseInt(item.quantity) || 1,
            item_category: item.variant.product.type || null,
          }));
      
          let checkoutData = {
            event: 'mymetric_checkout_shipping_info_submitted',
            ecommerce: {
                currency: event.data.checkout.totalPrice.currencyCode,
                value: parseFloat(event.data.checkout.totalPrice.amount) || 0,
                items: items || [],
            },
            fired_from: 'custom_pixel'
          };
    
        sendToGA4('add_shipping_info', checkoutData.ecommerce);
    });

  // Disparado quando o usuário informa os dados de pagamento
  analytics.subscribe('payment_info_submitted', event => {
        let items = event.data.checkout.lineItems.map(item => ({
            item_id: item.variant.product.id.toString(),
            item_name: item.variant.product.title || item.merchandise.product.untranslatedTitle,
            price: parseFloat(item.variant.price.amount),
            currency: item.variant.price.currencyCode,
            quantity: parseInt(item.quantity) || 1,
            item_category: item.variant.product.type || null,
          }));
      
          let checkoutData = {
            event: 'mymetric_payment_info_submitted',
            ecommerce: {
                currency: event.data.checkout.totalPrice.currencyCode,
                value: parseFloat(event.data.checkout.totalPrice.amount) || 0,
                items: items || [],
            },
            fired_from: 'custom_pixel'
          };
    
        sendToGA4('add_payment_info', checkoutData.ecommerce);
        sendToMeta('AddPaymentInfo', checkoutData.ecommerce);

    });  

  // Disparado quando o usuário conclui uma transação
  analytics.subscribe("checkout_completed", event => {
      let discountApplications = event.data.checkout.discountApplications;
      let titleCoupons = discountApplications.map(e => e.title).join(", ");

      let purchaseData = {
        event: 'mymetric_purchase',
        ecommerce: {
          currency: event.data.checkout.currencyCode,
          value: event.data.checkout.totalPrice.amount,
          coupon: titleCoupons || "",
          items: convertItems(event) || [],
          transaction_id: event.data.checkout.order.id,
          tax: parseFloat(event.data.checkout.totalTax.amount) || 0,
          shipping: parseFloat(event.data.checkout.shippingLine.price.amount) || 0
        },
        user_email: event.data.checkout.email,
        fired_from: 'custom_pixel',
      };

      sendToGA4('purchase', purchaseData.ecommerce);
      sendToMeta('Purchase', purchaseData.ecommerce);
  });

}
