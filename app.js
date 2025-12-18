let currentLang = "en";
let currentBrand = "all";
let currentCategory = "all";
let searchText = "";

// cache products once
const allProducts = products;

// language
function setLang(l) {
  currentLang = l;
  renderFast();
}

// brand
function setBrand(b) {
  currentBrand = b;
  renderFast();
}

// category
function setCategory(c) {
  currentCategory = c;
  renderFast();
}

// debounce search
let searchTimer;
function setSearch(text) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchText = text.toLowerCase();
    renderFast();
  }, 300);
}

function renderFast() {
  const box = document.getElementById("products");
  if (!box) return;

  let html = "";

  for (let i = 0; i < allProducts.length; i++) {
    const p = allProducts[i];

    if (currentBrand !== "all" && p.brand !== currentBrand) continue;
    if (currentCategory !== "all" && p.category !== currentCategory) continue;

    if (
      searchText &&
      !p.name_en.toLowerCase().includes(searchText) &&
      !p.name_hi.toLowerCase().includes(searchText) &&
      !p.brand.toLowerCase().includes(searchText)
    ) {
      continue;
    }

    const name = currentLang === "en" ? p.name_en : p.name_hi;
    const priceText = p.price > 0 ? "₹" + p.price : "Price on Request";
    const msg =
      currentLang === "en"
        ? `I want ${p.name_en}`
        : `मुझे ${p.name_hi} चाहिए`;

    html += `
      <div class="card">
        <img src="${p.image}" loading="lazy"
             onerror="this.src='no-image.png'">
        <h3>${name}</h3>
        <p>${p.brand}</p>
        <p class="price">${priceText}</p>
        <a class="wa"
           href="https://wa.me/918279557998?text=${encodeURIComponent(msg)}"
           target="_blank">
          ${currentLang === "en" ? "Ask on WhatsApp" : "व्हाट्सएप पर पूछें"}
        </a>
      </div>
    `;
  }

  box.innerHTML = html;
}

// initial render
renderFast();
