const sharp = require("sharp");

function generateJokersSheet(locale, zoneData, consumablesLocales) {
  const oneDest = `dist/${locale}/1x/Jokers.png`;
  const twoDest = `dist/${locale}/2x/Jokers.png`;

  const jokersKeys = Object.keys(zoneData.jokers);
  const overrides = consumablesLocales.overrides["Jokers.png"] ?? {};

  const composites = [];
  composites.push(
    ...jokersKeys.map((jokerKey) => {
      let joker = zoneData.jokers[jokerKey];

      if (overrides[jokerKey]) {
        joker = { ...joker, ...overrides[jokerKey] };
      }

      return {
        key: jokerKey,
        filename: joker.filename,
        location: joker.location,
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
    sharp("blanks/Jokers.png")
      .composite(
        composites.flatMap((composite) => {
          if (!composite.info) return [];

          const { width, height, channels } = composite.info;
          const [left, top] = composite.location;

          return [
            {
              input: composite.data,
              raw: {
                width,
                height,
                channels,
              },
              left,
              top,
            },
          ];
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
  generateJokersSheet,
};
