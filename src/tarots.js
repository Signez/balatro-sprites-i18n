const sharp = require("sharp");
const fs = require("node:fs");

function generateTarotsSheet(zoneData, consumablesLocales, fontPath) {
  const tarotsKeys = Object.keys(zoneData.tarots.anchors);
  const planetsKeys = Object.keys(zoneData.planets.anchors);
  const spectralsKeys = Object.keys(zoneData.spectrals.anchors);

  const composites = [];
  composites.push(
    ...tarotsKeys.map((tarotKey) => ({
      collection: "tarots",
      key: tarotKey,
      text: consumablesLocales.tarots[tarotKey],
      anchor: zoneData.tarots.anchors[tarotKey],
      buffer: null,
      info: null,
    }))
  );
  composites.push(
    ...planetsKeys.map((planetKey) => ({
      collection: "planets",
      key: planetKey,
      text: consumablesLocales.planets[planetKey],
      anchor: zoneData.planets.anchors[planetKey],
      buffer: null,
      info: null,
    }))
  );
  composites.push(
    ...spectralsKeys.map((spectralKey) => ({
      collection: "spectrals",
      key: spectralKey,
      text: consumablesLocales.spectrals[spectralKey],
      anchor: zoneData.spectrals.anchors[spectralKey],
      buffer: null,
      info: null,
    }))
  );

  const overrides = Object.values(consumablesLocales.overrides["Tarots.png"]);

  const labelWork = Object.values(composites).map((composite) => {
    if (!composite.text) return Promise.resolve(null);

    return sharp({
      text: {
        text: composite.text,
        font: "Balatro Extended (Consumable Cards)",
        dpi: 36,
        fontfile: fontPath,
      },
    })
      .threshold(250)
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        let [r, g, b] = zoneData[composite.collection].text_color;
        return sharp(data, { raw: info })
          .resize(info.width * 2, info.height * 2, {
            kernel: sharp.kernel.nearest,
          })
          .negate({ alpha: false })
          .unflatten()
          .composite([
            {
              input: {
                create: {
                  width: info.width * 2,
                  height: info.height * 2,
                  channels: 4,
                  background: { r, g, b, alpha: 1 },
                },
              },
              blend: "atop",
            },
          ])
          .toBuffer({ resolveWithObject: true });
      })
      .then(({ data, info }) => {
        composite.data = data;
        composite.info = info;
      });
  });

  return Promise.all(labelWork).then(() =>
    sharp("blanks/Tarots.png")
      .composite(
        composites
          .flatMap((composite) => {
            if (!composite.info) return [];

            const key = composite.key;
            const buffer = composite.data;
            const { width, height, channels } = composite.info;

            const [anchorLeft, anchorTop] = composite.anchor;
            const zoneConstants = zoneData[composite.collection];
            const labelBackgrounds = zoneConstants.label_backgrounds;

            const background = Object.values(labelBackgrounds).find(
              (bg) => width <= bg.max_text_width
            );

            if (!background) {
              let max = Math.max(
                ...Object.values(labelBackgrounds).map(
                  (bg) => bg.max_text_width
                )
              );
              console.log(
                `Can’t write ${key} because it's too wide (${width} > ${max}).`
              );
              return [];
            }

            let zoneLeft = anchorLeft;
            let zoneWidth = background.max_text_width;
            const labelBackground = [];

            if (background.filename) {
              labelBackground.push({
                input: "blanks/" + background.filename,
                left: anchorLeft + background.deltaLeft,
                top: anchorTop + background.deltaTop,
              });
              zoneWidth = background.max_text_width;
              zoneLeft =
                anchorLeft +
                (background.deltaLeft ?? 0) +
                (background.paddingLeft ?? 0);
            }

            const text = {
              input: buffer,
              raw: {
                width,
                height,
                channels,
              },
              left: zoneLeft + Math.round((zoneWidth - width) / 4) * 2,
              top: anchorTop - (height > 12 ? 2 : 0),
            };
            return labelBackground.concat([text]);
          })
          .concat(
            overrides.map((override) => {
              const {
                filename,
                location: [left, top],
              } = override;

              return {
                input: "locales/fr/" + filename,
                left,
                top,
              };
            })
          )
      )
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) =>
        Promise.all([
          sharp(data, { raw: info })
            .resize(info.width / 2, info.height / 2, {
              kernel: sharp.kernel.nearest,
            })
            .toFile("dist/fr/1x/Tarots.png"),
          sharp(data, { raw: info }).toFile("dist/fr/2x/Tarots.png"),
        ])
      )
  );
}

module.exports = {
  generateTarotsSheet,
};
