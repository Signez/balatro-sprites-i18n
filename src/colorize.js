function swapColors({ data, info }, needleColor, targetColor) {
  const { channels } = info;
  const needle = Buffer.from(needleColor);
  const target = Buffer.from(targetColor);

  for (let i = 0; i < data.length; i += channels) {
    if (
      data[i] === needle[0] &&
      data[i + 1] === needle[1] &&
      data[i + 2] === needle[2] &&
      (channels === 3 || data[i + 3] === needle[3])
    ) {
      data[i] = target[0];
      data[i + 1] = target[1];
      data[i + 2] = target[2];
      if (channels === 4) {
        data[i + 3] = target[3];
      }
    }
  }

  return { data, info };
}

function swapColorsIf({
  image,
  referenceImage,
  deltaXInRef,
  deltaYInRef,
  ifColorInReference,
  andColorInImage,
  thenColor,
}) {
  const { data, info } = image;
  const { data: referenceData, info: referenceInfo } = referenceImage;

  const { channels, width } = info;
  const referenceChannels = referenceInfo.channels;
  const ifColor = Buffer.from(ifColorInReference);
  const andColor = Buffer.from(andColorInImage);
  const thenColorBuffer = Buffer.from(thenColor);

  for (let i = 0; i < data.length; i += channels) {
    const x = (i / channels) % width;
    const y = Math.floor(i / (channels * width));
    const xInRef = deltaXInRef + x;
    const yInRef = deltaYInRef + y;
    const iInRef =
      xInRef * referenceChannels +
      yInRef * referenceInfo.width * referenceChannels;

    if (
      referenceData[iInRef] === ifColor[0] &&
      referenceData[iInRef + 1] === ifColor[1] &&
      referenceData[iInRef + 2] === ifColor[2] &&
      (referenceChannels === 3 || referenceData[iInRef + 3] === ifColor[3])
    ) {
      if (
        data[i] === andColor[0] &&
        data[i + 1] === andColor[1] &&
        data[i + 2] === andColor[2] &&
        (channels === 3 || data[i + 3] === andColor[3])
      ) {
        data[i] = thenColorBuffer[0];
        data[i + 1] = thenColorBuffer[1];
        data[i + 2] = thenColorBuffer[2];
        if (channels === 4) {
          data[i + 3] = thenColorBuffer[3];
        }
      }
    }
  }

  return { data, info };
}

function swapUsingGradient({ data, info }, needleColor, fromColor, toColor) {
  // Swap all pixels that uses the needleColor with a color that is a VERTICAL
  // gradient from fromColor to toColor.
  const { channels, width, height } = info;
  const needle = Buffer.from(needleColor);

  const from = Buffer.from(fromColor);
  const to = Buffer.from(toColor);

  for (let i = 0; i < data.length; i += channels) {
    if (
      data[i] === needle[0] &&
      data[i + 1] === needle[1] &&
      data[i + 2] === needle[2] &&
      (channels === 3 || data[i + 3] === needle[3])
    ) {
      const y = Math.floor(i / (width * channels));
      const gradient = from.map((fromChannel, channelIndex) => {
        const toChannel = to[channelIndex];
        const fromToDelta = toChannel - fromChannel;
        const yDelta = y / height;
        return Math.round(fromChannel + fromToDelta * yDelta);
      });

      data[i] = gradient[0];
      data[i + 1] = gradient[1];
      data[i + 2] = gradient[2];
      if (channels === 4) {
        data[i + 3] = gradient[3];
      }
    }
  }

  return { data, info };
}

module.exports = {
  swapColors,
  swapUsingGradient,
  swapColorsIf,
};
