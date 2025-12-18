const products = [
  {
    id: 1,
    category: "inverter",
    brand: "Exide",
    badge: "Best Seller",
    name_en: "Exide Inva Plus Tubular 1500 (IPST1500) 12V 150Ah",
    name_hi: "एक्साइड इन्वा प्लस ट्यूबुलर 1500 (IPST1500) 12V 150Ah",
    price: 11899,
    image: "exide_ipst1500_150ah.jpg"
  },
  {
    id: 2,
    category: "inverter",
    brand: "Exide",
    badge: "Popular",
    name_en: "EXIDE INVAMASTER (IMST1500)",
    name_hi: "एक्साइड इन्वामास्टर (IMST1500)",
    price: 19313,
    image: "exide_imst1500.jpg"
  },
  {
    id: 3,
    category: "inverter",
    brand: "Exide",
    name_en: "EXIDE INVAMASTER (IMTT1800)",
    name_hi: "एक्साइड इन्वामास्टर (IMTT1800)",
    price: 25090,
    image: "exide_imtt1800.jpg"
  },
  {
    id: 4,
    category: "inverter",
    brand: "Exide",
    name_en: "EXIDE INVAMASTER (IMTT2000)",
    name_hi: "एक्साइड इन्वामास्टर (IMTT2000)",
    price: 27476,
    image: "exide_imtt2000.jpg"
  },
  {
    id: 5,
    category: "inverter",
    brand: "Amaron",
    badge: "Best Value",
    name_en: "Amaron Current CR-CRTT180 180Ah Tall Tubular Inverter Battery",
    name_hi: "अमरॉन करंट CR-CRTT180 180Ah टॉल ट्यूबुलर इन्वर्टर बैटरी",
    price: 18140,
    image: "amaron_crcrtt180_180ah.jpg"
  },
  {
    id: 6,
    category: "inverter",
    brand: "Amaron",
    name_en: "Amaron Current DP150TT42 150Ah Tall Tubular Battery",
    name_hi: "अमरॉन करंट DP150TT42 150Ah टॉल ट्यूबुलर बैटरी",
    price: 14870,
    image: "amaron_dp150tt42_150ah.jpg"
  },
  {
    id: 7,
    category: "inverter",
    brand: "Amaron",
    name_en: "Amaron Current AR125ST36 125Ah Tubular Battery",
    name_hi: "अमरॉन करंट AR125ST36 125Ah ट्यूबुलर बैटरी",
    price: 11806,
    image: "amaron_ar125st36_125ah.jpg"
  },
  {
    id: 8,
    category: "inverter",
    brand: "Amaron",
    name_en: "Amaron Current AR135ST36 135Ah Tubular Battery",
    name_hi: "अमरॉन करंट AR135ST36 135Ah ट्यूबुलर बैटरी",
    price: 11010,
    image: "amaron_ar135st36_135ah.jpg"
  },
  {
    id: 9,
    category: "inverter",
    brand: "Amaron",
    name_en: "Amaron Current AR145ST36 145Ah Tubular Battery",
    name_hi: "अमरॉन करंट AR145ST36 145Ah ट्यूबुलर बैटरी",
    price: 13330,
    image: "amaron_ar145st36_145ah.jpg"
  },
  {
    id: 10,
    category: "inverter",
    brand: "Amaron",
    name_en: "Amaron Current AR165ST36 165Ah Tubular Battery",
    name_hi: "अमरॉन करंट AR165ST36 165Ah ट्यूबुलर बैटरी",
    price: 14552,
    image: "amaron_ar165st36_165ah.jpg"
  },

  // ---------- PRICE ON REQUEST PRODUCTS ----------
  ...Array.from({ length: 40 }, (_, i) => {
    const id = i + 11;
    const brands = ["Exide", "Su-Kam", "Amaron"];
    const brand = brands[i % 3];
    return {
      id,
      category: "inverter",
      brand,
      name_en: `${brand} [Model] [Ah]`,
      name_hi:
        brand === "Exide"
          ? "एक्साइड [मॉडल] [Ah]"
          : brand === "Su-Kam"
          ? "सु-कम [मॉडल] [Ah]"
          : "अमरॉन [मॉडल] [Ah]",
      price: 0,
      image: `${brand.toLowerCase()}_${id}.jpg`
    };
  })
];
