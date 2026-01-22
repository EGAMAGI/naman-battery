const SHEET_URL =
  "https://opensheet.elk.sh/1QZ9mV6Zd1G5tRCPl0OnFpKXIwNSS9FVRF0C41BUarpA/Sheet1";

let products = [];
let filteredProducts = [];

document.addEventListener("DOMContentLoaded", () => {
  // Add search bar
  const searchBar = document.createElement("input");
  searchBar.type = "text";
  searchBar.placeholder = "Search products...";
  searchBar.className = "product-search";
  searchBar.setAttribute("aria-label", "Search products");
  searchBar.style = "margin:16px 0;padding:8px;width:100%;max-width:400px;display:block;";
  document.body.insertBefore(searchBar, document.body.firstChild);

  // Add products grid if not present
  let grid = document.querySelector(".products-grid");
  if (!grid) {
    grid = document.createElement("div");
    grid.className = "products-grid";
    document.body.appendChild(grid);
  }

  // Fetch products
  fetch(SHEET_URL)
    .then(r => r.json())
    .then(data => {
      products = data;
      filteredProducts = data;
      renderProducts(filteredProducts);
      initializeFilters();
    })
    .catch(() => {
      grid.innerHTML = "<p>Failed to load products.</p>";
    });

  // Search functionality
  searchBar.addEventListener("input", e => {
    const query = e.target.value.trim().toLowerCase();
    filteredProducts = filterProducts(products, query);
    renderProducts(filteredProducts);
  });
});

// Filtering logic
function filterProducts(list, query = "", brand = "", price = "") {
  return list.filter(p => {
    const name = (p.name_en || "").toLowerCase();
    const brandName = (p.brand || "").toLowerCase();
    const pPrice = p.price === "request" ? "request" : Number(p.price);

    let matches = true;
    if (query && !name.includes(query) && !brandName.includes(query)) matches = false;
    if (brand && brand !== p.brand) matches = false;
    if (price) {
      if (price === "below15000" && (pPrice === "request" || pPrice >= 15000)) matches = false;
      if (price === "15000-25000" && (pPrice === "request" || pPrice < 15000 || pPrice > 25000)) matches = false;
      if (price === "above25000" && (pPrice === "request" || pPrice <= 25000)) matches = false;
    }
    return matches;
  });
}

// Initialize filter dropdowns if present
function initializeFilters() {
  const searchInput = document.getElementById('searchInput');
  const brandFilter = document.getElementById('brandFilter');
  const priceFilter = document.getElementById('priceFilter');
  const grid = document.querySelector(".products-grid");

  if (!brandFilter && !priceFilter && !searchInput) return;

  function applyFilters() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const brand = brandFilter ? brandFilter.value : "";
    const price = priceFilter ? priceFilter.value : "";
    filteredProducts = filterProducts(products, query, brand, price);
    renderProducts(filteredProducts);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (brandFilter) brandFilter.addEventListener('change', applyFilters);
  if (priceFilter) priceFilter.addEventListener('change', applyFilters);
}

function renderProducts(list) {
  const grid = document.querySelector(".products-grid");
  if (!grid) return;
  grid.innerHTML = "";

  if (!list.length) {
    grid.innerHTML = "<p>No products found.</p>";
    return;
  }

  const fragment = document.createDocumentFragment();

  list.forEach(p => {
    const price =
      Number(p.price) > 0 ? `₹${p.price}` : "Price on Request";
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("tabindex", "0");
    card.setAttribute("data-brand", p.brand || "");
    card.setAttribute("data-price", p.price || "request");

    card.innerHTML = `
      <img src="images/${p.image}" alt="${p.name_en}" onerror="this.src='images/no-image.png'">
      <h3>${p.name_en}</h3>
      <p class="brand">${p.brand}</p>
      <p class="price ${p.price == 0 ? "request" : ""}">${price}</p>
      <a class="btn whatsapp full"
         href="https://wa.me/918279557998?text=I%20want%20${encodeURIComponent(p.name_en)}"
         target="_blank" rel="noopener">Ask on WhatsApp</a>
    `;
    fragment.appendChild(card);
  });

  grid.appendChild(fragment);
}
