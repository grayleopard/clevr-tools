import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const projectRoot = process.cwd();

function loadTypeScript(relativePath) {
  const source = fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const transpiledModule = { exports: {} };
  new Function("exports", "module", "require", output)(
    transpiledModule.exports,
    transpiledModule,
    () => {
      throw new Error("Unexpected test dependency");
    }
  );
  return transpiledModule.exports;
}

const handoff = loadTypeScript("lib/file-handoff.ts");
const MiB = 1024 * 1024;

function fakeFile(name, size) {
  return { name, size };
}

test("targeted handoff is consumed only by its verified destination", () => {
  handoff.clearPendingFile();
  const file = fakeFile("report.pdf", 1_024);
  handoff.setPendingFile(file, {
    verifiedKind: "pdf",
    targetRoute: "/tools/split-pdf",
    byteLimit: 100 * MiB,
    operationId: "op-matching",
    now: 1_000,
    ttlMs: 1_000,
  });

  assert.equal(
    handoff.takePendingFile({ targetRoute: "/convert/pdf-to-jpg", now: 1_001 }),
    null
  );
  assert.equal(handoff.peekPendingFile(), null, "a wrong mount must not leave a reusable file");

  handoff.setPendingFile(file, {
    verifiedKind: "pdf",
    targetRoute: "/tools/split-pdf",
    byteLimit: 100 * MiB,
    operationId: "op-matching",
    now: 1_000,
    ttlMs: 1_000,
  });
  assert.equal(
    handoff.takePendingFile({ targetRoute: "/tools/split-pdf", operationId: "op-matching", now: 1_001 }),
    file
  );
  assert.equal(handoff.peekPendingFile(), null, "handoff is single-consumption");
});

test("targeted handoff expires and rejects a target capability mismatch", () => {
  handoff.clearPendingFile();
  const png = fakeFile("image.png", 1_024);
  handoff.setPendingFile(png, {
    verifiedKind: "png",
    targetRoute: "/convert/png-to-jpg",
    byteLimit: 50 * MiB,
    now: 100,
    ttlMs: 10,
  });
  assert.equal(handoff.takePendingFile({ targetRoute: "/convert/png-to-jpg", now: 110 }), null);

  handoff.setPendingFile(png, {
    verifiedKind: "png",
    targetRoute: "/compress/pdf",
    byteLimit: 50 * MiB,
    now: 100,
  });
  assert.equal(handoff.takePendingFile({ targetRoute: "/compress/pdf", now: 101 }), null);
});

test("handoff revalidates its byte limit while legacy callers remain compatible", () => {
  handoff.clearPendingFile();
  const tooLargePng = fakeFile("large.png", 50 * MiB + 1);
  handoff.setPendingFile(tooLargePng, {
    verifiedKind: "png",
    targetRoute: "/convert/png-to-webp",
    byteLimit: 50 * MiB,
    now: 1,
  });
  assert.equal(handoff.takePendingFile({ targetRoute: "/convert/png-to-webp", now: 2 }), null);

  const legacyFile = fakeFile("background-removed.png", 10);
  handoff.setPendingFile(legacyFile, { now: 1 });
  assert.equal(
    handoff.takePendingFile({ targetRoute: "/convert/png-to-webp", now: 2 }),
    legacyFile
  );
});

test("cancelable transitions invalidate reset and superseded timers deterministically", () => {
  const callbacks = [];
  const scheduler = {
    setTimeout(callback) {
      callbacks.push(callback);
      return callbacks.length;
    },
    // Deliberately leave callbacks callable: generation invalidation must still
    // protect us if a browser races a clear with a timer callback.
    clearTimeout() {},
  };
  const transition = handoff.createCancelableTransition(scheduler);
  let calls = 0;

  transition.schedule(160, () => {
    calls += 1;
  });
  transition.cancel();
  callbacks[0]();
  assert.equal(calls, 0, "reset must cancel a queued route transition");

  transition.schedule(160, () => {
    calls += 1;
  });
  transition.schedule(160, () => {
    calls += 10;
  });
  callbacks[1]();
  callbacks[2]();
  assert.equal(calls, 10, "only the newest route transition may run");
  assert.equal(transition.isPending, false);
});
