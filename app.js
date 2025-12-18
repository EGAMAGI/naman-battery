let searchText = "";
let currentLang = "en";
let currentBrand = "all";
let currentCategory = "all";

// 🔄 GOOGLE SHEET SWITCH (USE LATER)
const USE_GOOGLE_SHEET = false;
// const SHEET_URL = "PASTE_GOOGLE_SHEET_JSON_URL_HERE";

function setLang(l){ currentLang = l; render(); }
function setBrand(b){ currentBrand = b; render(); }
function setCategory(c){ currentCategory = c; render(); }

function render(){
  const box = document.getElementById("products");
  box.innerHTML = "";

  products
    .filter(p => currentBrand === "all" || p.brand === currentBrand)
    .filter(p => currentCategory === "all" || p.category === currentCategory)
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

render();
