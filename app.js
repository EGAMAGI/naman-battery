const SHEET_URL =
  "https://opensheet.elk.sh/1QZ9mV6Zd1G5tRCPl0OnFpKXIwNSS9FVRF0C41BUarpA/Sheet1";

let products = [];
let filteredProducts = [];

document.addEventListener("DOMContentLoaded", () => {
  // Initialize filter functionality
  initializeFilters();
  
  // Add search bar
  const searchBar = document.createElement("input");
  searchBar.type = "text";
  searchBar.placeholder = "Search products...";
  searchBar.className = "product-search";
  searchBar.style = "margin:16px 0;padding:8px;width:100%;max-width:400px;display:block;";
  document.body.insertBefore(searchBar, document.body.firstChild);

  searchBar.addEventListener("input", e => {
    const query = e.target.value.trim().toLowerCase();
    filteredProducts = products.filter(p =>
      (p.name_en || "").toLowerCase().includes(query) ||
      (p.brand || "").toLowerCase().includes(query)
    );
    renderProducts(filteredProducts);
  });

  fetch(SHEET_URL)
    .then(r => r.json())
    .then(data => {
      products = data;
      filteredProducts = data;
      renderProducts(products);
    })
    .catch(() => {
      const grid = document.querySelector(".products-grid");
      if (grid) grid.innerHTML = "<p>Failed to load products.</p>";
    });
});

// Initialize product filter functionality
function initializeFilters() {
  const searchInput = document.getElementById('searchInput');
  const brandFilter = document.getElementById('brandFilter');
  const priceFilter = document.getElementById('priceFilter');
  const productsGrid = document.getElementById('productsGrid');
  
  if (!searchInput || !brandFilter || !priceFilter || !productsGrid) return;
  
  const productCards = productsGrid.querySelectorAll('.product-card');

  function filterProducts() {
    const search = searchInput.value.toLowerCase();
    const brand = brandFilter.value;
    const price = priceFilter.value;

    productCards.forEach(card => {
      const cardBrand = card.getAttribute('data-brand');
      const cardPrice = card.getAttribute('data-price');
      const title = card.querySelector('h3').textContent.toLowerCase();

      let show = true;

      if (search && !title.includes(search) && !cardBrand.toLowerCase().includes(search)) show = false;
      if (brand && cardBrand !== brand) show = false;
      if (price) {
        if (price === 'below15000' && (cardPrice === 'request' || Number(cardPrice) >= 15000)) show = false;
        if (price === '15000-25000' && (cardPrice === 'request' || Number(cardPrice) < 15000 || Number(cardPrice) > 25000)) show = false;
        if (price === 'above25000' && (cardPrice === 'request' || Number(cardPrice) <= 25000)) show = false;
      }

      card.style.display = show ? '' : 'none';
    });
  }

  searchInput.addEventListener('input', filterProducts);
  brandFilter.addEventListener('change', filterProducts);
  priceFilter.addEventListener('change', filterProducts);
}

function renderProducts(list) {
  const grid = document.querySelector(".products-grid");
  if (!grid) return;
  grid.innerHTML = "";

  if (!list.length) {
    grid.innerHTML = "<p>No products found.</p>";
    return;
  }

  list.forEach(p => {
    const price =
      Number(p.price) > 0 ? `₹${p.price}` : "Price on Request";

    grid.innerHTML += `
      <div class="product-card">
        <img src="images/${p.image}" alt="${p.name_en}" onerror="this.src='images/no-image.png'">
        <h3>${p.name_en}</h3>
        <p class="brand">${p.brand}</p>
        <p class="price ${p.price == 0 ? "request" : ""}">${price}</p>
        <a class="btn whatsapp full"
           href="https://wa.me/918279557998?text=I%20want%20${encodeURIComponent(p.name_en)}"
           target="_blank" rel="noopener">Ask on WhatsApp</a>
      </div>
    `;
  });
}
