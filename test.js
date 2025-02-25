
function mymetric_log(content) {
    var mmBadge = 'MyMetric Pixel for Shopify';
    var style1 = "background: #F87666; color: white; padding: 1px 3px; border-radius: 1px; margin-right: 10px;";
    var style2 = "color: white; font-weight: bold;";
    console.log(`%c${mmBadge}%c${content}`, style1, style2);
}
