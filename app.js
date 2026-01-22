const SHEET_URL =
  "https://opensheet.elk.sh/1QZ9mV6Zd1G5tRCPl0OnFpKXIwNSS9FVRF0C41BUarpA/Sheet1";

let products = [];
let filteredProducts = [];

function normalizeBrand(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizeCategory(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initQuoteModal();
  initBackToTop();
  initFilters();
  initFaqHelper();

  const grid = document.getElementById("productsGrid") || document.querySelector(".products-grid");
  if (grid) renderSkeleton(grid, 8);

  loadProducts()
    .then(list => {
      products = list;
      populateCategoryOptions(products);
      populateBrandOptions(products);
      populatePriceOptions(products);
      applyFilters();
    })
    .catch(() => {
      const fallback = getFallbackProducts();
      products = fallback;
      populateCategoryOptions(products);
      populateBrandOptions(products);
      populatePriceOptions(products);
      applyFilters();
    });
});

function initFaqHelper() {
  const input = document.getElementById("faqQuestion");
  const btn = document.getElementById("faqAskBtn");
  const out = document.getElementById("faqAnswer");
  const faqRoot = document.querySelector("#faq .faq-list");

  if (!input || !btn || !out || !faqRoot) return;

  const entries = Array.from(faqRoot.querySelectorAll("details")).map(d => {
    const q = d.querySelector("summary")?.textContent?.trim() || "";
    const a = d.querySelector("p")?.textContent?.trim() || "";
    return { q, a };
  }).filter(e => e.q && e.a);

  const tokenize = text => {
    const t = String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!t) return [];
    const stop = new Set(["the","a","an","and","or","to","for","of","in","on","is","are","do","does","you","we","i","it","with","our","your","provide","available"]);
    return t.split(" ").filter(w => w.length >= 2 && !stop.has(w));
  };

  const score = (query, candidate) => {
    const qTokens = tokenize(query);
    const cTokens = tokenize(candidate);
    if (!qTokens.length || !cTokens.length) return 0;
    const cSet = new Set(cTokens);
    let overlap = 0;
    qTokens.forEach(w => { if (cSet.has(w)) overlap += 1; });
    return overlap / Math.sqrt(qTokens.length * cTokens.length);
  };

  const render = html => { out.innerHTML = html; };
  render('<span class="muted">Ask a question above to get an instant answer.</span>');

  const getAiEndpoint = () => {
    const v = typeof window !== "undefined" ? window.NAMAN_AI_ENDPOINT : "";
    const s = String(v || "").trim();
    return s && /^https?:\/\//i.test(s) ? s : "";
  };

  const findBest = question => {
    let best = null;
    let bestScore = 0;
    entries.forEach(e => {
      const s = Math.max(score(question, e.q), score(question, e.a));
      if (s > bestScore) { bestScore = s; best = e; }
    });
    return { best, bestScore };
  };

  const ask = () => {
    const question = String(input.value || "").trim();
    if (!question) {
      render('<span class="muted">Please type your question.</span>');
      return;
    }

    const endpoint = getAiEndpoint();
    if (endpoint) {
      render('<span class="muted">Thinking…</span>');
      askAi(endpoint, question, entries)
        .then(answer => {
          if (answer) {
            render(`
              <div><strong>Answer</strong></div>
              <div style="margin-top:6px;">${escapeHtml(answer)}</div>
              <div class="muted" style="margin-top:8px;">Need human help? Ask on <a href="https://wa.me/918279557998?text=${encodeURIComponent("Hi, I have a question: " + question)}" target="_blank" rel="noopener">WhatsApp</a>.</div>
            `);
            return;
          }
          // If AI returned nothing, fall back to local matcher.
          const { best, bestScore } = findBest(question);
          if (best && bestScore >= 0.25) {
            render(`
              <div><strong>${escapeHtml(best.q)}</strong></div>
              <div style="margin-top:6px;">${escapeHtml(best.a)}</div>
              <div class="muted" style="margin-top:8px;">Not what you needed? Ask on <a href="https://wa.me/918279557998?text=${encodeURIComponent("Hi, I have a question: " + question)}" target="_blank" rel="noopener">WhatsApp</a>.</div>
            `);
            return;
          }
          render(`
            <div><strong>We couldn’t find this in our FAQ.</strong></div>
            <div class="muted" style="margin-top:6px;">Send your question on <a href="https://wa.me/918279557998?text=${encodeURIComponent("Hi, I have a question: " + question)}" target="_blank" rel="noopener">WhatsApp</a> and we will reply quickly.</div>
          `);
        })
        .catch(() => {
          // If AI request fails, fall back to local matcher.
          const { best, bestScore } = findBest(question);
          if (best && bestScore >= 0.25) {
            render(`
              <div><strong>${escapeHtml(best.q)}</strong></div>
              <div style="margin-top:6px;">${escapeHtml(best.a)}</div>
              <div class="muted" style="margin-top:8px;">Not what you needed? Ask on <a href="https://wa.me/918279557998?text=${encodeURIComponent("Hi, I have a question: " + question)}" target="_blank" rel="noopener">WhatsApp</a>.</div>
            `);
            return;
          }
          render(`
            <div><strong>AI is temporarily unavailable.</strong></div>
            <div class="muted" style="margin-top:6px;">Send your question on <a href="https://wa.me/918279557998?text=${encodeURIComponent("Hi, I have a question: " + question)}" target="_blank" rel="noopener">WhatsApp</a> and we will reply quickly.</div>
          `);
        });
      return;
    }

    const { best, bestScore } = findBest(question);

    // Threshold tuned for small FAQ set.
    if (best && bestScore >= 0.25) {
      render(`
        <div><strong>${escapeHtml(best.q)}</strong></div>
        <div style="margin-top:6px;">${escapeHtml(best.a)}</div>
        <div class="muted" style="margin-top:8px;">Not what you needed? Ask on <a href="https://wa.me/918279557998?text=${encodeURIComponent("Hi, I have a question: " + question)}" target="_blank" rel="noopener">WhatsApp</a>.</div>
      `);
      return;
    }

    render(`
      <div><strong>We couldn’t find this in our FAQ.</strong></div>
      <div class="muted" style="margin-top:6px;">Send your question on <a href="https://wa.me/918279557998?text=${encodeURIComponent("Hi, I have a question: " + question)}" target="_blank" rel="noopener">WhatsApp</a> and we will reply quickly.</div>
    `);
  };

  btn.addEventListener("click", ask);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      ask();
    }
  });
}

async function askAi(endpoint, question, faqEntries) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 12000);
  try {
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        faq: (faqEntries || []).slice(0, 20),
      }),
      signal: controller.signal,
    });
    if (!resp.ok) return "";
    const data = await resp.json();
    return String(data?.answer || "").trim();
  } finally {
    clearTimeout(t);
  }
}

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

function filterList(list, query = "", category = "", brand = "", priceBucket = "") {
  const q = (query || "").trim().toLowerCase();
  return list.filter(p => {
    const name = String(p.name_en || p.name || "").toLowerCase();
    const brandName = String(p.brand || "").trim();
    const brandLower = brandName.toLowerCase();
    const categoryName = String(p.category || "").trim();
    const priceValue = normalizePrice(p.price);

    if (q && !name.includes(q) && !brandLower.includes(q)) return false;
    if (category && normalizeCategory(categoryName) !== normalizeCategory(category)) return false;
    if (brand && normalizeBrand(brandName) !== normalizeBrand(brand)) return false;

    if (priceBucket) {
      if (priceValue === null) return false;

      // Dynamic range: "range:<min>:<max>" where min/max are numbers or empty.
      if (String(priceBucket).startsWith("range:")) {
        const parts = String(priceBucket).split(":");
        const minRaw = parts[1] ?? "";
        const maxRaw = parts[2] ?? "";
        const min = minRaw === "" ? null : Number(minRaw);
        const max = maxRaw === "" ? null : Number(maxRaw);

        if (min !== null && Number.isFinite(min) && priceValue < min) return false;
        if (max !== null && Number.isFinite(max) && priceValue > max) return false;
      } else {
        // Backward compatible fixed buckets.
        if (priceBucket === "below15000" && priceValue >= 15000) return false;
        if (priceBucket === "15000-25000" && (priceValue < 15000 || priceValue > 25000)) return false;
        if (priceBucket === "above25000" && priceValue <= 25000) return false;
      }
    }

    return true;
  });
}

function sortList(list, sortKey) {
  const copy = [...list];

  if (sortKey === "recommended") {
    copy.sort((a, b) => {
      const ra = Number(a?.rating);
      const rb = Number(b?.rating);
      const ratingA = Number.isFinite(ra) ? ra : 0;
      const ratingB = Number.isFinite(rb) ? rb : 0;
      if (ratingB !== ratingA) return ratingB - ratingA;

      const sa = Number(a?.stock);
      const sb = Number(b?.stock);
      const stockA = Number.isFinite(sa) ? sa : 0;
      const stockB = Number.isFinite(sb) ? sb : 0;
      if (stockB !== stockA) return stockB - stockA;

      const pa = normalizePrice(a?.price);
      const pb = normalizePrice(b?.price);
      const priceA = pa ?? 9e15;
      const priceB = pb ?? 9e15;
      if (priceA !== priceB) return priceA - priceB;

      return String(a?.name_en || a?.name || "").localeCompare(String(b?.name_en || b?.name || ""));
    });
  } else if (sortKey === "priceAsc") {
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
    const stockNum = Number(p.stock);
    const hasStock = Number.isFinite(stockNum);
    const inStock = hasStock ? stockNum > 0 : null;

    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("tabindex", "0");
    card.setAttribute("data-brand", p.brand || "");
    card.setAttribute("data-price", priceValue ? String(priceValue) : "request");

    const waText = encodeURIComponent(`Hi, I want ${p.name_en || "this battery"}. Please share price, warranty, and installation details.`);

    card.innerHTML = `
      ${badge ? `<div class=\"badge\">${escapeHtml(badge)}</div>` : ""}
      ${hasStock ? `<div class=\"stock-badge ${inStock ? "in" : "out"}\">${inStock ? "In Stock" : "Out of Stock"}</div>` : ""}
      <img loading="lazy" decoding="async" src="images/${escapeAttr(p.image || "")}" alt="${escapeAttr(p.name_en || "Battery")}" onerror="this.onerror=null;this.src='images/logo.png'">
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
    categoryFilter: document.getElementById("categoryFilter"),
    brandFilter: document.getElementById("brandFilter"),
    priceFilter: document.getElementById("priceFilter"),
    sortFilter: document.getElementById("sortFilter"),
    clearFilters: document.getElementById("clearFilters"),
  };

  if (controls.searchInput) controls.searchInput.addEventListener("input", applyFilters);
  if (controls.categoryFilter) controls.categoryFilter.addEventListener("change", applyFilters);
  if (controls.brandFilter) controls.brandFilter.addEventListener("change", applyFilters);
  if (controls.priceFilter) controls.priceFilter.addEventListener("change", applyFilters);
  if (controls.sortFilter) controls.sortFilter.addEventListener("change", applyFilters);
  if (controls.clearFilters) {
    controls.clearFilters.addEventListener("click", () => {
      if (controls.searchInput) controls.searchInput.value = "";
      if (controls.categoryFilter) controls.categoryFilter.value = "";
      if (controls.brandFilter) controls.brandFilter.value = "";
      if (controls.priceFilter) controls.priceFilter.value = "";
      if (controls.sortFilter) controls.sortFilter.value = "recommended";
      applyFilters();
    });
  }
}

function populateCategoryOptions(list) {
  const select = controls?.categoryFilter || document.getElementById("categoryFilter");
  if (!select) return;

  const currentValue = select.value || "";

  const unique = new Map();
  (Array.isArray(list) ? list : []).forEach(p => {
    const raw = String(p?.category || "").trim();
    if (!raw) return;
    const key = normalizeCategory(raw);
    if (!unique.has(key)) unique.set(key, raw);
  });

  const categories = Array.from(unique.values()).sort((a, b) => a.localeCompare(b));

  select.innerHTML = "";
  const optAll = document.createElement("option");
  optAll.value = "";
  optAll.textContent = "All Categories";
  select.appendChild(optAll);

  categories.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c.charAt(0).toUpperCase() + c.slice(1);
    select.appendChild(opt);
  });

  if (currentValue) {
    const match = Array.from(select.options).find(o => normalizeCategory(o.value) === normalizeCategory(currentValue));
    select.value = match ? match.value : "";
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

function roundBucket(value, step) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const s = Number(step) || 1000;
  return Math.max(s, Math.round(n / s) * s);
}

function percentile(sorted, p) {
  if (!sorted.length) return null;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))));
  return sorted[idx];
}

function populatePriceOptions(list) {
  const select = controls?.priceFilter || document.getElementById("priceFilter");
  if (!select) return;

  const currentValue = select.value || "";
  const prices = (Array.isArray(list) ? list : [])
    .map(p => normalizePrice(p?.price))
    .filter(v => typeof v === "number" && Number.isFinite(v) && v > 0)
    .sort((a, b) => a - b);

  // If we don't have enough prices, keep whatever is in HTML.
  if (prices.length < 3) return;

  const step = prices.some(v => v >= 50000) ? 5000 : 1000;
  let t1 = roundBucket(percentile(prices, 0.33), step);
  let t2 = roundBucket(percentile(prices, 0.67), step);

  if (t1 === null || t2 === null) return;
  if (t2 <= t1) {
    // Fallback to median split if quantiles collapse.
    t1 = roundBucket(percentile(prices, 0.5), step);
    t2 = t1 ? t1 + step : null;
  }
  if (t1 === null || t2 === null) return;

  // Rebuild options.
  select.innerHTML = "";
  const optAll = document.createElement("option");
  optAll.value = "";
  optAll.textContent = "All Prices";
  select.appendChild(optAll);

  const opt1 = document.createElement("option");
  opt1.value = `range::${t1 - 1}`;
  opt1.textContent = `Below ₹${(t1).toLocaleString("en-IN")}`;
  select.appendChild(opt1);

  const opt2 = document.createElement("option");
  opt2.value = `range:${t1}:${t2}`;
  opt2.textContent = `₹${t1.toLocaleString("en-IN")} – ₹${t2.toLocaleString("en-IN")}`;
  select.appendChild(opt2);

  const opt3 = document.createElement("option");
  opt3.value = `range:${t2 + 1}:`;
  opt3.textContent = `Above ₹${t2.toLocaleString("en-IN")}`;
  select.appendChild(opt3);

  // Restore selection if still relevant.
  if (currentValue) {
    const match = Array.from(select.options).find(o => o.value === currentValue);
    select.value = match ? match.value : "";
  }
}

function applyFilters() {
  const query = controls?.searchInput?.value || "";
  const category = controls?.categoryFilter?.value || "";
  const brand = controls?.brandFilter?.value || "";
  const priceBucket = controls?.priceFilter?.value || "";
  const sortKey = controls?.sortFilter?.value || "recommended";

  filteredProducts = filterList(products, query, category, brand, priceBucket);
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
