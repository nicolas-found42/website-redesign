import type { D1Database } from "@cloudflare/workers-types";
import {
  maxScreenshotBytes,
  maxScreenshotDimension,
  maxScreenshotPixels,
} from "../src/review/submission-contract";

const crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let i = 0; i < 8; i++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc(bytes: Uint8Array) {
  let n = 0xffffffff;
  for (const byte of bytes) n = crcTable[(n ^ byte) & 255] ^ (n >>> 8);
  return (n ^ 0xffffffff) >>> 0;
}

/** Accept only complete, bounded 8-bit RGB/RGBA PNGs, never SVG or arbitrary files. */
async function pngDimensions(data: Uint8Array) {
  if (
    data.length < 57 ||
    [137, 80, 78, 71, 13, 10, 26, 10].some((n, i) => data[i] !== n)
  )
    throw new Error("png");
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let width = 0,
    height = 0,
    channels = 0,
    ended = false,
    idatEnded = false;
  const compressed: Uint8Array[] = [];
  for (let offset = 8; offset < data.length;) {
    if (offset + 12 > data.length) throw new Error("png");
    const size = view.getUint32(offset);
    const end = offset + 12 + size;
    if (
      end > data.length ||
      crc(data.subarray(offset + 4, end - 4)) !== view.getUint32(end - 4)
    )
      throw new Error("png");
    const type = String.fromCharCode(...data.subarray(offset + 4, offset + 8));
    const chunk = data.subarray(offset + 8, end - 4);
    if (offset === 8 && type !== "IHDR") throw new Error("png");
    if (type === "IHDR") {
      if (offset !== 8 || size !== 13) throw new Error("png");
      width = view.getUint32(offset + 8);
      height = view.getUint32(offset + 12);
      channels = chunk[9] === 6 ? 4 : chunk[9] === 2 ? 3 : 0;
      if (
        !width ||
        !height ||
        width > maxScreenshotDimension ||
        height > maxScreenshotDimension ||
        width * height > maxScreenshotPixels ||
        chunk[8] !== 8 ||
        !channels ||
        chunk[10] ||
        chunk[11] ||
        chunk[12]
      )
        throw new Error("png");
    } else if (type === "IDAT") {
      if (idatEnded) throw new Error("png");
      compressed.push(chunk);
    } else if (type === "IEND") {
      if (size || !compressed.length || end !== data.length)
        throw new Error("png");
      ended = true;
    } else {
      // Ancillary chunks are safe raster metadata; unknown critical chunks are not.
      if (!/^[a-z][A-Za-z]{3}$/.test(type) && type !== "PLTE")
        throw new Error("png");
      if (compressed.length) idatEnded = true;
    }
    offset = end;
  }
  if (!ended) throw new Error("png");
  const blob = new Blob(compressed.map((chunk) => new Uint8Array(chunk)));
  const reader = blob
    .stream()
    .pipeThrough(new DecompressionStream("deflate"))
    .getReader();
  const stride = width * channels + 1;
  const expected = stride * height;
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (length + value.length > expected) throw new Error("png");
      for (
        let i = (stride - (length % stride)) % stride;
        i < value.length;
        i += stride
      )
        if (value[i] > 4) throw new Error("png");
      length += value.length;
    }
  } finally {
    await reader.cancel();
  }
  if (length !== expected) throw new Error("png");
  return { width, height };
}

export async function readScreenshot(db: D1Database, sha: string) {
  const row = await db
    .prepare("SELECT pixels FROM screenshots WHERE sha256=?")
    .bind(sha)
    .first<{ pixels: number[] }>();
  if (!row) return new Response("Screenshot not found.", { status: 404 });
  return new Response(new Uint8Array(row.pixels), {
    headers: {
      "Content-Type": "image/png",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function uploadScreenshot(
  db: D1Database,
  request: Request,
  sha: string,
  reply: (body: unknown, status?: number) => Response,
  admit: (bytes: number) => Promise<boolean>,
) {
  if (request.headers.get("Content-Type")?.split(";")[0] !== "image/png")
    return reply(
      { message: "Choose a PNG screenshot. Written feedback is still saved." },
      415,
    );
  const reader = request.body?.getReader();
  if (!reader)
    return reply(
      {
        message:
          "The screenshot was empty. Choose it again or send text without it.",
      },
      400,
    );
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > maxScreenshotBytes) {
        await reader.cancel();
        return reply(
          {
            message:
              "Screenshot exceeds 512 KB. Choose a smaller image or send text without it.",
          },
          413,
        );
      }
      chunks.push(value);
    }
  } catch {
    return reply(
      {
        message:
          "Screenshot upload was interrupted. Retry or send text without it.",
      },
      400,
    );
  }
  const pixels = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    pixels.set(chunk, offset);
    offset += chunk.length;
  }
  let dimensions: { width: number; height: number };
  try {
    dimensions = await pngDimensions(pixels);
  } catch {
    return reply(
      {
        message:
          "This is not a supported screenshot. Choose a complete PNG up to 1600 pixels per side or send text without it.",
      },
      422,
    );
  }
  const digest = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", pixels)),
    (n) => n.toString(16).padStart(2, "0"),
  ).join("");
  if (digest !== sha)
    return reply(
      {
        message:
          "Screenshot upload did not match its saved image. Choose it again or send text without it.",
      },
      422,
    );
  const existing = await db
    .prepare("SELECT width,height FROM screenshots WHERE sha256=?")
    .bind(sha)
    .first<{ width: number; height: number }>();
  if (existing) return reply({ sha256: sha, ...existing });
  if (!(await admit(length)))
    return reply(
      {
        message:
          "New screenshot uploads are temporarily limited. Your draft is saved. Retry later or send text without the image.",
      },
      429,
    );
  try {
    await db
      .prepare(
        "INSERT INTO screenshots(sha256,pixels,width,height,uploaded,retained) VALUES (?,?,?,?,?,0) ON CONFLICT(sha256) DO NOTHING",
      )
      .bind(sha, pixels.buffer, dimensions.width, dimensions.height, Date.now())
      .run();
  } catch (error) {
    if (String(error).includes("screenshot quota"))
      return reply(
        {
          message:
            "Free screenshot storage is full. Your draft is saved. Send text without the image or contact the team.",
        },
        507,
      );
    throw error;
  }
  return reply({ sha256: sha, ...dimensions });
}
