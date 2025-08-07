window.dataLayer = window.dataLayer || [];
mymetric_log('🔵 [INIT] DataLayer initialized: ', window.dataLayer);

function gtag() {
    mymetric_log('🔵 [GTAG] Function called with arguments: ', Array.from(arguments));
    window.dataLayer.push(arguments);
    mymetric_log('🔵 [GTAG] DataLayer after push: ', window.dataLayer);
}

mymetric_log('🔵 [CHECK] Verifying ga_id existence and value');
if (typeof ga_id !== 'undefined' && ga_id) {
    mymetric_log('🟢 [CHECK] ga_id is defined: ' + ga_id);
    mymetric_log('🔵 [ENV] Checking document.head availability: ', !!document.head);
    
    try {
        var mmGtagScript = document.createElement('script');
        mmGtagScript.async = true;
        mmGtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + ga_id;
        mymetric_log('🟢 [SCRIPT] Script element created with src: ' + mmGtagScript.src);
        mymetric_log('🔵 [SCRIPT] Script async attribute set: ' + mmGtagScript.async);
        
        document.head.appendChild(mmGtagScript);
        mymetric_log('🟢 [SCRIPT] Script successfully appended to document.head');
        
        mmGtagScript.onload = function() {
            mymetric_log('🟢 [SCRIPT] Google Tag script loaded successfully');
            mymetric_log('🔵 [ENV] Current window.location.href: ' + window.location.href);
            
            // Limpar a URL
            const url = window.location.href;
            mymetric_log('🔵 [URL] Original URL: ' + url);
            const regex = /wpm@[^/]+\/custom\/web-pixel-[^/]+@[^/]+\/sandbox\/modern\//;
            const cleanedUrl = url.replace(regex, '');
            mymetric_log('🟢 [URL] Cleaned URL: ' + cleanedUrl);
            
            try {
                mymetric_log('🔵 [GTAG] Sending js event with timestamp: ' + new Date().toISOString());
                gtag('js', new Date());
                
                const pagePath = new URL(cleanedUrl).pathname;
                const pageTitle = document.title || 'Iframe Content';
                mymetric_log('🔵 [CONFIG] Page path extracted: ' + pagePath);
                mymetric_log('🔵 [CONFIG] Page title determined: ' + pageTitle);
                mymetric_log('🔵 [CONFIG] Preparing GA4 config with ga_id: ' + ga_id);
                
                gtag('config', ga_id, {
                    send_page_view: true,
                    page_location: cleanedUrl,
                    page_path: pagePath,
                    page_title: pageTitle
                });
                mymetric_log('🟢 [CONFIG] GA4 configured with cleaned URL: ' + cleanedUrl);
                mymetric_log('🔵 [CONFIG] Config object sent: ', {
                    send_page_view: true,
                    page_location: cleanedUrl,
                    page_path: pagePath,
                    page_title: pageTitle
                });
            } catch (error) {
                mymetric_log('🔴 [CONFIG] Error during GA4 configuration: ' + error.message);
                mymetric_log('🔴 [CONFIG] Error stack: ' + error.stack);
            }
        };
        
        mmGtagScript.onerror = function(error) {
            mymetric_log('🔴 [SCRIPT] Failed to load Google Tag script: ' + error.type);
            mymetric_log('🔴 [SCRIPT] Error details: ', error);
        };
    } catch (error) {
        mymetric_log('🔴 [SCRIPT] Error appending script to document.head: ' + error.message);
        mymetric_log('🔴 [SCRIPT] Error stack: ' + error.stack);
    }
} else {
    mymetric_log('🔴 [CHECK] ga_id is undefined or falsy');
    mymetric_log('🔵 [CHECK] typeof ga_id: ' + typeof ga_id);
    mymetric_log('🔵 [CHECK] ga_id value: ' + ga_id);
}
