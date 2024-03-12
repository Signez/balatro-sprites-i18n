const sharp = require("sharp");

function alphaDiscrepanciesCoordinates(
  referenceImageFilename,
  generatedImageFilename
) {
  // Check both images and compare their alpha channels.
  // Output coordinates of all the pixels that are not equal between the alpha channels.

  const referenceImage = sharp(referenceImageFilename);
  const generatedImage = sharp(generatedImageFilename);

  return Promise.all([
    referenceImage.ensureAlpha().extractChannel("alpha"),
    generatedImage.ensureAlpha().extractChannel("alpha"),
  ])
    .then(() =>
      Promise.all([
        referenceImage.raw().toBuffer({ resolveWithObject: true }),
        generatedImage.raw().toBuffer({ resolveWithObject: true }),
      ])
    )
    .then(([{ data: refAlpha, info: refInfo }, { data: genAlpha }]) => {
      const discrepancies = [];
      for (let i = 0; i < refAlpha.length; i++) {
        if (refAlpha[i] !== genAlpha[i]) {
          const x = i % refInfo.width;
          const y = Math.floor(i / refInfo.width);
          discrepancies.push({ x, y });
        }
      }

      return discrepancies;
    });
}

module.exports = { alphaDiscrepanciesCoordinates };
