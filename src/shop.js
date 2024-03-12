const sharp = require("sharp");

function generateShopSignAnimationSheet(locale, zoneData, consumablesLocales) {
  const oneDest = `dist/${locale}/1x/ShopSignAnimation.png`;
  const twoDest = `dist/${locale}/2x/ShopSignAnimation.png`;

  const stickersKeys = Object.keys(zoneData.shop_sign_animation.stickers);
  const overrides = consumablesLocales.overrides["ShopSignAnimation.png"] ?? {};

  const composites = [];
  composites.push(
    ...stickersKeys.map((stickerKey) => {
      let sticker = zoneData.shop_sign_animation.stickers[stickerKey];

      if (overrides[stickerKey]) {
        sticker = { ...sticker, ...overrides[stickerKey] };
      }

      return {
        key: stickerKey,
        filename: sticker.filename,
        locations: sticker.locations,
        buffer: null,
        info: null,
      };
    })
  );

  const preprocesses = Object.values(composites).map((composite) => {
    if (!composite.filename) return Promise.resolve(null);

    return sharp(`locales/${locale}/${composite.filename}`)
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        composite.data = data;
        composite.info = info;
      });
  });

  return Promise.all(preprocesses).then(() =>
    sharp("blanks/ShopSignAnimation.png")
      .composite(
        composites.flatMap((composite) => {
          if (!composite.info) return [];

          const { width, height, channels } = composite.info;

          return composite.locations.map(([left, top]) => {
            return {
              input: composite.data,
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
            .toFile(oneDest)
            .then(() => oneDest),
          sharp(data, { raw: info })
            .toFile(twoDest)
            .then(() => twoDest),
        ])
      )
  );
}

module.exports = {
  generateShopSignAnimationSheet,
};
