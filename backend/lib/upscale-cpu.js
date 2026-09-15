const sharp = require("sharp");

async function cpuUpscale(inputPath, outputPath, scale) {
  const metadata = await sharp(inputPath).metadata();
  const finalW = metadata.width * scale;
  const finalH = metadata.height * scale;

  await sharp(inputPath)
    .resize(finalW, finalH, {
      kernel: sharp.kernel.lanczos3,
      fit: "fill",
    })
    .sharpen({ sigma: 1.0, m1: 1.5, m2: 0.5 })
    .normalise()
    .png({ quality: 100 })
    .toFile(outputPath);

  return outputPath;
}

module.exports = { cpuUpscale };
