// Enhanced data.js

// Product categories and brands
const CATEGORIES = ["inverter", "solar", "ups"];
const BRANDS = ["Exide", "Su-Kam", "Amaron"];

// Use real images that exist in /images so fallback cards look correct.
const IMAGE_POOLS = {
  Exide: [
    "EXIDE_INVA_PLUS_FEP0_IPST1500_(150Ah).jpg",
    "exide_imst1500_150ah_a.jpg",
    "exide_inva_master_imtt1800_180ah.jpg",
    "exide_inva_master_imtt2000_200ah.jpg",
    "exide_invahomz_1500_150ah.jpg",
    "exide_inva_homz_ihtt_2000_200ah.jpg",
    "exide_it850_230ah.jpg",
    "exide_tube_master2000_200ah.jpg",
    "exide_solar_blitz_6sbz_150ah.jpg"
  ],
  Luminous: [
    "Luminous-life-Max-18075-150Ah-Inverter-Battery.jpg",
    "luminous_inverlast_iltt24060_180ah_1.jpg",
    "luminous_iltt26060_220ah_1.jpg",
    "luminous_iltj_24036_180ah_1.jpg",
    "luminous_rc_24000_180ah_1.jpg",
    "luminous_ilst12042_100ah.jpg",
    "Luminous-solar-150ah-battery.jpg"
  ],
  Any: [
    "logo.png",
    "exide_invahomz_1500_150ah.jpg",
    "Luminous-life-Max-18075-150Ah-Inverter-Battery.jpg"
  ]
};

function pickImage(brand, seed) {
  const pool = IMAGE_POOLS[brand] || IMAGE_POOLS.Any;
  const index = Math.abs(Number(seed) || 0) % pool.length;
  return pool[index];
}

// Utility: Generate a random integer between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Utility: Generate a random badge or undefined
function randomBadge() {
  const badges = ["Best Seller", "Popular", "Best Value", undefined];
  return badges[randomInt(0, badges.length - 1)];
}

// Utility: Generate a random warranty period
function randomWarranty() {
  const options = [24, 36, 42, 48];
  return options[randomInt(0, options.length - 1)];
}

// Utility: Generate a random product description
function randomDescription(brand, model, ah, category) {
  return `${brand} ${model} ${ah}Ah ${category} battery with advanced technology and reliable performance.`;
}

// Utility: Generate a random rating (1-5)
function randomRating() {
  return +(Math.random() * 2 + 3).toFixed(1); // 3.0 to 5.0
}

// Main products array
const products = [
  {
    id: 1,
    category: "inverter",
    brand: "Exide",
    badge: "Best Seller",
    name_en: "Exide Inva Plus Tubular 1500 (IPST1500) 12V 150Ah",
    name_hi: "एक्साइड इन्वा प्लस ट्यूबुलर 1500 (IPST1500) 12V 150Ah",
    price: 11899,
    image: "EXIDE_INVA_PLUS_FEP0_IPST1500_(150Ah).jpg",
    stock: 12,
    warranty_months: 36,
    description: "Exide Inva Plus Tubular battery for long backup and durability.",
    rating: 4.7
  },
  {
    id: 2,
    category: "inverter",
    brand: "Exide",
    badge: "Popular",
    name_en: "EXIDE INVAMASTER (IMST1500)",
    name_hi: "एक्साइड इन्वामास्टर (IMST1500)",
    price: 19313,
    image: "exide_imst1500_150ah_a.jpg",
    stock: 8,
    warranty_months: 42,
    description: "Exide Invamaster battery with high efficiency and long life.",
    rating: 4.5
  },
  {
    id: 3,
    category: "inverter",
    brand: "Exide",
    name_en: "EXIDE INVAMASTER (IMTT1800)",
    name_hi: "एक्साइड इन्वामास्टर (IMTT1800)",
    price: 25090,
    image: "exide_inva_master_imtt1800_180ah.jpg",
    stock: 5,
    warranty_months: 48,
    description: "Exide Invamaster IMTT1800 for superior backup and performance.",
    rating: 4.6
  },
  {
    id: 4,
    category: "inverter",
    brand: "Exide",
    name_en: "EXIDE INVAMASTER (IMTT2000)",
    name_hi: "एक्साइड इन्वामास्टर (IMTT2000)",
    price: 27476,
    image: "exide_inva_master_imtt2000_200ah.jpg",
    stock: 3,
    warranty_months: 48,
    description: "Exide Invamaster IMTT2000 with advanced tubular technology.",
    rating: 4.8
  },
  {
    id: 5,
    category: "inverter",
    brand: "Amaron",
    badge: "Best Value",
    name_en: "Amaron Current CR-CRTT180 180Ah Tall Tubular Inverter Battery",
    name_hi: "अमरॉन करंट CR-CRTT180 180Ah टॉल ट्यूबुलर इन्वर्टर बैटरी",
    price: 18140,
    image: "logo.png",
    stock: 10,
    warranty_months: 36,
    description: "Amaron CRTT180 tall tubular battery for reliable power backup.",
    rating: 4.4
  }
];

// Add "Price on Request" products with enhanced fields
for (let i = 6; i <= 50; i++) {
  const brand = BRANDS[i % BRANDS.length];
  const category = CATEGORIES[i % CATEGORIES.length];
  const ah = randomInt(100, 220);
  const model = "Model" + i;
  const badge = randomBadge();
  const warranty = randomWarranty();
  const description = randomDescription(brand, model, ah, category);
  const rating = randomRating();

  products.push({
    id: i,
    category,
    brand,
    badge,
    name_en: `${brand} ${model} ${ah}Ah`,
    name_hi:
      brand === "Exide"
        ? `एक्साइड ${model} ${ah}Ah`
        : brand === "Su-Kam"
        ? `सु-कम ${model} ${ah}Ah`
        : `अमरॉन ${model} ${ah}Ah`,
    price: 0, // Price on request
    image: pickImage(brand, i),
    stock: randomInt(0, 20),
    warranty_months: warranty,
    description,
    rating
  });
}

// Export for use in other modules (if using Node.js or ES Modules)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { products, BRANDS, CATEGORIES };
}

// Expose to browser (fallback data when Sheet is unavailable)
if (typeof window !== "undefined") {
  window.NAMAN_PRODUCTS = products;
  window.NAMAN_BRANDS = BRANDS;
  window.NAMAN_CATEGORIES = CATEGORIES;
}
