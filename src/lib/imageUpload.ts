/**
 * Client-side image compression, conversion and Data URL helper.
 *
 * Images are encoded to AVIF with the official Squoosh AVIF encoder (WASM).
 * If AVIF encoding is unavailable in the current browser, we fall back to
 * WebP/JPEG so uploads never fail — but AVIF is the preferred/normal path.
 */

function bufferToDataUrl(buffer: ArrayBuffer, mimeType: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("ไม่สามารถแปลงรูปภาพเป็น Data URL ได้"));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(new Blob([buffer], { type: mimeType }));
  });
}

export async function compressAndReadFile(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<string> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.84 } = options;

  return new Promise((resolve, reject) => {
    // Basic validation
    if (!file.type.startsWith("image/")) {
      reject(new Error("กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPEG, PNG, WebP, etc.)"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์รูปภาพได้"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("ไม่สามารถประมวลผลรูปภาพได้"));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate aspect-ratio scaled dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Fallback to raw data url if canvas 2d context is unavailable
          resolve(reader.result as string);
          return;
        }

        // Draw with high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Encode to AVIF in the browser (loaded lazily so public pages stay light).
        (async () => {
          try {
            const { encode } = await import("@jsquash/avif");
            const imageData = ctx.getImageData(0, 0, width, height);
            const buffer = await encode(imageData, {
              quality: Math.round(quality * 100),
              qualityAlpha: -1,
              speed: 7,
            });
            resolve(await bufferToDataUrl(buffer, "image/avif"));
            return;
          } catch (err) {
            console.warn("AVIF encoding failed, falling back to WebP:", err);
          }

          // Fallback: WebP, then JPEG.
          try {
            const webpData = canvas.toDataURL("image/webp", quality);
            if (webpData.startsWith("data:image/webp")) {
              resolve(webpData);
              return;
            }
          } catch (_) {
            // ignore and fall through to jpeg
          }

          resolve(canvas.toDataURL("image/jpeg", quality));
        })();
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
