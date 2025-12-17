function getCookie(name) {
  var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? JSON.parse(decodeURIComponent(match[2])) : [];
}

function setCookie(name, value, days) {
  days = days || 30;
  var date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = name + '=' + encodeURIComponent(JSON.stringify(value)) + '; expires=' + date.toUTCString() + '; path=/';
}

var i, len, detailEvent, productId;
if (window.dataLayer) {
  for (i = 0, len = window.dataLayer.length; i < len; i++) {
    detailEvent = window.dataLayer[i];
    if (detailEvent.ecommerce && detailEvent.ecommerce.detail) {
      productId = detailEvent.ecommerce.detail.products && detailEvent.ecommerce.detail.products[0] && detailEvent.ecommerce.detail.products[0].id;
      if (productId) break;
    }
  }
}

if (productId) {
  var viewed = getCookie('mm_recently_viewed');
  var newViewed = [];
  var found = false;
  var j;
  
  for (j = 0; j < viewed.length; j++) {
    if (viewed[j] === productId) {
      found = true;
    } else {
      newViewed.push(viewed[j]);
    }
  }
  
  newViewed.unshift(productId);
  
  if (newViewed.length > 10) {
    newViewed = newViewed.slice(0, 10);
  }
  
  setCookie('mm_recently_viewed', newViewed);
}
