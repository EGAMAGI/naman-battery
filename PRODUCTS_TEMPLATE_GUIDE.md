# Product CSV Template Guide

This repo includes 2 templates:

- [products-template.csv](products-template.csv): simple, clean format (good for keeping your catalog data in one place).
- [products-template-woocommerce.csv](products-template-woocommerce.csv): WooCommerce import-ready columns (for WordPress + WooCommerce).

## 1) Simple template (recommended to maintain)
File: `products-template.csv`

### Columns
- `sku` (required): unique code for each product (example: `EX-150AH-01`)
- `name` (required)
- `brand` (optional but recommended)
- `category` (recommended): `inverter` / `solar` / `ups`
- `price` (number): regular price
- `sale_price` (number, optional)
- `stock_qty` (number, optional): leave blank if you don’t track stock
- `warranty_months` (number, optional)
- `capacity_ah` (number, optional)
- `voltage` (optional): `12V` / `24V`
- `description` (optional but recommended)
- `image_url` (recommended): full public URL (https://...)
- `city_available` (optional): `Baraut|Ghaziabad` or only `Baraut`

### Rules
- Don’t repeat the same SKU.
- Use numbers only in `price`, `sale_price`, `stock_qty`.
- `image_url` must be a direct image link (jpg/png/webp). If images are not hosted yet, keep it blank and fill later.

## 2) WooCommerce import template
File: `products-template-woocommerce.csv`

### How to import
1. WordPress → WooCommerce → Products → **Import**
2. Upload the CSV
3. In the “Column mapping” step, WooCommerce will auto-match most fields
4. Run the import

### Notes for your case (Baraut/Ghaziabad only + ₹200 delivery)
- Shipping restriction is usually done in WooCommerce **Shipping Zones** and/or a checkout validation plugin (city/pincode based).
- Product CSV does not enforce city restriction automatically; that’s handled during checkout/shipping settings.

## Common mistakes
- Putting `₹` sign in price fields (don’t). Use `15500`, not `₹15500`.
- Using private Google Drive links for images (won’t work). Images must be publicly accessible.
- Having commas inside CSV fields without quotes. If you write descriptions with commas, keep them inside quotes.

## 3) Google catalog CSV (for ads / listings)

Template format:
- `google-catalog-template.csv`

Auto-generate from `products-template.csv`:
1. Run:
	- `node tools/generate-google-catalog.mjs products-template.csv google-catalog.csv`
2. Upload `google-catalog.csv` wherever you need it.

Output columns:
- `id, Categories, AH, brand, Name, name_hi, Regular price, Offer%, sale_price, image`

## 4) Update products via Google Sheet (live website)

The website loads products from a Google Sheet using OpenSheet:
- In code: `SHEET_URL` in `app.js`
- Format: `https://opensheet.elk.sh/<SHEET_ID>/<TAB_NAME>`

### How to update
1. Open your Google Sheet and edit/add rows.
2. Make sure sharing is enabled:
	- Google Sheets → **Share** → set to **Anyone with the link: Viewer**
3. Refresh the website page to see updates.

### Columns to keep in the Sheet
Recommended columns (used by the site):
- `name_en` (or `name`)
- `brand`
- `category`
- `price` (number)
- `sale_price` (optional)
- `stock` (optional)
- `warranty_months` (optional)
- `rating` (optional)
- `image_url` (recommended: full public URL like `https://.../image.jpg`)
- `image` (fallback: filename that exists in `/images/`)

## 5) Generate Google catalog CSV directly from your Google Sheet

If you want one single source of truth (Google Sheet) and still produce `google-catalog.csv`, use:
- `node tools/generate-google-catalog-from-sheet.mjs --sheet "<GOOGLE_SHEET_LINK>" --tab Sheet1 --out google-catalog.csv`

Example (replace with your real link):
- `node tools/generate-google-catalog-from-sheet.mjs --sheet "https://docs.google.com/spreadsheets/d/<ID>/edit#gid=0" --tab Sheet1 --out google-catalog.csv`
