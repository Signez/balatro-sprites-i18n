const sharp = require("sharp");

function generateShopSignAnimationSheet(zoneData, consumablesLocales) {
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

    return sharp("locales/fr/" + composite.filename)
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
      .toFile("dist/fr/ShopSignAnimation.png")
  );
}

module.exports = {
  generateShopSignAnimationSheet,
};
