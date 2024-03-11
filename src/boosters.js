const sharp = require("sharp");
const { swapColors, swapUsingGradient } = require("./colorize");

function generateBoostersSheet(zoneData, consumablesLocales) {
  const stickersKeys = Object.keys(zoneData.boosters.stickers);
  const overrides = consumablesLocales.overrides["boosters.png"] ?? {};

  const composites = [];
  composites.push(
    ...stickersKeys.map((stickerKey) => {
      let sticker = zoneData.boosters.stickers[stickerKey];

      if (overrides[stickerKey]) {
        sticker = { ...sticker, ...overrides[stickerKey] };
      }

      return {
        key: stickerKey,
        filename: sticker.filename,
        location: sticker.location,
        buffer: null,
        info: null,
        colorSwaps: sticker.colorSwaps ?? [],
        gradientSwaps: sticker.gradientSwaps ?? [],
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

        let swaps = composite.colorSwaps;

        swaps.forEach(({ from, to }) => {
          const swapped = swapColors({ data, info }, from, to);
          newData = swapped.data;
        });

        let gradientSwaps = composite.gradientSwaps;

        gradientSwaps.forEach(({ needle, from, to }) => {
          const swapped = swapUsingGradient({ data, info }, needle, from, to);
          newData = swapped.data;
        });

        return { data: newData, info };
      })
      .then(({ data, info }) => {
        composite.data = data;
        composite.info = info;
      });
  });

  return Promise.all(preprocesses).then(() =>
    sharp("blanks/boosters.png")
      .composite(
        composites.flatMap((composite) => {
          if (!composite.info) return [];

          const buffer = composite.data;
          const { width, height, channels } = composite.info;

          const [left, top] = composite.location;

          return {
            input: buffer,
            raw: {
              width,
              height,
              channels,
            },
            left: left,
            top: top,
          };
        })
      )
      .toFile("dist/fr/boosters.png")
  );
}

module.exports = {
  generateBoostersSheet,
};
