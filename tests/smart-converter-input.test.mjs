import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const projectRoot = process.cwd();

function transpile(relativePath, requireImpl) {
  const source = fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const transpiledModule = { exports: {} };
  new Function("exports", "module", "require", output)(
    transpiledModule.exports,
    transpiledModule,
    requireImpl
  );
  return transpiledModule.exports;
}

const raster = transpile("lib/image-remediation/raster-formats.ts", () => {
  throw new Error("Unexpected raster dependency");
});

const empty = {};
const smart = transpile("components/home/SmartConverter.tsx", (request) => {
  if (request === "@/lib/image-remediation/raster-formats") return raster;
  if (request === "react") {
    return {
      useState: () => [null, () => {}],
      useCallback: (callback) => callback,
      useRef: (value) => ({ current: value }),
      useEffect: () => {},
      useId: () => "test",
    };
  }
  if (request === "react/jsx-runtime") return { jsx: () => null, jsxs: () => null };
  if (request === "next/navigation") return { useRouter: () => empty };
  if (request === "lucide-react") return new Proxy(empty, { get: () => () => null });
  return empty;
});

function fileLike(name, type, bytes, size = bytes.length) {
  const blob = new Blob([bytes], { type });
  return {
    name,
    type,
    size,
    slice: (...args) => blob.slice(...args),
  };
}

test("Smart Converter verifies raster/PDF headers before exposing actions", async () => {
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const pdf = Buffer.from("%PDF-1.7\n", "ascii");

  assert.equal((await smart.verifySmartConverterFile(fileLike("image.png", "image/png", png))).type, "png");
  assert.equal((await smart.verifySmartConverterFile(fileLike("report.pdf", "application/pdf", pdf))).type, "pdf");

  const renamedRaster = await smart.verifySmartConverterFile(
    fileLike("not-a-pdf.pdf", "application/pdf", png)
  );
  assert.equal(renamedRaster.type, "unknown");
  assert.match(renamedRaster.error, /contents/i);

  const mismatchedMime = await smart.verifySmartConverterFile(
    fileLike("image.png", "application/pdf", png)
  );
  assert.equal(mismatchedMime.type, "unknown");
  assert.match(mismatchedMime.error, /disagree/i);
});

test("Smart Converter rejects empty and oversize verified inputs at the boundary", async () => {
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const emptyFile = await smart.verifySmartConverterFile(fileLike("empty.png", "image/png", new Uint8Array()));
  assert.equal(emptyFile.type, "unknown");
  assert.match(emptyFile.error, /empty/i);

  const atLimit = await smart.verifySmartConverterFile(
    fileLike("limit.png", "image/png", png, 50 * 1024 * 1024)
  );
  assert.equal(atLimit.type, "png");

  const aboveLimit = await smart.verifySmartConverterFile(
    fileLike("too-large.png", "image/png", png, 50 * 1024 * 1024 + 1)
  );
  assert.equal(aboveLimit.type, "unknown");
  assert.match(aboveLimit.error, /50 MB/i);
});
