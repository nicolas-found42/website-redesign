import type { Screenshot } from "./model";
import {
  maxScreenshotBytes,
  maxScreenshotDimension,
  maxScreenshotPixels,
} from "./submission-contract";

const unavailable =
  "Tab capture is unavailable in this browser. Attach a screenshot file or continue with written feedback.";
interface CaptureDevices extends MediaDevices {
  setCaptureHandleConfig?: (config: {
    handle: string;
    permittedOrigins: string[];
  }) => void;
}
interface CaptureTrack extends MediaStreamTrack {
  getCaptureHandle?: () => { handle?: string } | null;
}

async function encode(
  source: CanvasImageSource,
  width: number,
  height: number,
  kind: Screenshot["source"],
) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context || !width || !height)
    throw new Error(
      "The screenshot could not be read. Choose another file or continue without it.",
    );
  let scale = Math.min(
    1,
    maxScreenshotDimension / width,
    maxScreenshotDimension / height,
    Math.sqrt(maxScreenshotPixels / (width * height)),
  );
  for (let attempt = 0; attempt < 8; attempt++) {
    canvas.width = Math.max(1, Math.floor(width * scale));
    canvas.height = Math.max(1, Math.floor(height * scale));
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (blob && blob.size <= maxScreenshotBytes) {
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const sha256 = Array.from(
        new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
        (n) => n.toString(16).padStart(2, "0"),
      ).join("");
      return {
        sha256,
        width: canvas.width,
        height: canvas.height,
        source: kind,
        captured: new Date().toISOString(),
        dataUrl: canvas.toDataURL("image/png"),
      } satisfies Screenshot;
    }
    scale *= 0.8;
  }
  throw new Error(
    "This screenshot is too large. Choose a smaller PNG or continue without it.",
  );
}

/** Decode actual supplied pixels and resize only; never reconstruct page markup. */
export async function screenshotFile(file: File) {
  if (file.type !== "image/png" || file.size > 8 * 1024 * 1024)
    throw new Error(
      "Choose a PNG screenshot up to 8 MB. Your written feedback is unchanged.",
    );
  const url = URL.createObjectURL(file);
  const image = new Image();
  try {
    image.src = url;
    await image.decode();
    if (image.naturalWidth * image.naturalHeight > 32_000_000)
      throw new Error("Choose a smaller screenshot (up to 32 million pixels).");
    return await encode(image, image.naturalWidth, image.naturalHeight, "file");
  } catch (error) {
    throw new Error(
      error instanceof Error && error.message.startsWith("Choose")
        ? error.message
        : "The screenshot could not be read. Choose another PNG or continue without it.",
      { cause: error },
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** A random per-tab handle prevents accepting another tab, a window or a desktop. */
export function reviewTabCapture() {
  const devices = navigator.mediaDevices as CaptureDevices | undefined;
  const handle = crypto.randomUUID();
  let available =
    !!devices?.getDisplayMedia && !!devices.setCaptureHandleConfig;
  try {
    if (available)
      devices!.setCaptureHandleConfig!({
        handle,
        permittedOrigins: [location.origin],
      });
  } catch {
    available = false;
  }
  return {
    available,
    async capture(selected: Element, visibility: (hidden: boolean) => void) {
      if (!available) throw new Error(unavailable);
      let stream: MediaStream | undefined;
      const video = document.createElement("video");
      video.muted = true;
      try {
        const options = {
          video: { displaySurface: "browser" },
          audio: false,
          preferCurrentTab: true,
          selfBrowserSurface: "include",
          monitorTypeSurfaces: "exclude",
          surfaceSwitching: "exclude",
        };
        stream = await devices!.getDisplayMedia(options);
        const track = stream.getVideoTracks()[0] as CaptureTrack | undefined;
        const correctTab = () =>
          track?.getSettings().displaySurface === "browser" &&
          track.getCaptureHandle?.()?.handle === handle;
        if (!correctTab())
          throw new Error(
            "Choose this review tab, not another tab, window or screen. You can also attach a screenshot file.",
          );
        const bounds = selected.getBoundingClientRect();
        if (
          bounds.bottom <= 0 ||
          bounds.top >= innerHeight ||
          bounds.right <= 0 ||
          bounds.left >= innerWidth
        )
          throw new Error("Bring the selected target into view and try again.");
        video.srcObject = stream;
        visibility(true);
        await video.play();
        // Wait for fresh native frames after hiding the dialog and its backdrop.
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(
            () =>
              reject(
                new Error(
                  "Tab capture timed out. Retry or attach a screenshot file.",
                ),
              ),
            5000,
          );
          video.requestVideoFrameCallback(() =>
            video.requestVideoFrameCallback(() => {
              clearTimeout(timer);
              resolve();
            }),
          );
        });
        if (!correctTab() || track?.readyState !== "live")
          throw new Error(
            "Tab capture was interrupted. Retry or attach a screenshot file.",
          );
        return await encode(video, video.videoWidth, video.videoHeight, "tab");
      } catch (error) {
        if (error instanceof DOMException)
          throw new Error(
            "Tab capture was cancelled or refused. Retry, attach a screenshot file, or continue without it.",
            { cause: error },
          );
        throw error;
      } finally {
        stream?.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
        visibility(false);
      }
    },
  };
}
