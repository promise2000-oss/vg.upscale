const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const favicon = require("serve-favicon");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const { cpuUpscale } = require("./lib/upscale-cpu");

const app = express();
const upload = multer({ dest: "uploads/" });

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://vg-upscale.vercel.app",
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept"],
  credentials: true,
}));

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "connect-src 'self'",
      "img-src 'self' blob: data:",
      "script-src 'self' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
    ].join("; ")
  );
  next();
});

app.use(express.static(path.join(__dirname, "public")));
try {
  app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
} catch (e) {
  console.warn("Favicon file not found in ./public/favicon.ico");
}

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "VG Upscale API Documentation",
}));

app.get("/api-docs.json", (req, res) => {
  res.json(swaggerDocument);
});

app.post("/upscale", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No image uploaded");
  }

  const inputPath = req.file.path;
  const outputDir = path.resolve(__dirname, "outputs");
  const modelDir = path.resolve(__dirname, "models");
  const binPath = path.resolve(__dirname, "bin", "upscayl-bin");

  const scale = Math.min(Math.max(parseInt(req.body.scale, 10) || 4, 2), 4);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `output-${Date.now()}.png`);

  console.log("Running upscaler:", binPath, `-s ${scale}`);

  const args = [
    "-i", inputPath,
    "-o", outputPath,
    "-s", String(scale),
    "-m", modelDir,
    "-n", "upscayl-standard-4x",
    "-g", "1",
  ];

  const runGpuUpscale = () =>
    new Promise((resolve, reject) => {
      execFile(binPath, args, (err, stdout, stderr) => {
        if (stdout) console.log("Upscaler stdout:", stdout);
        if (stderr) console.warn("Upscaler stderr:", stderr);
        if (err) {
          console.error("GPU upscaler failed:", err.message);
          reject(err);
        } else {
          resolve(outputPath);
        }
      });
    });

  const runCpuUpscale = async () => {
    console.log("Falling back to CPU multi-pass upscaling");
    return cpuUpscale(inputPath, outputPath, scale);
  };

  try {
    await runGpuUpscale();
  } catch (gpuErr) {
    try {
      await runCpuUpscale();
    } catch (cpuErr) {
      console.error("CPU upscaling also failed:", cpuErr.message);
      return res.status(500).send("Upscaling failed");
    }
  }

  res.sendFile(outputPath, (sendErr) => {
    if (sendErr) {
      console.error("SendFile error:", sendErr);
      return res.status(500).send("Failed to send image");
    }
    fs.unlinkSync(inputPath);
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});