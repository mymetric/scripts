function mymetric_tracker(domain) {
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length === 2) return parts.pop().split(";").shift();
    }

    function set_cookie(name, value, days, domain) {
        var expires = "";
        if (days) {
            var date = new Date(); 
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; domain=." + domain + "; path=/";
    }

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    var cookies = {
        client_id: "{{gtagApiResult.client_id}}",
        session_id: "{{gtagApiResult.session_id}}",
        fbp: getCookie("_fbp"),
        fbc: getCookie("_fbc"),
        gclid: getCookie("_gcl_aw"),
        ua: btoa(navigator.userAgent) // Encode the user agent
    };

    var cookiesJson = JSON.stringify(cookies);

    // Set cookie
    set_cookie("mm_tracker", cookiesJson, 365, domain);  

    // Send to Shopify via Ajax
    function updateCart() {
      var data = {
        attributes: {
          mm_tracker: getCookie("mm_tracker")
        }
      };
    
    fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(function(response) {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(function(data) {
          console.log('Cart updated successfully:', data);
        })
        .catch(function(error) {
          console.error('There was a problem with the fetch operation:', error);
        });
    }

    // Call the function
    updateCart();
    console.log("====================");
}