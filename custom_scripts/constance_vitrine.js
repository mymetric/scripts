function montarVitrine() {

  console.log("[Vitrine] Iniciando carregamento do catálogo...");
  
  // Define variables in a shared scope
  let track, itemWidth, itemsPerPage, totalPages, currentPage, dots, prevBtn, nextBtn;
  
  fetch("https://storage.googleapis.com/constance-json/catalogo_filtrado.json")
    .then(res => res.json())
    .then(rawData => {
      const produtosNormalizados = rawData.map(p => ({
        idProduto: p.idProduto[0],
        name: p.name[0],
        id: p.id[0],
        description: p.description[0],
        categoryid1: p.categoryid1[0],
        categoryid2: p.categoryid2[0],
        producturl: p.producturl[0],
        images: { bigimage: p.images.bigimage[0] },
        price: p.price[0],
        retailprice: p.retailprice[0],
        price_original: p.price_original[0],
        sale_price: p.sale_price[0],
        pgmt: p.pgmt[0],
        instock: p.instock[0]
      }));
  
      console.log("[Vitrine] Produtos normalizados:", produtosNormalizados);
      inserirVitrineAntesDoElemento(produtosNormalizados);
    })
    .catch(err => {
      console.error("[Vitrine] Erro ao carregar catálogo:", err);
    });
  
  function updateSlider() {
    var offset = -currentPage * itemsPerPage * itemWidth;
    console.log("[Vitrine] Atualizando slider, página atual:", currentPage, "Offset:", offset);
    track.style.transform = "translateX(" + offset + "px)";
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage >= totalPages - 1;
  
    var allDots = dots.querySelectorAll(".vitrine-dot");
    for (var d = 0; d < allDots.length; d++) {
      allDots[d].className = "vitrine-dot" + (d === currentPage ? " active" : "");
    }
  }
  
  function inserirVitrineAntesDoElemento(produtos) {
    console.log("[Vitrine] Inserindo vitrine com", produtos.length, "produtos");
  
    var style = document.createElement("style");
    style.innerHTML = `
    .vitrine-mymetric{max-width:1000px;margin:40px auto;padding:0 16px;font-family:"Segoe UI",Roboto,sans-serif;color:#333;position:relative;}
    .vitrine-mymetric h2{font-size:1.6rem;font-weight:600;margin-bottom:24px;text-align:center;color:#1a1a1a;}
    .vitrine-slider{overflow:hidden;position:relative;width:100%;}
    .vitrine-track{display:flex;transition:transform 0.4s ease;will-change:transform;}
    .vitrine-item{display:block;flex:0 0 auto;width:230px;margin:0 10px;border-radius:12px;background:#fff;box-shadow:0 4px 12px rgba(0,0,0,0.05);transition:transform 0.2s ease,box-shadow 0.2s ease;padding:16px;text-align:center;text-decoration:none;color:inherit;}
    .vitrine-item:hover{transform:translateY(-6px);box-shadow:0 6px 18px rgba(0,0,0,0.1);}
    .vitrine-item img{max-width:100%;max-height:210px;object-fit:contain;margin-bottom:12px;border-radius:6px;}
    .vitrine-item h3{font-size:0.95rem;font-weight:500;margin:6px 0 8px;height:2.6em;line-height:1.3;overflow:hidden;}
    .vitrine-item .preco-original{font-size:0.9rem;color:#777;text-decoration:line-through;margin-bottom:2px;}
    .vitrine-item .preco{font-size:1.15rem;font-weight:700;color:#cc0000;margin-bottom:4px;}
    .vitrine-item .parcela{font-size:0.8rem;color:#777;}
    .vitrine-nav{display:flex;justify-content:space-between;position:absolute;top:50%;width:100%;transform:translateY(-50%);z-index:10;padding:0 8px;}
    .vitrine-nav button{background:#00000088;color:#fff;border:none;width:36px;height:36px;border-radius:50%;font-size:1.2rem;cursor:pointer;transition:background 0.3s ease;}
    .vitrine-nav button:hover{background:#000000cc;}
    .vitrine-nav button:disabled{background:#cccccc55;cursor:not-allowed;}
    .vitrine-dots{display:flex;justify-content:center;margin-top:16px;}
    .vitrine-dot{width:10px;height:10px;background:#ccc;border-radius:50%;margin:0 6px;cursor:pointer;transition:background 0.2s ease;}
    .vitrine-dot.active{background:#1a1a1a;}
    .vitrine-item-container{position:relative;}
    .vitrine-item .desconto-label{position:absolute;top:8px;left:8px;background:#e60000;color:#fff;padding:2px 6px;font-size:0.7rem;font-weight:600;border-radius:3px;display:flex;align-items:center;gap:4px;}
    .vitrine-item .outlet-tag{background:#fff;color:#e60000;font-size:0.6rem;padding:0 4px;border-radius:2px;font-weight:bold;text-transform:uppercase;}
    @media(max-width:768px){
      .vitrine-slider{overflow:visible;padding:0 16px;}
      .vitrine-track{overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding-bottom:12px;margin:0 -16px;}
      .vitrine-item{scroll-snap-align:center;width:88vw;max-width:320px;margin:0 auto;}
      .vitrine-nav,.vitrine-dots{display:none!important;}
    }
    `;
    document.head.appendChild(style);
  
    var container = document.createElement("div");
    container.className = "vitrine-mymetric";
    container.innerHTML =
      '<h2>best sellers</h2>' +
      '<div class="vitrine-slider">' +
        '<div class="vitrine-track"></div>' +
        '<div class="vitrine-nav">' +
          '<button class="prev">←</button>' +
          '<button class="next">→</button>' +
        '</div>' +
      '</div>' +
      '<div class="vitrine-dots"></div>';
  
    track = container.querySelector(".vitrine-track");
  
    for (var k = 0; k < produtos.length; k++) {
      var produto = produtos[k];
      console.log(`[Vitrine] Criando item: ${produto.name} (ID: ${produto.idProduto})`);
  
      var precoOriginal = parseFloat(produto.price_original.replace(/[^\d,]/g, "").replace(",", "."));
      var preco = parseFloat(produto.price.replace(/[^\d,]/g, "").replace(",", "."));
      var desconto = precoOriginal > preco ? Math.round(((precoOriginal - preco) / precoOriginal) * 100) : null;
  
      var item = document.createElement("a");
      item.className = "vitrine-item";
      item.href = produto.producturl;
  
      var html = '<div class="vitrine-item-container">';
      if (desconto) {
        html += '<div class="desconto-label">-' + desconto + '% <span class="outlet-tag">OUTLET</span></div>';
      }
      html +=
        '<img src="' + produto.images.bigimage + '" alt="' + produto.name + '" />' +
        '<h3>' + produto.name + '</h3>' +
        '<div class="preco-original">' + produto.price_original + '</div>' +
        '<div class="preco">' + produto.price + '</div>' +
        '<div class="parcela">' + produto.pgmt + '</div>' +
        '</div>';
  
      item.innerHTML = html;
      track.appendChild(item);
    }
  
    var alvo = document.querySelector(".vtex-render__container-id-home2 .vtex-rich-text-0-x-container--home-title-carrousel");
    if (alvo && alvo.parentNode) {
      alvo.parentNode.insertBefore(container, alvo);
    } else {
      document.body.appendChild(container);
    }
  
    // Slider Desktop - aguarda render
    if (window.innerWidth > 768) {
      const MAX_ATTEMPTS = 20;
      let attempts = 0;
  
      const waitForRender = setInterval(() => {
        const items = track.children;
  
        if (!items.length || !items[0].offsetWidth) {
          attempts++;
          if (attempts >= MAX_ATTEMPTS) {
            clearInterval(waitForRender);
            console.warn("[Vitrine] Timeout aguardando renderização dos itens.");
          }
          return;
        }
  
        clearInterval(waitForRender);
        console.log("[Vitrine] Render detectado, iniciando slider.");
  
        itemWidth = items[0].offsetWidth + 20;
        var visibleWidth = container.querySelector(".vitrine-slider").offsetWidth;
        itemsPerPage = Math.floor(visibleWidth / itemWidth);
        totalPages = Math.ceil(items.length / itemsPerPage);
        currentPage = 0;
        dots = container.querySelector(".vitrine-dots");
        prevBtn = container.querySelector(".prev");
        nextBtn = container.querySelector(".next");
  
        console.log(`[Vitrine] Total de páginas: ${totalPages}, Itens por página: ${itemsPerPage}`);
  
        prevBtn.onclick = function () {
          if (currentPage > 0) {
            currentPage--;
            updateSlider();
          }
        };
  
        nextBtn.onclick = function () {
          if (currentPage < totalPages - 1) {
            currentPage++;
            updateSlider();
          }
        };
  
        for (var p = 0; p < totalPages; p++) {
          var dot = document.createElement("div");
          dot.className = "vitrine-dot" + (p === 0 ? " active" : "");
          (function (index) {
            dot.onclick = function () {
              currentPage = index;
              updateSlider();
            };
          })(p);
          dots.appendChild(dot);
        }
  
        updateSlider();
      }, 100);
    }
  }

}
