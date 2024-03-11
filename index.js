const sharp = require("sharp");
const fs = require("node:fs");
const { generateTarotsSheet } = require("./src/tarots");
const { generateBoostersSheet } = require("./src/boosters");
const { generateVouchersSheet } = require("./src/vouchers");
const { generateBlindChipsSheet } = require("./src/blind_chips");
const { generateJokersSheet } = require("./src/jokers");
const { generateShopSignAnimationSheet } = require("./src/shop");

// Ensure the output directory exist for this locale
fs.mkdirSync("dist/fr/1x", { recursive: true });
fs.mkdirSync("dist/fr/2x", { recursive: true });

const fontPath = fs.realpathSync(
  "assets/balatro-extended-consumable-cards.ttf"
);
const zoneData = JSON.parse(fs.readFileSync("blanks/zones.json", "utf8"));

const consumablesLocales = JSON.parse(
  fs.readFileSync("locales/fr/consumables.json", "utf8")
);

generateTarotsSheet(zoneData, consumablesLocales, fontPath).then(() =>
  console.log("Tarots sheet generated.")
);

generateBoostersSheet(zoneData, consumablesLocales).then(() =>
  console.log("Boosters sheet generated.")
);

generateVouchersSheet(zoneData, consumablesLocales).then(() =>
  console.log("Vouchers sheet generated.")
);

generateBlindChipsSheet(zoneData, consumablesLocales).then(() =>
  console.log("Blind chips sheet generated.")
);

generateShopSignAnimationSheet(zoneData, consumablesLocales).then(() =>
  console.log("Shop sign animation sheet generated.")
);

generateJokersSheet(zoneData, consumablesLocales).then(() =>
  console.log("Jokers sheet generated.")
);