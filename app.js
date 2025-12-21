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
