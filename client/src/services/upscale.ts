import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export type Scale = 2 | 3 | 4;

export interface UpscaleOptions {
  file: File;
  scale: Scale;
}

export async function upscaleImage({
  file,
  scale,
}: UpscaleOptions): Promise<Blob> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("scale", String(scale));

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

  return blob;
}

export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data instanceof Blob) {
      return `Upscaling failed`;
    } else if (typeof data === "string") {
      return data;
    } else if (data?.message) {
      return data.message;
    } else {
      return err.message;
    }
  } else if (err instanceof Error) {
    return err.message;
  }
  return "Unable to upload image.";
}
