import axios from "axios";
import { FormEvent, ChangeEvent, useMemo, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

type Scale = 2 | 3 | 4;

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [scale, setScale] = useState<Scale>(4);

  const fileName = useMemo(() => file?.name ?? "No file selected", [file]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;

    setError("");
    setResultUrl("");
    setFile(selected);

    if (selected) {
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    } else {
      setPreviewUrl("");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setError("Please select an image before uploading.");
      return;
    }

    setLoading(true);
    setError("");
    setResultUrl("");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("scale", String(scale));

    try {
      console.log("Uploading image:", file.name, "Size:", file.size);

      const response = await axios.post(`${BASE_URL}/upscale`, formData, {
        responseType: "blob",
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const blob = response.data;

      if (!blob || blob.size === 0) {
        throw new Error("Received empty image from server.");
      }

      const url = URL.createObjectURL(blob);
      setResultUrl(url);

      console.log("Upscaled image created:", url);
    } catch (err) {
      let message = "Unable to upload image.";

      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        if (data instanceof Blob) {
          message = await data.text();
        } else if (typeof data === "string") {
          message = data;
        } else if (data?.message) {
          message = data.message;
        } else {
          message = err.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      console.error("Upload error:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!resultUrl) return;
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = 'upscaled.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-sm">
        <header className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-400/80">
            Image Upscaler
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Fast AI Upscaling
          </h1>
          <p className="mt-3 text-slate-400">
            Upload a photo and get back a high-quality upsized PNG.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block rounded-3xl border border-slate-800 bg-slate-950/70 p-4 shadow-inner shadow-slate-950/20">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Choose an image
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 file:cursor-pointer file:rounded-2xl file:border-0 file:bg-sky-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950"
            />

            <p className="mt-2 text-xs text-slate-500">
              Supported formats: JPEG, PNG, WebP. Output is delivered as PNG.
            </p>
          </label>

          <fieldset>
            <legend className="mb-3 text-sm font-medium text-slate-300">
              Output resolution
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {([2, 3, 4] as Scale[]).map((s) => (
                <label
                  key={s}
                  className={`flex cursor-pointer items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    scale === s
                      ? "border-sky-500 bg-sky-500/20 text-sky-300"
                      : "border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="scale"
                    value={s}
                    checked={scale === s}
                    onChange={() => setScale(s)}
                    className="sr-only"
                  />
                  {s === 2 ? "2K" : s === 3 ? "4K" : "8K"}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
              <p className="font-medium text-slate-100">Selected image</p>
              <p className="mt-2 truncate">{fileName}</p>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="inline-flex h-14 w-full items-center justify-center rounded-3xl bg-sky-500 px-5 text-base font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Upscaling…" : "Upscale image"}
            </button>
          </div>

          {error && (
            <p className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </p>
          )}
        </form>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {previewUrl && (
            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 p-3">
              <p className="mb-3 text-sm font-medium text-slate-200">
                Preview
              </p>
              <img
                src={previewUrl}
                alt="Preview"
                className="h-full w-full rounded-3xl object-contain"
              />
            </div>
          )}

          {resultUrl && (
            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 p-3">
              <p className="mb-3 text-sm font-medium text-slate-200">
                Upscaled Result
              </p>
              <img
                src={resultUrl}
                alt="Upscaled result"
                className="h-full w-full rounded-3xl object-contain"
              />

              <button
                onClick={downloadImage}
                className="mt-4 inline-flex w-full items-center justify-center rounded-3xl bg-emerald-500 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Download PNG
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;