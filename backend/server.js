const express = require("express");
const multer = require("multer");
const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const favicon = require("serve-favicon");

const app = express();
const upload = multer({ dest: "uploads/" });

/**
 * ✅ FIXED CSP MIDDLEWARE
 * Replaced the local file path with 'self'.
 * Added 'blob:' and 'data:' to img-src to support upscaled image previews.
 */
app.use((req, res, next) => {
  const devServerOrigin = "http://localhost:5173";
  const devServerWs = "ws://localhost:5173";

  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'", // Changed from '/home/promise-shedrack' to 'self'
      `connect-src 'self' ${devServerOrigin} ${devServerWs}`,
      "img-src 'self' blob: data:", 
      `script-src 'self' 'unsafe-eval' ${devServerOrigin}`, // Added 'unsafe-eval' often needed for React dev
      `style-src 'self' 'unsafe-inline' ${devServerOrigin}`,
      "font-src 'self'",
    ].join("; ")
  );
  next();
});
// Serve static assets from public folder (for uploads, outputs, etc.)
app.use(express.static(path.join(__dirname, "public")));
try {
  app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
} catch (e) {
  console.warn("Favicon file not found in ./public/favicon.ico");
}

const binModelDir = path.resolve(__dirname, "bin", "models");

function ensureBinModelSymlink() {
  try {
    const stats = fs.lstatSync(binModelDir);
    if (stats.isSymbolicLink()) {
      const currentTarget = fs.readlinkSync(binModelDir);
      const resolvedTarget = path.resolve(__dirname, currentTarget);
      if (resolvedTarget !== path.resolve(__dirname, "models")) {
        fs.unlinkSync(binModelDir);
        fs.symlinkSync(path.resolve(__dirname, "models"), binModelDir, "dir");
      }
    } else if (!stats.isDirectory()) {
      fs.rmSync(binModelDir, { recursive: true, force: true });
      fs.symlinkSync(path.resolve(__dirname, "models"), binModelDir, "dir");
    }
  } catch (e) {
    if (e.code === "ENOENT") {
      fs.symlinkSync(path.resolve(__dirname, "models"), binModelDir, "dir");
    } else {
      throw e;
    }
  }
}

app.post("/upscale", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No image uploaded");
  }

  const inputPath = req.file.path;
  const outputDir = path.resolve(__dirname, "outputs");
  const modelDir = path.resolve(__dirname, "models");
  const binPath = path.resolve(__dirname, "bin", "upscayl-bin");

  ensureBinModelSymlink();

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(
    outputDir,
    `output-${Date.now()}.png`
  );

  const args = [
    "-i", inputPath,
    "-o", outputPath,
    "-s", "4",
    "-m", modelDir,
    "-n", "upscayl-standard-4x",
    "-v",
  ];

  console.log("Running upscaler:", binPath, args.join(" "));

  execFile(binPath, args, (err, stdout, stderr) => {
    if (stdout) {
      console.log("Upscaler stdout:", stdout);
    }
    if (stderr) {
      console.warn("Upscaler stderr:", stderr);
    }
    if (err) {
      console.error("Upscaling error:", err);
      return res.status(500).send("Upscaling failed");
    }

    res.sendFile(outputPath, (err) => {
      if (err) {
        console.error("SendFile error:", err);
        res.status(500).send("Failed to send image");
      }
      // Optional: clean up input file after processing
      fs.unlinkSync(inputPath);
    });
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});