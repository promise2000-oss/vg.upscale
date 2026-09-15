const sharp = require("sharp");

async function cpuUpscale(inputPath, outputPath, scale) {
  const metadata = await sharp(inputPath).metadata();
  const origW = metadata.width;
  const origH = metadata.height;

  let currentW = origW;
  let currentH = origH;
  let buf = await sharp(inputPath).png().toBuffer();

  const passes = scale <= 2 ? 1 : scale <= 3 ? 2 : 3;
  const passScale = Math.pow(scale, 1 / passes);

  for (let i = 0; i < passes; i++) {
    currentW = Math.round(currentW * passScale);
    currentH = Math.round(currentH * passScale);

    buf = await sharp(buf)
      .resize(currentW, currentH, {
        kernel: sharp.kernel.lanczos3,
        fit: "fill",
      })
      .sharpen({ sigma: 0.8, m1: 2.0, m2: 0.3 })
      .normalise()
      .modulate({ brightness: 1.03, contrast: 1.06 })
      .toBuffer();
  }

  const finalW = origW * scale;
  const finalH = origH * scale;

  await sharp(buf)
    .resize(finalW, finalH, {
      kernel: sharp.kernel.lanczos3,
      fit: "fill",
    })
    .sharpen({ sigma: 0.5, m1: 1.2, m2: 0.4 })
    .png({ quality: 100 })
    .toFile(outputPath);

  return outputPath;
}

module.exports = { cpuUpscale };
