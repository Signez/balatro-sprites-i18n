const sharp = require("sharp");
const { swapColors } = require("./colorize");

function generateVouchersSheet(zoneData, consumablesLocales) {
  const stickersKeys = Object.keys(zoneData.vouchers.stickers);
  const overrides = consumablesLocales.overrides["Vouchers.png"] ?? {};

  const composites = [];
  composites.push(
    ...stickersKeys.map((stickerKey) => {
      let sticker = zoneData.vouchers.stickers[stickerKey];

      if (overrides[stickerKey]) {
        sticker = { ...sticker, ...overrides[stickerKey] };
      }

      return {
        key: stickerKey,
        filename: sticker.filename,
        locations: sticker.locations,
        buffer: null,
        info: null,
        tint: sticker.tint ?? [],
      };
    })
  );

  const preprocesses = Object.values(composites).map((composite) => {
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
  });

  return Promise.all(preprocesses).then(() =>
    sharp("blanks/Vouchers.png")
      .composite(
        composites.flatMap((composite) => {
          if (!composite.info) return [];

          const buffer = composite.data;
          const { width, height, channels } = composite.info;

          return composite.locations.map(([left, top]) => {
            return {
              input: buffer,
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
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) =>
        Promise.all([
          sharp(data, { raw: info })
            .resize(info.width / 2, info.height / 2, {
              kernel: sharp.kernel.nearest,
            })
            .toFile("dist/fr/1x/Vouchers.png"),
          sharp(data, { raw: info }).toFile("dist/fr/2x/Vouchers.png"),
        ])
      )
  );
}

module.exports = {
  generateVouchersSheet,
};
