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

test("HEIC -> JPG conversion outputs valid JPEG with expected dimensions", async () => {
  const heicInput = await readFile(fixturePath("sample.heic"));
  const converted = await convertHeicBufferToJpeg(heicInput, { quality: 90 });

  assert.equal(isJpegBuffer(converted), true, "output must be a valid JPEG byte stream");
  assert.ok(converted.length > 2048, `output size too small: ${converted.length} bytes`);

  const { width, height } = await getImageDimensions(converted);
  assert.equal(width, 128, "width should match fixture expectation");
  assert.equal(height, 96, "height should match fixture expectation");
});

test("HEIC -> JPG perceptual quality stays close to reference", async () => {
  const heicInput = await readFile(fixturePath("sample.heic"));
  const referenceJpg = await readFile(fixturePath("sample-heic-reference.jpg"));

  const converted = await convertHeicBufferToJpeg(heicInput, { quality: 90 });

  const convertedHash = await computeDHashHex(converted);
  const referenceHash = await computeDHashHex(referenceJpg);
  const distance = hammingDistanceHex(convertedHash, referenceHash);

  assert.ok(
    distance <= 4,
    `perceptual hash drift too high (distance=${distance}, converted=${convertedHash}, reference=${referenceHash})`
  );
});
