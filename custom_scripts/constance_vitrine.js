function montarVitrine() {
  console.log("[Vitrine] Iniciando carregamento do catálogo...");

  let mm_track, mm_itemWidth, mm_itemsPerPage, mm_totalPages, mm_currentPage, mm_dots, mm_prevBtn, mm_nextBtn;

  fetch("https://storage.googleapis.com/constance-json/catalogo_filtrado.json")
    .then(res => {
      console.log("[Vitrine] Fetch response status:", res.status);
      if (!res.ok) {
        throw new Error(`Failed to fetch catalog: ${res.statusText}`);
      }
      return res.json();
    })
    .then(mm_rawData => {
      console.log("[Vitrine] Raw data received:", mm_rawData);
      const mm_produtos = mm_rawData.map(p => {
        if (!p.idProduto || !p.name || !p.images?.bigimage) {
          console.warn("[Vitrine] Produto inválido:", p);
          return null;
        }
        return {
          idProduto: p.idProduto[0] || "",
          name: p.name[0] || "Produto sem nome",
          id: p.id[0] || "",
          description: p.description[0] || "",
          categoryid1: p.categoryid1[0] || "",
          categoryid2: p.categoryid2[0] || "",
          producturl: p.producturl[0] || "#",
          images: { bigimage: p.images.bigimage[0] || "" },
          price: p.price[0] || "0,00",
          retailprice: p.retailprice[0] || "0,00",
          price_original: p.price_original[0] || "0,00",
          sale_price: p.sale_price[0] || "0,00",
          pgmt: p.pgmt[0] || "",
          instock: p.instock[0] || false
        };
      }).filter(p => p !== null);

      console.log("[Vitrine] Produtos normalizados:", mm_produtos);
      if (mm_produtos.length === 0) {
        console.error("[Vitrine] Nenhum produto válido encontrado!");
        return;
      }
      mm_inserirVitrineAntesDoElemento(mm_produtos);
    })
    .catch(err => {
      console.error("[Vitrine] Erro ao carregar catálogo:", err);
    });

  function mm_updateSlider() {
    console.log("[Vitrine] mm_track:", mm_track);
    console.log("[Vitrine] mm_prevBtn:", mm_prevBtn);
    console.log("[Vitrine] mm_nextBtn:", mm_nextBtn);
    console.log("[Vitrine] mm_dots:", mm_dots);
    if (!mm_track || !mm_prevBtn || !mm_nextBtn || !mm_dots) {
      console.error("[Vitrine] One or more DOM elements are missing!");
      return;
    }

    console.log("[Vitrine] mm_currentPage:", mm_currentPage);
    console.log("[Vitrine] mm_itemsPerPage:", mm_itemsPerPage);
    console.log("[Vitrine] mm_itemWidth:", mm_itemWidth);
    const mm_offset = -mm_currentPage * mm_itemsPerPage * mm_itemWidth;
    console.log("[Vitrine] Atualizando slider, página atual:", mm_currentPage, "Offset:", mm_offset);
    mm_track.style.transform = `translateX(${mm_offset}px)`;
    console.log("[Vitrine] Transform applied:", mm_track.style.transform);

    mm_prevBtn.disabled = mm_currentPage === 0;
    mm_nextBtn.disabled = mm_currentPage >= mm_totalPages - 1;

    const mm_allDots = mm_dots.querySelectorAll(".vitrine-dot");
    console.log("[Vitrine] Dots found:", mm_allDots.length);
    mm_allDots.forEach((dot, index) => {
      dot.className = "vitrine-dot" + (index === mm_currentPage ? " active" : "");
    });
  }

  function mm_aguardarRenderizacao(callback) {
    let tentativas = 0;
    function verificar() {
      const mm_items = mm_track?.children || [];
      console.log("[Vitrine] Tentativa", tentativas, "Items:", mm_items.length);
      const largura = mm_items.length ? mm_items[0].offsetWidth : 0;

      if (largura > 0) {
        console.log("[Vitrine] Render detectado, largura do item:", largura);
        callback();
      } else {
        tentativas++;
        if (tentativas > 200) {
          console.warn("[Vitrine] Timeout aguardando renderização dos itens.");
          return;
        }
        requestAnimationFrame(verificar);
      }
    }
    verificar();
  }

  function mm_inserirVitrineAntesDoElemento(mm_produtos) {
    console.log("[Vitrine] Inserindo vitrine com", mm_produtos.length, "produtos");

    const mm_style = document.createElement("style");
    mm_style.innerHTML = `
      .vitrine-mymetric {
        max-width: 1000px;
        margin: 40px auto;
        padding: 0 16px;
        font-family: "Segoe UI", Roboto, sans-serif;
        color: #333;
        position: relative;
      }
      .vitrine-mymetric h2 {
        font-size: 1.6rem;
        font-weight: 600;
        margin-bottom: 24px;
        text-align: center;
        color: #1a1a1a;
      }
      .vitrine-slider {
        overflow: hidden;
        position: relative;
        width: 100%;
      }
      .vitrine-track {
        display: flex;
        transition: transform 0.4s ease;
        will-change: transform;
      }
      .vitrine-item {
        display: block;
        flex: 0 0 auto;
        width: 230px;
        margin: 0 10px;
        border-radius: 12px;
        background: #fff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        padding: 16px;
        text-align: center;
        text-decoration: none;
        color: inherit;
      }
      .vitrine-item:hover {
        transform: translateY(-6px);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
      }
      .vitrine-item img {
        max-width: 100%;
        max-height: 210px;
        object-fit: contain;
        margin-bottom: 12px;
        border-radius: 6px;
      }
      .vitrine-item h3 {
        font-size: 0.95rem;
        font-weight: 500;
        margin: 6px 0 8px;
        height: 2.6em;
        line-height: 1.3;
        overflow: hidden;
      }
      .vitrine-item .preco-original {
        font-size: 0.9rem;
        color: #777;
        text-decoration: line-through;
        margin-bottom: 2px;
      }
      .vitrine-item .preco {
        font-size: 1.15rem;
        font-weight: 700;
        color: #cc0000;
        margin-bottom: 4px;
      }
      .vitrine-item .parcela {
        font-size: 0.8rem;
        color: #777;
      }
      .vitrine-nav {
        display: flex;
        justify-content: space-between;
        position: absolute;
        top: 50%;
        width: 100%;
        transform: translateY(-50%);
        z-index: 10;
        padding: 0 8px;
      }
      .vitrine-nav button {
        background: #00000088;
        color: #fff;
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        font-size: 1.2rem;
        cursor: pointer;
        transition: background 0.3s ease;
      }
      .vitrine-nav button:hover {
        background: #000000cc;
      }
      .vitrine-nav button:disabled {
        background: #cccccc55;
        cursor: not-allowed;
      }
      .vitrine-dots {
        display: flex;
        justify-content: center;
        margin-top: 16px;
      }
      .vitrine-dot {
        width: 10px;
        height: 10px;
        background: #ccc;
        border-radius: 50%;
        margin: 0 6px;
        cursor: pointer;
        transition: background 0.2s ease;
      }
      .vitrine-dot.active {
        background: #1a1a1a;
      }
      .vitrine-item-container {
        position: relative;
      }
      .vitrine-item .desconto-label {
        position: absolute;
        top: 8px;
        left: 8px;
        background: #e60000;
        color: #fff;
        padding: 2px 6px;
        font-size: 0.7rem;
        font-weight: 600;
        border-radius: 3px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .vitrine-item .outlet-tag {
        background: #fff;
        color: #e60000;
        font-size: 0.6rem;
        padding: 0 4px;
        border-radius: 2px;
        font-weight: bold;
        text-transform: uppercase;
      }
      @media (max-width: 768px) {
        .vitrine-slider {
          overflow: visible;
          padding: 0 16px;
        }
        .vitrine-track {
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 12px;
          margin: 0 -16px;
        }
        .vitrine-item {
          scroll-snap-align: center;
          width: 88vw;
          max-width: 320px;
          margin: 0 auto;
        }
        .vitrine-nav,
        .vitrine-dots {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(mm_style);

    const mm_container = document.createElement("div");
    mm_container.className = "vitrine-mymetric";
    mm_container.innerHTML = `
      <h2>best sellers</h2>
      <div class="vitrine-slider">
        <div class="vitrine-track"></div>
        <div class="vitrine-nav">
          <button class="prev">←</button>
          <button class="next">→</button>
        </div>
      </div>
      <div class="vitrine-dots"></div>
    `;

    mm_track = mm_container.querySelector(".vitrine-track");
    console.log("[Vitrine] mm_track initialized:", mm_track);

    mm_produtos.forEach(produto => {
      const precoOriginal = parseFloat(produto.price_original.replace(/[^\d,]/g, "").replace(",", "."));
      const preco = parseFloat(produto.price.replace(/[^\d,]/g, "").replace(",", "."));
      const desconto = precoOriginal > preco ? Math.round(((precoOriginal - preco) / precoOriginal) * 100) : null;

      const item = document.createElement("a");
      item.className = "vitrine-item";
      item.href = produto.producturl;

      item.innerHTML = `
        <div class="vitrine-item-container">
          ${desconto ? `<div class="desconto-label">-${desconto}% <span class="outlet-tag">OUTLET</span></div>` : ""}
          <img src="${produto.images.bigimage}" alt="${produto.name}" />
          <h3>${produto.name}</h3>
          <div class="preco-original">${produto.price_original}</div>
          <div class="preco">${produto.price}</div>
          <div class="parcela">${produto.pgmt}</div>
        </div>
      `;
      mm_track.appendChild(item);
    });

    const mm_alvo = document.querySelector(".vtex-render__container-id-home2 .vtex-rich-text-0-x-container--home-title-carrousel");
    console.log("[Vitrine] Target element (mm_alvo):", mm_alvo);
    if (mm_alvo?.parentNode) {
      mm_alvo.parentNode.insertBefore(mm_container, mm_alvo);
      console.log("[Vitrine] Vitrine inserida antes do elemento alvo.");
    } else {
      //document.body.appendChild(mm_container);
      console.warn("[Vitrine] Elemento alvo não encontrado, vitrine adicionada ao body.");
    }

    console.log("[Vitrine] Window width:", window.innerWidth);
    if (window.innerWidth > 768) {
      mm_aguardarRenderizacao(() => {
        console.log("[Vitrine] Render detectado, iniciando slider.");

        mm_itemWidth = mm_track.children[0]?.offsetWidth + 20 || 250; // Fallback width
        console.log("[Vitrine] mm_itemWidth:", mm_itemWidth);
        const mm_visibleWidth = mm_container.querySelector(".vitrine-slider").offsetWidth;
        console.log("[Vitrine] mm_visibleWidth:", mm_visibleWidth);
        mm_itemsPerPage = Math.floor(mm_visibleWidth / mm_itemWidth);
        console.log("[Vitrine] mm_itemsPerPage:", mm_itemsPerPage);
        mm_totalPages = Math.ceil(mm_track.children.length / mm_itemsPerPage);
        console.log("[Vitrine] mm_totalPages:", mm_totalPages);
        mm_currentPage = 0;
        mm_dots = mm_container.querySelector(".vitrine-dots");
        mm_prevBtn = mm_container.querySelector(".prev");
        mm_nextBtn = mm_container.querySelector(".next");

        console.log("[Vitrine] mm_dots:", mm_dots);
        console.log("[Vitrine] mm_prevBtn:", mm_prevBtn);
        console.log("[Vitrine] mm_nextBtn:", mm_nextBtn);

        mm_prevBtn.onclick = () => {
          console.log("[Vitrine] Previous button clicked, currentPage:", mm_currentPage);
          if (mm_currentPage > 0) {
            mm_currentPage--;
            mm_updateSlider();
          }
        };

        mm_nextBtn.onclick = () => {
          console.log("[Vitrine] Next button clicked, currentPage:", mm_currentPage);
          if (mm_currentPage < mm_totalPages - 1) {
            mm_currentPage++;
            mm_updateSlider();
          }
        };

        for (let p = 0; p < mm_totalPages; p++) {
          const mm_dot = document.createElement("div");
          mm_dot.className = "vitrine-dot" + (p === 0 ? " active" : "");
          mm_dot.onclick = () => {
            console.log("[Vitrine] Dot clicked, navigating to page:", p);
            mm_currentPage = p;
            mm_updateSlider();
          };
          mm_dots.appendChild(mm_dot);
        }

        mm_updateSlider();
      });
    } else {
      console.log("[Vitrine] Mobile view detected, skipping slider initialization.");
    }
  }
}
