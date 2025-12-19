let currentLang = "en";
let currentBrand = "all";
let currentCategory = "all";
let searchText = "";
let sortType = "";



/* ===== GOOGLE SHEET CONFIG ===== */
const USE_GOOGLE_SHEET = true;
const SHEET_URL =
  "https://opensheet.elk.sh/1QZ9mV6Zd1G5tRCPl0OnFpKXIwNSS9FVRF0C41BUarpA/Sheet1";

/* ===== DATA HOLDER ===== */
let allProducts = [];

/* ===== FILTER CONTROLS ===== */
function setLang(l) { currentLang = l; renderFast(); }
function setBrand(b) { currentBrand = b; renderFast(); }
function setCategory(c) { currentCategory = c; renderFast(); }
function setSort(v) { sortType = v; renderFast(); }

/* ===== SEARCH (DEBOUNCED) ===== */
let timer;
function setSearch(t) {
  clearTimeout(timer);
  timer = setTimeout(() => {
    searchText = t.toLowerCase();
    renderFast();
  }, 300);
}

/* ===== SKELETON ===== */
function showSkeleton() {
  const box = document.getElementById("products");
  if (!box) return;
  box.innerHTML = "<div class='skeleton'></div>".repeat(6);
}

/* ===== IMAGE HELPER (PUT HERE) ===== */
function productImage(name) {
  const exts = ["jpg", "jpeg", "png", "webp"];
  let i = 0;

  const img = document.createElement("img");
  img.loading = "lazy";

  function tryNext() {
    if (i >= exts.length) {
      img.src = "images/no-image.png";
      return;
    }
    img.src = `images/${name}.${exts[i++]}`;
  }

  img.onerror = tryNext;
  tryNext();

  return img;
}


/* ===== MAIN RENDER ===== */
function renderFast() {
  const box = document.getElementById("products");
  if (!box) return;

  showSkeleton();

  requestAnimationFrame(() => {
    let list = allProducts.filter(p => {
      if (currentBrand !== "all" && p.brand !== currentBrand) return false;
      if (currentCategory !== "all" && p.category !== currentCategory) return false;
      if (
        searchText &&
        !p.name_en.toLowerCase().includes(searchText) &&
        !p.name_hi.toLowerCase().includes(searchText) &&
        !p.brand.toLowerCase().includes(searchText)
      ) return false;
      return true;
    });

    if (sortType === "priceLow") list.sort((a, b) => a.price - b.price);
    if (sortType === "priceHigh") list.sort((a, b) => b.price - a.price);
    if (sortType === "name") list.sort((a, b) => a.name_en.localeCompare(b.name_en));

    let html = "";
    for (const p of list) {
      const name = currentLang === "en" ? p.name_en : p.name_hi;
      const isRequest = p.price <= 0;
      const priceText = isRequest ? "Price on Request" : `₹${p.price}`;
      const msg = "I want " + p.name_en;

html += `
  <div class="card">
    <img src="images/${p.image}" loading="lazy" onerror="this.src='images/no-image.png'">
    <h3>${name}</h3>
    <p>${p.brand}</p>
    <p class="price ${isRequest ? "request" : ""}">${priceText}</p>
    <a class="wa"
       href="https://wa.me/918279557998?text=${encodeURIComponent(msg)}"
       target="_blank">
       Ask on WhatsApp
    </a>
  </div>
`;
    }

    box.innerHTML = html || "<p>No products found</p>";
  
    // ✅ PUT IMAGE CODE HERE
  document.querySelectorAll(".img-wrap").forEach(div => {
    const name = div.dataset.img;
    const img = productImage(name);
    div.appendChild(img);
  });
}

/* ===== LOAD DATA ===== */
if (USE_GOOGLE_SHEET) {
  fetch(SHEET_URL)
    .then(res => res.json())
    .then(data => {
      allProducts = data.map(p => ({
        id: Number(p.id),
        category: (p.category || "").toLowerCase().includes("inverter")
          ? "inverter"
          : "other",
        brand: p.brand,
        name_en: p.name_en,
        name_hi: p.name_hi || p.name_en,
        price: Number(p.price),
        image: p.image
      }));
      renderFast();
    })
    .catch(err => {
      console.error("Sheet error, using backup", err);
      allProducts = products;
      renderFast();
    });
} else {
  allProducts = products;
  renderFast();
}

/* ===== BATTERY FINDER ===== */
function calculateAh() {
  const load = document.getElementById("load").value;
  const hours = document.getElementById("hours").value;
  const ah = Math.ceil((load * hours) / 12 / 0.8);

  document.getElementById("result").innerHTML =
    `Recommended: <b>${ah}Ah Battery</b><br>
     <a href="https://wa.me/918279557998?text=I%20need%20${ah}Ah%20battery"
        target="_blank">Ask on WhatsApp</a>`;
}

/* ===== PRICE LIST ===== */
function downloadPrice() {
  window.print();
}
