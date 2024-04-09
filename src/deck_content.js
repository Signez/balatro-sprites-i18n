const sharp = require("sharp");
const { swapColors, swapUsingGradient } = require("./colorize");

function generateDeckContentSheet(locale, zoneData) {
  const blanks = [
    {
      filename: "blanks/8BitDeck.png",
      kind: "normal",
      destinations: {
        "1x": `dist/${locale}/1x/8BitDeck.png`,
        "2x": `dist/${locale}/2x/8BitDeck.png`,
      },
      composites: [],
    },
    {
      filename: "blanks/8BitDeck_opt2.png",
      kind: "high_contrast",
      destinations: {
        "1x": `dist/${locale}/1x/8BitDeck_opt2.png`,
        "2x": `dist/${locale}/2x/8BitDeck_opt2.png`,
      },
      composites: [],
    },
  ];

  const ranks = ["ace", "jack", "queen", "king"];
  const allClasses = zoneData.deck_content.classes;

  ranks.forEach((rank) => {
    const rules = zoneData.deck_content[rank];

    blanks.forEach((blank) => {
      blank.composites.push(
        ...rules.locations_with_classes.map(([x, y, classes]) => {
          const classRule = allClasses[classes];

          return {
            buffer: null,
            info: null,
            filename: rules.filename,
            location: [x, y],
            flip: classRule.flip ?? false,
            tint: classRule[blank.kind]?.tint ?? classRule?.tint,
            gradient: classRule[blank.kind]?.from
              ? {
                  from: classRule[blank.kind]?.from,
                  to: classRule[blank.kind]?.to,
                }
              : null,
          };
        })
      );
    });
  });

  return Promise.all(
    blanks.flatMap((blank, i) =>
      blank.composites.map((composite) => {
        let image = sharp(
          `locales/${locale}/ranks/${composite.filename}`
        ).raw();

        if (composite.flip) {
          image = image.flip().flop();
        }

        return image
          .toBuffer({ resolveWithObject: true })
          .then(({ data, info }) => {
            let newData = Buffer.from(data);

            const black = [0, 0, 0, 255];

            if (composite.tint) {
              newData = swapColors({ data, info }, black, composite.tint).data;
            } else if (composite.gradient) {
              newData = swapUsingGradient(
                { data, info },
                black,
                composite.gradient.from,
                composite.gradient.to
              ).data;
            }

            return { data: newData, info };
          })
          .then(({ data, info }) => {
            composite.data = data;
            composite.info = info;
          });
      })
    )
  )
    .then(() =>
      Promise.all(
        blanks.map((blank) =>
          sharp(blank.filename)
            .composite(
              blank.composites.flatMap((composite) => {
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
            .raw()
            .toBuffer({ resolveWithObject: true })
            .then(({ data, info }) =>
              Promise.all([
                sharp(data, { raw: info })
                  .resize(info.width / 2, info.height / 2, {
                    kernel: sharp.kernel.nearest,
                  })
                  .toFile(blank.destinations["1x"])
                  .then(() => blank.destinations["1x"]),
                sharp(data, { raw: info })
                  .toFile(blank.destinations["2x"])
                  .then(() => blank.destinations["2x"]),
              ])
            )
        )
      )
    )
    .then((promises) => {
      const flatten = promises.flat();
      return flatten;
    });
}

module.exports = {
  generateDeckContentSheet,
};
