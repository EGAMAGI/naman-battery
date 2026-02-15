import fs from "node:fs";
import path from "node:path";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        const next = text[i + 1];
        if (next === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (ch === "\n") {
      row.push(field);
      field = "";
      // Handle CRLF
      if (row.length === 1 && row[0] === "") {
        row = [];
        continue;
      }
      rows.push(row);
      row = [];
      continue;
    }

    if (ch === "\r") continue;

    field += ch;
  }

  // last field
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function toCsvCell(value) {
  const s = String(value ?? "");
  if (/[\n\r",]/.test(s)) return '"' + s.replaceAll('"', '""') + '"';
  return s;
}

function toCsv(rows) {
  return rows.map(r => r.map(toCsvCell).join(",")).join("\n") + "\n";
}

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

function main() {
  const input = process.argv[2] || "products-template.csv";
  const output = process.argv[3] || "google-catalog.csv";

  const inputPath = path.resolve(process.cwd(), input);
  const outputPath = path.resolve(process.cwd(), output);

  const raw = fs.readFileSync(inputPath, "utf8");
  const rows = parseCsv(raw);
  if (!rows.length) throw new Error("Empty CSV");

  const header = rows[0].map(h => String(h || "").trim());
  const idx = name => header.findIndex(h => h.toLowerCase() === name.toLowerCase());

  const iSku = idx("sku");
  const iName = idx("name");
  const iBrand = idx("brand");
  const iCategory = idx("category");
  const iPrice = idx("price");
  const iSale = idx("sale_price");
  const iAh = idx("capacity_ah");
  const iImage = idx("image_url");

  const outRows = [];
  outRows.push(["id", "Categories", "AH", "brand", "Name", "name_hi", "Regular price", "Offer%", "sale_price", "image"]);

  for (let r = 1; r < rows.length; r += 1) {
    const row = rows[r];
    if (!row || row.every(v => !String(v || "").trim())) continue;

    const sku = iSku >= 0 ? row[iSku] : "";
    const name = iName >= 0 ? row[iName] : "";
    const brand = iBrand >= 0 ? row[iBrand] : "";
    const category = iCategory >= 0 ? row[iCategory] : "";
    const regular = iPrice >= 0 ? row[iPrice] : "";
    const sale = iSale >= 0 ? row[iSale] : "";
    const ah = iAh >= 0 ? row[iAh] : "";
    const image = iImage >= 0 ? row[iImage] : "";

    const offerPct = computeOfferPercent(regular, sale);

    outRows.push([
      sku,
      category,
      ah,
      brand,
      name,
      "", // name_hi not present in products-template.csv
      regular,
      offerPct,
      sale,
      image,
    ]);
  }

  fs.writeFileSync(outputPath, toCsv(outRows), "utf8");
  console.log(`Wrote ${outRows.length - 1} rows to ${path.relative(process.cwd(), outputPath)}`);
}

main();
