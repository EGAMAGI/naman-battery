const SHEET_URL =
  "https://opensheet.elk.sh/1QZ9mV6Zd1G5tRCPl0OnFpKXIwNSS9FVRF0C41BUarpA/Sheet1";

let products = [];
let filteredProducts = [];

function normalizeBrand(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initQuoteModal();
  initBackToTop();
  initFilters();

  const grid = document.getElementById("productsGrid") || document.querySelector(".products-grid");
  if (grid) renderSkeleton(grid, 8);

  loadProducts()
    .then(list => {
      products = list;
      populateBrandOptions(products);
      applyFilters();
    })
    .catch(() => {
      const fallback = getFallbackProducts();
      products = fallback;
      populateBrandOptions(products);
      applyFilters();
    });
});

function getFallbackProducts() {
  const local = typeof window !== "undefined" ? window.NAMAN_PRODUCTS : null;
  return Array.isArray(local) ? local : [];
}

async function loadProducts() {
  const response = await fetch(SHEET_URL, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch sheet");
  const data = await response.json();
  if (!Array.isArray(data) || !data.length) throw new Error("Empty sheet");
  return data;
}

function normalizePrice(raw) {
  if (raw === "request" || raw === "" || raw === null || raw === undefined) return null;
  const num = Number(raw);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function filterList(list, query = "", brand = "", priceBucket = "") {
  const q = (query || "").trim().toLowerCase();
  return list.filter(p => {
    const name = String(p.name_en || p.name || "").toLowerCase();
    const brandName = String(p.brand || "").trim();
    const brandLower = brandName.toLowerCase();
    const priceValue = normalizePrice(p.price);

    if (q && !name.includes(q) && !brandLower.includes(q)) return false;
    if (brand && normalizeBrand(brandName) !== normalizeBrand(brand)) return false;

    if (priceBucket) {
      if (priceValue === null) return false;
      if (priceBucket === "below15000" && priceValue >= 15000) return false;
      if (priceBucket === "15000-25000" && (priceValue < 15000 || priceValue > 25000)) return false;
      if (priceBucket === "above25000" && priceValue <= 25000) return false;
    }

    return true;
  });
}

function sortList(list, sortKey) {
  const copy = [...list];
  if (sortKey === "priceAsc") {
    copy.sort((a, b) => (normalizePrice(a.price) ?? 9e15) - (normalizePrice(b.price) ?? 9e15));
  } else if (sortKey === "priceDesc") {
    copy.sort((a, b) => (normalizePrice(b.price) ?? -1) - (normalizePrice(a.price) ?? -1));
  } else if (sortKey === "nameAsc") {
    copy.sort((a, b) => String(a.name_en || "").localeCompare(String(b.name_en || "")));
  }
  return copy;
}

function renderSkeleton(grid, count) {
  grid.innerHTML = "";
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i += 1) {
    const div = document.createElement("div");
    div.className = "product-card skeleton";
    div.innerHTML = `
      <div class="sk-img"></div>
      <div class="sk-line"></div>
      <div class="sk-line short"></div>
      <div class="sk-btn"></div>
    `;
    fragment.appendChild(div);
  }
  grid.appendChild(fragment);
}

function renderProducts(list) {
  const grid = document.getElementById("productsGrid") || document.querySelector(".products-grid");
  if (!grid) return;
  grid.innerHTML = "";

  if (!list.length) {
    grid.innerHTML = "<div class=\"empty-state\"><h3>No products found</h3><p>Try changing filters or search.</p></div>";
    return;
  }

  const fragment = document.createDocumentFragment();

  list.forEach(p => {
    const priceValue = normalizePrice(p.price);
    const priceText = priceValue ? `₹${priceValue.toLocaleString("en-IN")}` : "Price on Request";
    const badge = p.badge ? String(p.badge) : "";
    const rating = p.rating ? Number(p.rating) : null;
    const warranty = p.warranty_months ? Number(p.warranty_months) : null;

    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("tabindex", "0");
    card.setAttribute("data-brand", p.brand || "");
    card.setAttribute("data-price", priceValue ? String(priceValue) : "request");

    const waText = encodeURIComponent(`Hi, I want ${p.name_en || "this battery"}. Please share price, warranty, and installation details.`);

    card.innerHTML = `
      ${badge ? `<div class=\"badge\">${escapeHtml(badge)}</div>` : ""}
      <img src="images/${escapeAttr(p.image || "")}" alt="${escapeAttr(p.name_en || "Battery")}" onerror="this.onerror=null;this.src='images/logo.png'">
      <h3>${escapeHtml(p.name_en || "")}</h3>
      <p class="brand">${escapeHtml(p.brand || "")}${warranty ? ` • ${warranty} mo warranty` : ""}</p>
      ${rating ? `<div class=\"rating\" aria-label=\"Rating\">⭐ ${rating.toFixed(1)}</div>` : ""}
      <p class="price ${priceValue ? "" : "request"}">${priceText}</p>
      <a class="btn whatsapp full" href="https://wa.me/918279557998?text=${waText}" target="_blank" rel="noopener">Ask on WhatsApp</a>
    `;

    fragment.appendChild(card);
  });

  grid.appendChild(fragment);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "");
}

let controls = null;

function initFilters() {
  controls = {
    searchInput: document.getElementById("searchInput"),
    brandFilter: document.getElementById("brandFilter"),
    priceFilter: document.getElementById("priceFilter"),
    sortFilter: document.getElementById("sortFilter"),
    clearFilters: document.getElementById("clearFilters"),
  };

  if (controls.searchInput) controls.searchInput.addEventListener("input", applyFilters);
  if (controls.brandFilter) controls.brandFilter.addEventListener("change", applyFilters);
  if (controls.priceFilter) controls.priceFilter.addEventListener("change", applyFilters);
  if (controls.sortFilter) controls.sortFilter.addEventListener("change", applyFilters);
  if (controls.clearFilters) {
    controls.clearFilters.addEventListener("click", () => {
      if (controls.searchInput) controls.searchInput.value = "";
      if (controls.brandFilter) controls.brandFilter.value = "";
      if (controls.priceFilter) controls.priceFilter.value = "";
      if (controls.sortFilter) controls.sortFilter.value = "recommended";
      applyFilters();
    });
  }
}

function populateBrandOptions(list) {
  const select = controls?.brandFilter || document.getElementById("brandFilter");
  if (!select) return;

  const currentValue = select.value || "";

  const unique = new Map();
  (Array.isArray(list) ? list : []).forEach(p => {
    const raw = String(p?.brand || "").trim();
    if (!raw) return;
    const key = normalizeBrand(raw);
    if (!unique.has(key)) unique.set(key, raw);
  });

  const brands = Array.from(unique.values()).sort((a, b) => a.localeCompare(b));

  // Rebuild options (keep a stable first option).
  select.innerHTML = "";
  const optAll = document.createElement("option");
  optAll.value = "";
  optAll.textContent = "All Brands";
  select.appendChild(optAll);

  brands.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    select.appendChild(opt);
  });

  // Restore selection if still available.
  if (currentValue) {
    const match = Array.from(select.options).find(o => normalizeBrand(o.value) === normalizeBrand(currentValue));
    select.value = match ? match.value : "";
  }
}

function applyFilters() {
  const query = controls?.searchInput?.value || "";
  const brand = controls?.brandFilter?.value || "";
  const priceBucket = controls?.priceFilter?.value || "";
  const sortKey = controls?.sortFilter?.value || "recommended";

  filteredProducts = filterList(products, query, brand, priceBucket);
  filteredProducts = sortList(filteredProducts, sortKey);
  renderProducts(filteredProducts);
}

function initQuoteModal() {
  const modal = document.getElementById("quoteModal");
  const openBtn = document.getElementById("openQuote");
  const openSticky = document.getElementById("openQuoteSticky");
  const form = document.getElementById("quoteForm");

  if (!modal) return;

  const open = () => {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  };
  const close = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  };

  if (openBtn) openBtn.addEventListener("click", open);
  if (openSticky) openSticky.addEventListener("click", open);

  modal.addEventListener("click", e => {
    const target = e.target;
    if (target && target.hasAttribute && target.hasAttribute("data-close-modal")) close();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modal.classList.contains("open")) close();
  });

  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const phone = String(fd.get("phone") || "").trim();
      const city = String(fd.get("city") || "").trim();
      const brand = String(fd.get("brand") || "").trim();
      const message = String(fd.get("message") || "").trim();

      const text = encodeURIComponent(
        `Hi! I need a battery quote.\nName: ${name}\nPhone: ${phone}\nCity: ${city}\nBrand: ${brand}\nRequirement: ${message}`
      );
      window.open(`https://wa.me/918279557998?text=${text}`, "_blank", "noopener");
      close();
      form.reset();
    });
  }
}

function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  const onScroll = () => {
    btn.classList.toggle("show", window.scrollY > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function initTheme() {
  const btn = document.getElementById("themeToggle");
  const key = "naman_theme";

  const apply = theme => {
    document.documentElement.dataset.theme = theme;
    if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
  };

  const saved = localStorage.getItem(key);
  if (saved === "dark" || saved === "light") apply(saved);

  if (!btn) return;
  btn.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(key, next);
    apply(next);
  });
}
