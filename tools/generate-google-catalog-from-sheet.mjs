import fs from "node:fs";
import path from "node:path";

function toNumber(value) {
  const n = Number(String(value ?? "").trim());
  return Number.isFinite(n) ? n : null;
}

function computeOfferPercent(regularPrice, salePrice) {
  const rp = toNumber(regularPrice);
  const sp = toNumber(salePrice);
  if (!rp || !sp) return "";
  if (rp <= 0 || sp <= 0 || sp >= rp) return "";
  return String(Math.round(((rp - sp) / rp) * 100));
}

function toCsvCell(value) {
  const s = String(value ?? "");
  if (/[\n\r",]/.test(s)) return '"' + s.replaceAll('"', '""') + '"';
  return s;
}

function toCsv(rows) {
  return rows.map(r => r.map(toCsvCell).join(",")).join("\n") + "\n";
}

function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return "";
  return process.argv[idx + 1] ?? "";
}

function extractSheetId(sheetUrlOrId) {
  const raw = String(sheetUrlOrId || "").trim();
  if (!raw) return "";

  // If user passed the ID directly
  if (!raw.includes("/")) return raw;

  // Typical: https://docs.google.com/spreadsheets/d/<ID>/edit?gid=0#gid=0
  const m = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return m ? m[1] : "";
}

function pick(obj, keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return "";
}

async function fetchJson(url) {
  const resp = await fetch(url, { cache: "no-store" });
  if (!resp.ok) throw new Error(`Fetch failed: ${resp.status} ${resp.statusText}`);
  const data = await resp.json();
  return data;
}

async function main() {
  const sheet = getArg("--sheet") || process.argv[2] || "";
  const tab = getArg("--tab") || process.argv[3] || "Sheet1";
  const output = getArg("--out") || process.argv[4] || "google-catalog.csv";

  const sheetId = extractSheetId(sheet);
  if (!sheetId) {
    console.error("Usage:");
    console.error("  node tools/generate-google-catalog-from-sheet.mjs --sheet <google-sheet-link-or-id> --tab <Sheet1> --out google-catalog.csv");
    console.error("Example:");
    console.error("  node tools/generate-google-catalog-from-sheet.mjs --sheet https://docs.google.com/spreadsheets/d/XXXX/edit#gid=0 --tab Sheet1 --out google-catalog.csv");
    process.exit(1);
  }

  const opensheetUrl = `https://opensheet.elk.sh/${sheetId}/${encodeURIComponent(tab)}`;
  const rows = await fetchJson(opensheetUrl);
  if (!Array.isArray(rows) || rows.length === 0) throw new Error("Sheet returned no rows");

  const outRows = [];
  outRows.push(["id", "Categories", "AH", "brand", "Name", "name_hi", "Regular price", "Offer%", "sale_price", "image"]);

  for (const r of rows) {
    if (!r || typeof r !== "object") continue;

    const id = pick(r, ["id", "sku", "product_id"]);
    const category = pick(r, ["Categories", "categories", "category"]);
    const ah = pick(r, ["AH", "ah", "capacity_ah", "capacity"]);
    const brand = pick(r, ["brand", "Brand"]);
    const name = pick(r, ["Name", "name_en", "name"]);
    const nameHi = pick(r, ["name_hi", "Name_hi", "hindi_name"]);

    const regular = pick(r, ["Regular price", "regular_price", "mrp", "mrp_price", "price"]);
    const sale = pick(r, ["sale_price", "offer_price", "offer", "Offer price", "offerPrice"]);

    const image = pick(r, ["image_url", "imageUrl", "image"]);

    const offerPct = computeOfferPercent(regular, sale);

    // Skip blank rows
    if (!String(id).trim() && !String(name).trim()) continue;

    outRows.push([
      id,
      category,
      ah,
      brand,
      name,
      nameHi,
      regular,
      offerPct,
      sale,
      image,
    ]);
  }

  const outputPath = path.resolve(process.cwd(), output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, toCsv(outRows), "utf8");

  console.log(`OpenSheet: ${opensheetUrl}`);
  console.log(`Wrote ${outRows.length - 1} rows to ${path.relative(process.cwd(), outputPath)}`);
}

main().catch(err => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
