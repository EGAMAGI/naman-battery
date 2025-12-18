let currentLang = "en";
let currentBrand = "all";
let currentCategory = "all";
let searchText = "";

// language
function setLang(l) {
  currentLang = l;
  render();
}

// brand filter
function setBrand(b) {
  currentBrand = b;
  render();
}

// category filter
function setCategory(c) {
  currentCategory = c;
  render();
}

// search
function setSearch(text) {
  searchText = text.toLowerCase();
  render();
}

function render() {
  const box = document.getElementById("products");
  if (!box) return;

  box.innerHTML = "";

  products
    .filter(p => currentBrand === "all" || p.brand === currentBrand)
    .filter(p => currentCategory === "all" || p.category === currentCategory)
    .filter(p => {
      if (!searchText) return true;
      return (
        p.name_en.toLowerCase().includes(searchText) ||
        p.name_hi.toLowerCase().includes(searchText) ||
        p.brand.toLowerCase().includes(searchText)
      );
    })
    .forEach(p => {
      const name = currentLang === "en" ? p.name_en : p.name_hi;
      const priceText = p.price > 0 ? "₹" + p.price : "Price on Request";

      const msg =
        currentLang === "en"
          ? `I want ${p.name_en}`
          : `मुझे ${p.name_hi} चाहिए`;

      box.innerHTML += `
        <div class="card">
          <img src="${p.image}" onerror="this.src='no-image.png'">
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
    });
}

// initial load
render();
