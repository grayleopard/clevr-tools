import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  computeDHashHex,
  convertHeicBufferToJpeg,
  getImageDimensions,
  hammingDistanceHex,
  isJpegBuffer,
} from "../lib/heic/node-heic-converter.mjs";

const fixturePath = (...parts) => path.join(process.cwd(), "tests", "fixtures", ...parts);

const heicInput = await readFile(fixturePath("sample.heic"));
let decoderCapability;

try {
  decoderCapability = {
    available: true,
    converted: await convertHeicBufferToJpeg(heicInput, { quality: 90 }),
    reason: null,
  };
} catch (error) {
  const detail = error instanceof Error ? error.message : "unknown decoder error";
  decoderCapability = {
    available: false,
    converted: null,
    reason: /support for this compression format has not been built in/i.test(detail)
      ? "Sharp/libvips was built without HEIC compression support"
      : detail.split("\n").at(-1),
  };
}

test("HEIC quality suite reports the installed decoder capability", () => {
  assert.equal(typeof decoderCapability.available, "boolean");
  if (!decoderCapability.available) {
    assert.match(
      decoderCapability.reason,
      /compression (?:format|support)|decoder|plugin|heic|heif|hevc/i,
      "the optional-codec skip must have a concrete decoder reason"
    );
    console.warn(`HEIC quality checks skipped: ${decoderCapability.reason}`);
  }
});

test(
  "HEIC -> JPG conversion outputs valid JPEG with expected dimensions",
  {
    skip: decoderCapability.available
      ? false
      : `installed Sharp/libvips lacks the optional HEIC decoder: ${decoderCapability.reason}`,
  },
  async () => {
    const converted = decoderCapability.converted;
    assert.ok(converted, "decoder capability probe must produce a JPEG");

    assert.equal(isJpegBuffer(converted), true, "output must be a valid JPEG byte stream");
    assert.ok(converted.length > 2048, `output size too small: ${converted.length} bytes`);

    const { width, height } = await getImageDimensions(converted);
    assert.equal(width, 128, "width should match fixture expectation");
    assert.equal(height, 96, "height should match fixture expectation");
  }
);

test(
  "HEIC -> JPG perceptual quality stays close to reference",
  {
    skip: decoderCapability.available
      ? false
      : `installed Sharp/libvips lacks the optional HEIC decoder: ${decoderCapability.reason}`,
  },
  async () => {
    const referenceJpg = await readFile(fixturePath("sample-heic-reference.jpg"));
    const converted = decoderCapability.converted;
    assert.ok(converted, "decoder capability probe must produce a JPEG");

    const convertedHash = await computeDHashHex(converted);
    const referenceHash = await computeDHashHex(referenceJpg);
    const distance = hammingDistanceHex(convertedHash, referenceHash);

    assert.ok(
      distance <= 4,
      `perceptual hash drift too high (distance=${distance}, converted=${convertedHash}, reference=${referenceHash})`
    );
  }
);
