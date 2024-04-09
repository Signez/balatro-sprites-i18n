const fs = require("node:fs");
const { generateTarotsSheet } = require("./src/tarots");
const { generateBoostersSheet } = require("./src/boosters");
const { generateVouchersSheet } = require("./src/vouchers");
const { generateBlindChipsSheet } = require("./src/blind_chips");
const { generateJokersSheet } = require("./src/jokers");
const { generateShopSignAnimationSheet } = require("./src/shop");
const { generateDeckContentSheet } = require("./src/deck_content");
const { alphaDiscrepanciesCoordinates } = require("./test/check-alpha");
const path = require("node:path");

const locale = process.argv[2] ?? "fr";

// Ensure the output directory exist for this locale
fs.mkdirSync(`dist/${locale}/1x`, { recursive: true });
fs.mkdirSync(`dist/${locale}/2x`, { recursive: true });

const fontPath = fs.realpathSync(
  "assets/balatro-extended-consumable-cards.ttf"
);
const zoneData = JSON.parse(fs.readFileSync("blanks/zones.json", "utf8"));

const consumablesLocales = JSON.parse(
  fs.readFileSync(`locales/${locale}/consumables.json`, "utf8")
);

const logAndReturn2x = (gen) =>
  gen.then(([oneDest, twoDest, ...otherDest]) => {
    console.log(`Generated: ${oneDest}`);
    console.log(`Generated: ${twoDest}`);
    otherDest.forEach((dest) => console.log(`Generated: ${dest}`));
    return twoDest;
  });

Promise.all(
  [
    generateTarotsSheet(locale, zoneData, consumablesLocales, fontPath),
    generateBoostersSheet(locale, zoneData, consumablesLocales),
    generateVouchersSheet(locale, zoneData, consumablesLocales),
    generateBlindChipsSheet(locale, zoneData, consumablesLocales),
    generateShopSignAnimationSheet(locale, zoneData, consumablesLocales),
    generateJokersSheet(locale, zoneData, consumablesLocales),
    generateDeckContentSheet(locale, zoneData),
  ].map(logAndReturn2x)
)
  .then((twoDests) => {
    const comparisons = twoDests.map(async (generatedSheet) => {
      const referenceSheet = "test/reference/" + path.basename(generatedSheet);

      if (fs.existsSync(referenceSheet)) {
        const discrepancies = await alphaDiscrepanciesCoordinates(
          referenceSheet,
          generatedSheet
        );

        if (discrepancies.length) {
          console.error(
            `E: Discrepancies found in ${path.basename(generatedSheet)}`
          );
          console.error(discrepancies);
          return true;
        }

        return false;
      }
    });

    return Promise.all(comparisons);
  })
  .then((results) => {
    if (!results.some(Boolean)) {
      console.log(
        "No discrepancies found in alpha between original and reference sheets. All good!"
      );
    }
  });
