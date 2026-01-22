# E‑commerce Backup Checklist (Keep Ready, Go Live Later)

Goal: Prepare a WooCommerce store as a **backup** while keeping the current static website live.

## A) Recommended approach
- Keep current site (Cloudflare Pages/GitHub Pages) live for now.
- Build WooCommerce store in **staging**:
  - `staging.yourdomain.com` (best), or
  - a temporary domain provided by hosting, or
  - local install (only for development).

## B) Staging safety (do this FIRST)
- Block search indexing:
  - WordPress → Settings → Reading → **Discourage search engines**
  - Install plugin: “Yoast SEO” or “Rank Math” → set **noindex** for staging
- Password protect staging (recommended):
  - Hosting panel → Password protect directory, or
  - Plugin: “Password Protected”
- Disable real payments while testing:
  - Razorpay → **Test Mode** (use test keys)
  - COD can be enabled but keep store private

## C) WooCommerce setup (prepare now)
### 1) Store basics
- Currency: INR
- Address: Baraut, Uttar Pradesh
- Business details: GSTIN, phone, email

### 2) Products (100–200)
- Use templates in this repo:
  - [products-template.csv](products-template.csv) (master sheet)
  - [products-template-woocommerce.csv](products-template-woocommerce.csv) (import to Woo)
- Import in WooCommerce:
  - WooCommerce → Products → Import

### 3) Shipping (Baraut/Ghaziabad only, flat ₹200)
- Create shipping zones:
  - Zone 1: **Baraut** → Flat rate ₹200
  - Zone 2: **Ghaziabad** → Flat rate ₹200
- Important: “City-based only” usually needs ONE of these:
  - Pincode restriction plugin (best), OR
  - Checkout validation plugin, OR
  - Custom code (later)

Recommended: Use pincode-based restriction (more accurate than city text).

### 4) Payments (UPI + Card + COD)
- Install Razorpay for WooCommerce
  - Enable UPI + Cards (Test Mode now)
- Enable COD
  - Optional: COD extra fee

### 5) Taxes / GST Invoice
- Configure GST tax rates (as needed)
- Install invoice plugin that supports GST invoices

### 6) Policies & pages
- Create pages:
  - Privacy Policy
  - Terms & Conditions
  - Refund/Return policy
  - Shipping policy

## D) Content & design (keep ready)
- Homepage
- Category pages (Inverter / Solar / UPS)
- Single product page layout
- WhatsApp button (keep for quick conversion)

## E) Go-live checklist (later)
- Turn OFF staging password protection
- Remove noindex / allow indexing
- Switch Razorpay to **Live Mode** keys
- Add real domain and SSL
- Update DNS
- Add Search Console + GA4
- Test 5 real orders end-to-end:
  - UPI, Card, COD
  - Order emails
  - Stock reduction
  - Invoice generation

## F) What I need from you (when you’re ready)
- Your domain name (or whether you want a new one)
- The exact pincodes you deliver to in Baraut & Ghaziabad
- Razorpay account status (created / verified)
- GST details for invoice format
