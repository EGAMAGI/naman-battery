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
