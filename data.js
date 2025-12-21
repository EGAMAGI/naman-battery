// Enhanced data.js

// Product categories and brands
const CATEGORIES = ["inverter", "solar", "ups"];
const BRANDS = ["Exide", "Su-Kam", "Amaron"];

// Utility: Generate a random integer between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Utility: Generate a random badge or undefined
function randomBadge() {
  const badges = ["Best Seller", "Popular", "Best Value", undefined];
  return badges[randomInt(0, badges.length - 1)];
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
    image: "exide_ipst1500_150ah.jpg",
    stock: 12,
    warranty_months: 36
  },
  {
    id: 2,
    category: "inverter",
    brand: "Exide",
    badge: "Popular",
    name_en: "EXIDE INVAMASTER (IMST1500)",
    name_hi: "एक्साइड इन्वामास्टर (IMST1500)",
    price: 19313,
    image: "exide_imst1500.jpg",
    stock: 8,
    warranty_months: 42
  },
  {
    id: 3,
    category: "inverter",
    brand: "Exide",
    name_en: "EXIDE INVAMASTER (IMTT1800)",
    name_hi: "एक्साइड इन्वामास्टर (IMTT1800)",
    price: 25090,
    image: "exide_imtt1800.jpg",
    stock: 5,
    warranty_months: 48
  },
  {
    id: 4,
    category: "inverter",
    brand: "Exide",
    name_en: "EXIDE INVAMASTER (IMTT2000)",
    name_hi: "एक्साइड इन्वामास्टर (IMTT2000)",
    price: 27476,
    image: "exide_imtt2000.jpg",
    stock: 3,
    warranty_months: 48
  },
  {
    id: 5,
    category: "inverter",
    brand: "Amaron",
    badge: "Best Value",
    name_en: "Amaron Current CR-CRTT180 180Ah Tall Tubular Inverter Battery",
    name_hi: "अमरॉन करंट CR-CRTT180 180Ah टॉल ट्यूबुलर इन्वर्टर बैटरी",
    price: 18140,
    image: "amaron_crcrtt180_180ah.jpg",
    stock: 10,
    warranty_months: 36
  }
];

// Add "Price on Request" products with enhanced fields
for (let i = 6; i <= 50; i++) {
  const brand = BRANDS[i % BRANDS.length];
  const category = CATEGORIES[i % CATEGORIES.length];
  const ah = randomInt(100, 220);
  const model = "Model" + i;
  const badge = randomBadge();
  const warranty = [24, 36, 42, 48][i % 4];

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
    image: `${brand.toLowerCase()}_${i}.jpg`,
    stock: randomInt(0, 20),
    warranty_months: warranty
  });
}

// Export for use in other modules (if using Node.js or ES Modules)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { products, BRANDS, CATEGORIES };
}
