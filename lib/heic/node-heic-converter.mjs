import sharp from "sharp";

/**
 * Node-only HEIC/HEIF -> JPEG conversion helper for deterministic QA tests.
 * Uses libvips via sharp, not browser APIs.
 */
export async function convertHeicBufferToJpeg(
  heicBuffer,
  { quality = 90 } = {}
) {
  if (!(heicBuffer instanceof Uint8Array)) {
    throw new TypeError("Expected HEIC input as Uint8Array/Buffer");
  }

  return sharp(heicBuffer, { failOn: "error" })
    .rotate()
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();
}

export function isJpegBuffer(buffer) {
  if (!(buffer instanceof Uint8Array) || buffer.length < 4) {
    return false;
  }

  const startsWithSOI = buffer[0] === 0xff && buffer[1] === 0xd8;
  const endsWithEOI =
    buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9;

  return startsWithSOI && endsWithEOI;
}

export async function getImageDimensions(buffer) {
  const meta = await sharp(buffer).metadata();
  return {
    width: meta.width ?? 0,
    height: meta.height ?? 0,
  };
}

export async function computeDHashHex(buffer) {
  const { data } = await sharp(buffer)
    .grayscale()
    .resize(9, 8, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let bits = "";
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const left = data[y * 9 + x];
      const right = data[y * 9 + x + 1];
      bits += left > right ? "1" : "0";
    }
  }

  return BigInt(`0b${bits}`).toString(16).padStart(16, "0");
}

export function hammingDistanceHex(a, b) {
  if (!/^[0-9a-f]{16}$/i.test(a) || !/^[0-9a-f]{16}$/i.test(b)) {
    throw new Error("Expected 16-char hexadecimal dHash values");
  }

  let diff = BigInt(`0x${a}`) ^ BigInt(`0x${b}`);
  let count = 0;
  while (diff) {
    count += Number(diff & 1n);
    diff >>= 1n;
  }

  return count;
}
