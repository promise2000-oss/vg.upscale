const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const favicon = require("serve-favicon");

const app = express();
const upload = multer({ dest: "uploads/" });

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
];

app.use(cors({ origin: allowedOrigins }));

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

app.post("/upscale", upload.single("image"), (req, res) => {
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

  const args = [
    "-i", inputPath,
    "-o", outputPath,
    "-s", String(scale),
    "-m", modelDir,
    "-n", "upscayl-standard-4x",
    "-g", "1",
  ];

  console.log("Running upscaler:", binPath, args.join(" "));

  try {
    execFile(binPath, args, (err, stdout, stderr) => {
      if (stdout) console.log("Upscaler stdout:", stdout);
      if (stderr) console.warn("Upscaler stderr:", stderr);
      if (err) {
        console.error("Upscaling error:", err);
        return res.status(500).send("Upscaling failed");
      }

      res.sendFile(outputPath, (sendErr) => {
        if (sendErr) {
          console.error("SendFile error:", sendErr);
          return res.status(500).send("Failed to send image");
        }
        fs.unlinkSync(inputPath);
      });
    });
  } catch (err) {
    console.error("Failed to start upscaler:", err);
    res.status(500).send("Upscaling failed");
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});