const fs = require('fs');
const path = require('path');

const cardsJsonPath = path.join(__dirname, '../src/data/cards.json');
const outputPath = path.join(__dirname, '../db/seed.sql');

if (!fs.existsSync(cardsJsonPath)) {
  console.error('Source cards.json not found at', cardsJsonPath);
  process.exit(1);
}

const cards = JSON.parse(fs.readFileSync(cardsJsonPath, 'utf8'));

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'boolean') return str ? '1' : '0';
  if (typeof str === 'number') return String(str);
  return `'${String(str).replace(/'/g, "''")}'`;
}

let sqlLines = [
  '-- D1 Seed Data generated from catalog'
];

for (const card of cards) {
  const id = escapeSql(card.id);
  const name = escapeSql(card.name);
  const network = escapeSql(card.network);
  const issuer = escapeSql(card.issuer);
  const currency = escapeSql(card.currency || 'USD');
  const bin = escapeSql(card.bin || null);
  const cardArtColor = escapeSql(card.cardArtColor || null);
  const cardImage = escapeSql(card.cardImage || null);
  const feesJson = escapeSql(JSON.stringify(card.fees || {}));
  const kycJson = escapeSql(JSON.stringify(card.kycRequirements || {}));
  const openJson = escapeSql(JSON.stringify(card.openRequirements || {}));
  const scenariosJson = escapeSql(JSON.stringify(card.scenarios || {}));
  const referralUrl = escapeSql(card.referralUrl || null);
  const promoBadge = escapeSql(card.promoBadge || null);
  const isRecommended = card.isRecommended ? '1' : '0';
  const isActive = '1';

  sqlLines.push(
    `INSERT OR REPLACE INTO cards (id, name, network, issuer, currency, bin, card_art_color, card_image, fees_json, kyc_json, open_json, scenarios_json, referral_url, promo_badge, is_recommended, is_active) VALUES (${id}, ${name}, ${network}, ${issuer}, ${currency}, ${bin}, ${cardArtColor}, ${cardImage}, ${feesJson}, ${kycJson}, ${openJson}, ${scenariosJson}, ${referralUrl}, ${promoBadge}, ${isRecommended}, ${isActive});`
  );
}

fs.writeFileSync(outputPath, sqlLines.join('\n'), 'utf8');
console.log(`Successfully generated ${outputPath} with ${cards.length} cards.`);
