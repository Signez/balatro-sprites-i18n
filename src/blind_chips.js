const sharp = require("sharp");
const { swapColors, swapColorsIf } = require("./colorize");

function generateBlindChipsSheet(zoneData, consumablesLocales) {
  const stickersKeys = Object.keys(zoneData.blind_chips.stickers);
  const overrides = consumablesLocales.overrides["BlindChips.png"] ?? {};

  const composites = [];
  composites.push(
    ...stickersKeys.map((stickerKey) => {
      let sticker = zoneData.blind_chips.stickers[stickerKey];

      if (overrides[stickerKey]) {
        sticker = { ...sticker, ...overrides[stickerKey] };
      }

      return {
        key: stickerKey,
        filename: sticker.filename,
        locations: sticker.locations,
        buffer: null,
        info: null,
        tint: sticker.tint,
        ifColorInBlank: sticker.ifColorInBlank,
        thenColor: sticker.thenColor,
      };
    })
  );

  let blindChipsBlank = { data: null, info: null };

  const blindTask = sharp("blanks/BlindChips.png")
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => {
      blindChipsBlank.data = data;
      blindChipsBlank.info = info;
    });

  const preprocesses = Object.values(composites)
    .map((composite) => {
      if (!composite.filename) return Promise.resolve(null);

      return sharp("locales/fr/" + composite.filename)
        .raw()
        .toBuffer({ resolveWithObject: true })
        .then(({ data, info }) => {
          let newData = Buffer.from(data);

          const black = [0, 0, 0, 255];

          if (composite.tint) {
            newData = swapColors({ data, info }, black, composite.tint).data;
          }

          return { data: newData, info };
        })
        .then(({ data, info }) => {
          composite.data = data;
          composite.info = info;
        });
    })
    .concat([blindTask]);

  return Promise.all(preprocesses).then(() =>
    sharp("blanks/BlindChips.png")
      .composite(
        composites.flatMap((composite) => {
          if (!composite.info) return [];

          const { width, height, channels } = composite.info;

          return composite.locations.map(([left, top]) => {
            const bufferWithEffect = swapColorsIf({
              image: {
                data: Buffer.from(composite.data),
                info: composite.info,
              },
              referenceImage: blindChipsBlank,
              deltaXInRef: left,
              deltaYInRef: top,
              ifColorInReference: composite.ifColorInBlank,
              andColorInImage: composite.tint,
              thenColor: composite.thenColor,
            }).data;

            return {
              input: bufferWithEffect,
              raw: {
                width,
                height,
                channels,
              },
              left,
              top,
            };
          });
        })
      )
      .toFile("dist/fr/BlindChips.png")
  );
}

module.exports = {
  generateBlindChipsSheet,
};
