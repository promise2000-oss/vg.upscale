const sharp = require("sharp");
const ort = require("onnxruntime-node");
const path = require("path");

let session = null;

async function getSession() {
  if (!session) {
    const modelPath = path.join(__dirname, "..", "models", "RealESRGAN_x4plus.onnx");
    session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ["cpu"],
      graphOptimizationLevel: "all",
    });
    console.log("ONNX model loaded:", session.inputNames, "->", session.outputNames);
  }
  return session;
}

const TILE_SIZE = 128;

async function processTile(session, tileBuf, tileW, tileH) {
  const inputData = new Float32Array(tileW * tileH * 3);
  for (let i = 0; i < tileW * tileH; i++) {
    inputData[i * 3] = tileBuf[i * 3] / 255.0;
    inputData[i * 3 + 1] = tileBuf[i * 3 + 1] / 255.0;
    inputData[i * 3 + 2] = tileBuf[i * 3 + 2] / 255.0;
  }

  const inputTensor = new ort.Tensor("float32", inputData, [1, 3, tileH, tileW]);
  const feeds = {};
  feeds[session.inputNames[0]] = inputTensor;

  const results = await session.run(feeds);
  const outputData = results[session.outputNames[0]].data;
  return outputData;
}

async function onnxUpscale(inputPath, outputPath, scale) {
  const img = sharp(inputPath);
  const metadata = await img.metadata();
  let { width, height, channels } = metadata;
  channels = channels || 3;

  const rawBuf = await img.raw().toBuffer();

  const paddedW = Math.ceil(width / TILE_SIZE) * TILE_SIZE;
  const paddedH = Math.ceil(height / TILE_SIZE) * TILE_SIZE;

  const paddedBuf = Buffer.alloc(paddedW * paddedH * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * channels;
      const dstIdx = (y * paddedW + x) * 3;
      paddedBuf[dstIdx] = rawBuf[srcIdx];
      paddedBuf[dstIdx + 1] = rawBuf[srcIdx + 1];
      paddedBuf[dstIdx + 2] = rawBuf[srcIdx + 2];
    }
  }

  const outW = paddedW * scale;
  const outH = paddedH * scale;
  const outBuf = Buffer.alloc(outW * outH * 3);

  const session = await getSession();
  const tilesX = paddedW / TILE_SIZE;
  const tilesY = paddedH / TILE_SIZE;

  console.log(`Processing ${tilesX}x${tilesY} tiles (${paddedW}x${paddedH} -> ${outW}x${outH})`);

  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const tileBuf = Buffer.alloc(TILE_SIZE * TILE_SIZE * 3);
      for (let y = 0; y < TILE_SIZE; y++) {
        for (let x = 0; x < TILE_SIZE; x++) {
          const srcIdx = ((ty * TILE_SIZE + y) * paddedW + (tx * TILE_SIZE + x)) * 3;
          const dstIdx = (y * TILE_SIZE + x) * 3;
          tileBuf[dstIdx] = paddedBuf[srcIdx];
          tileBuf[dstIdx + 1] = paddedBuf[srcIdx + 1];
          tileBuf[dstIdx + 2] = paddedBuf[srcIdx + 2];
        }
      }

      const outputData = await processTile(session, tileBuf, TILE_SIZE, TILE_SIZE);
      const outTileW = TILE_SIZE * scale;
      const outTileH = TILE_SIZE * scale;

      for (let y = 0; y < outTileH; y++) {
        for (let x = 0; x < outTileW; x++) {
          const srcIdx = (y * outTileW + x) * 3;
          const dstY = ty * outTileH + y;
          const dstX = tx * outTileW + x;
          const dstIdx = (dstY * outW + dstX) * 3;
          const r = Math.min(Math.max(Math.round(outputData[srcIdx] * 255.0), 0), 255);
          const g = Math.min(Math.max(Math.round(outputData[srcIdx + 1] * 255.0), 0), 255);
          const b = Math.min(Math.max(Math.round(outputData[srcIdx + 2] * 255.0), 0), 255);
          outBuf[dstIdx] = r;
          outBuf[dstIdx + 1] = g;
          outBuf[dstIdx + 2] = b;
        }
      }
    }
  }

  const finalW = width * scale;
  const finalH = height * scale;

  await sharp(outBuf, { raw: { width: outW, height: outH, channels: 3 } })
    .extract({ left: 0, top: 0, width: finalW, height: finalH })
    .png({ quality: 100 })
    .toFile(outputPath);

  return outputPath;
}

module.exports = { onnxUpscale };
