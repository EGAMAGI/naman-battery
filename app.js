let currentLang = "en";
let currentBrand = "all";
let currentCategory = "all";
let searchText = "";
let sortType = "";

// 🔁 GOOGLE SHEET SWITCH (USE LATER)
const USE_GOOGLE_SHEET = false;
// const SHEET_URL = "PASTE_SHEET_JSON_URL_HERE";

const allProducts = products;

// sorting
function setSort(v){
  sortType = v;
  renderFast();
}

// filters
function setLang(l){ currentLang = l; renderFast(); }
function setBrand(b){ currentBrand = b; renderFast(); }
function setCategory(c){ currentCategory = c; renderFast(); }

// debounce search
let timer;
function setSearch(t){
  clearTimeout(timer);
  timer = setTimeout(()=>{
    searchText = t.toLowerCase();
    renderFast();
  },300);
}

// skeleton
function showSkeleton(){
  const box = document.getElementById("products");
  box.innerHTML = "<div class='skeleton'></div>".repeat(6);
}

function renderFast(){
  const box = document.getElementById("products");
  if(!box) return;

  showSkeleton();

  requestAnimationFrame(()=>{
    let list = allProducts.filter(p=>{
      if(currentBrand!=="all" && p.brand!==currentBrand) return false;
      if(currentCategory!=="all" && p.category!==currentCategory) return false;
      if(searchText &&
        !p.name_en.toLowerCase().includes(searchText) &&
        !p.name_hi.toLowerCase().includes(searchText) &&
        !p.brand.toLowerCase().includes(searchText)) return false;
      return true;
    });

    if(sortType==="priceLow") list.sort((a,b)=>a.price-b.price);
    if(sortType==="priceHigh") list.sort((a,b)=>b.price-a.price);
    if(sortType==="name") list.sort((a,b)=>a.name_en.localeCompare(b.name_en));

    let html = "";
    for(const p of list){
      const name = currentLang==="en" ? p.name_en : p.name_hi;
      const price = p.price>0 ? "₹"+p.price : "Price on Request";
      const msg = currentLang==="en"
        ? `I want ${p.name_en}`
        : `मुझे ${p.name_hi} चाहिए`;

      html += `
      <div class="card">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
        <img src="${p.image}" loading="lazy"
             onerror="this.src='no-image.png'">
        <h3>${name}</h3>
        <p>${p.brand}</p>
        <p class="price">${price}</p>
        <a class="wa"
           href="https://wa.me/918279557998?text=${encodeURIComponent(msg)}"
           target="_blank">
           ${currentLang==="en" ? "Ask on WhatsApp" : "व्हाट्सएप पर पूछें"}
        </a>
      </div>`;
    }

    box.innerHTML = html;
  });
}

// initial render
renderFast();

// Battery capacity finder
function calculateAh(){
  const load = document.getElementById("load").value;
  const hours = document.getElementById("hours").value;
  const ah = Math.ceil((load * hours) / 12 / 0.8);

  const msg = `I need a ${ah}Ah battery. Please suggest best option.`;
  document.getElementById("result").innerHTML =
    `✅ Recommended: <b>${ah}Ah Battery</b><br>
     <a href="https://wa.me/918279557998?text=${encodeURIComponent(msg)}"
        target="_blank">Ask on WhatsApp</a>`;
}

// price list
function downloadPrice(){
  window.print();
}

function renderProducts(list) {
  const container = document.getElementById("product-list");
  container.innerHTML = "";

  list.forEach(p => {
    const priceText = p.price > 0 ? `₹${p.price}` : "Price on Request";

    container.innerHTML += `
      <div class="product-card">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
        <img src="images/${p.image}" alt="${p.name_en}">
        <h3>${p.name_en}</h3>
        <p class="hi">${p.name_hi}</p>
        <div class="price">${priceText}</div>
        <a 
          href="https://wa.me/918279557998?text=I%20want%20${encodeURIComponent(p.name_en)}"
          target="_blank"
          class="btn">
          Ask on WhatsApp
        </a>
      </div>
    `;
  });
}

renderProducts(products);

document.getElementById("search").addEventListener("input", e => {
  const value = e.target.value.toLowerCase();
  const filtered = products.filter(p =>
    p.name_en.toLowerCase().includes(value) ||
    p.brand.toLowerCase().includes(value)
  );
  renderProducts(filtered);
});
