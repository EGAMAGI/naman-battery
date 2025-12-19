const SHEET_URL =
  "https://opensheet.elk.sh/1QZ9mV6Zd1G5tRCPl0OnFpKXIwNSS9FVRF0C41BUarpA/Sheet1";

let products = [];

fetch(SHEET_URL)
  .then(r => r.json())
  .then(data => {
    products = data;
    renderProducts(products);
  });

function renderProducts(list) {
  const grid = document.querySelector(".products-grid");
  grid.innerHTML = "";

  list.forEach(p => {
    const price =
      Number(p.price) > 0 ? `₹${p.price}` : "Price on Request";

    grid.innerHTML += `
      <div class="product-card">
        <img src="images/${p.image}" onerror="this.src='images/no-image.png'">
        <h3>${p.name_en}</h3>
        <p class="brand">${p.brand}</p>
        <p class="price ${p.price == 0 ? "request" : ""}">${price}</p>
        <a class="btn whatsapp full"
           href="https://wa.me/918279557998?text=I%20want%20${encodeURIComponent(p.name_en)}"
           target="_blank">Ask on WhatsApp</a>
      </div>
    `;
  });
}
