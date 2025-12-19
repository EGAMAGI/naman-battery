let currentLang = "en";
let currentBrand = "all";
let currentCategory = "all";
let searchText = "";
let sortType = "";

const SHEET_URL =
  "https://opensheet.elk.sh/1QZ9mV6Zd1G5tRCPl0OnFpKXIwNSS9FVRF0C41BUarpA/Sheet1";

let allProducts = [];

/* ===== FILTERS ===== */
function setLang(l){ currentLang = l; renderFast(); }
function setBrand(b){ currentBrand = b; renderFast(); }
function setCategory(c){ currentCategory = c; renderFast(); }
function setSort(v){ sortType = v; renderFast(); }

let timer;
function setSearch(t){
  clearTimeout(timer);
  timer = setTimeout(()=>{
    searchText = t.toLowerCase();
    renderFast();
  },300);
}

function showSkeleton(){
  const box = document.getElementById("products");
  if(!box) return;
  box.innerHTML = "<div class='skeleton'></div>".repeat(6);
}

/* ===== RENDER ===== */
function renderFast(){
  const box = document.getElementById("products");
  if(!box) return;

  showSkeleton();

  requestAnimationFrame(()=>{
    let list = allProducts.filter(p=>{
      if(currentBrand!=="all" && p.brand!==currentBrand) return false;
      if(currentCategory!=="all" && p.category!==currentCategory) return false;
      if(
        searchText &&
        !p.name_en.toLowerCase().includes(searchText) &&
        !p.brand.toLowerCase().includes(searchText)
      ) return false;
      return true;
    });

    if(sortType==="priceLow") list.sort((a,b)=>a.price-b.price);
    if(sortType==="priceHigh") list.sort((a,b)=>b.price-a.price);
    if(sortType==="name") list.sort((a,b)=>a.name_en.localeCompare(b.name_en));

    let html = "";

    for(const p of list){
      const price = p.price > 0 ? "₹"+p.price : "Price on Request";
      const msg = "I want " + p.name_en;

     html += `
  <div class="card product-card">
    <div class="img-box">
      <img src="images/${p.image}"
           loading="lazy"
           onerror="this.src='images/no-image.png'">
    </div>

    <h3 class="title">${name}</h3>

    <p class="meta">
      <span class="brand">${p.brand}</span>
      ${p.warranty ? `• ${p.warranty}` : ""}
    </p>

    <p class="price ${p.price <= 0 ? "request" : ""}">
      ${p.price > 0 ? "₹" + p.price : "Price on Request"}
    </p>

    <a class="wa-btn"
       href="https://wa.me/918279557998?text=${encodeURIComponent(
         "I want " + p.name_en
       )}"
       target="_blank">
       Ask on WhatsApp
    </a>
  </div>
`;

    }

    box.innerHTML = html || "<p>No products found</p>";
  });
}

/* ===== LOAD DATA ===== */
fetch(SHEET_URL)
  .then(r=>r.json())
  .then(data=>{
    allProducts = data.map(p=>({
      brand:p.brand||"",
      name_en:p.name_en||"",
      price:Number(p.price)||0,
      image:p.image||"no-image.png",
      category:"inverter"
    }));
    renderFast();
  });

function downloadPrice(){
  window.print();
}
