import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const projectRoot = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function loadTypeScript(relativePath) {
  const output = ts.transpileModule(read(relativePath), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const transpiledModule = { exports: {} };
  new Function("exports", "module", output)(transpiledModule.exports, transpiledModule);
  return transpiledModule.exports;
}

function sequenceSource(values) {
  let index = 0;
  const source = () => {
    assert.ok(index < values.length, "deterministic source exhausted");
    return values[index++];
  };
  source.calls = () => index;
  return source;
}

const random = loadTypeScript("lib/p1-remediation/secure-random.ts");

test("uint32 rejection sampling discards the incomplete modulo bucket", () => {
  const source = sequenceSource([4_294_967_290, 4_294_967_295, 9]);
  assert.equal(random.uniformUint32Below(10, source), 9);
  assert.equal(source.calls(), 3);
  assert.throws(() => random.uniformUint32Below(0, source), /Upper bound/);
  assert.throws(() => random.uniformUint32Below(4_294_967_297, source), /Upper bound/);
});

test("inclusive integer generation reaches both endpoints, equal bounds, and negatives", () => {
  const source = sequenceSource([0, 1, 2, 3, 4, 5]);
  const values = Array.from({ length: 6 }, () => random.randomIntegerInclusive(-2, 3, source));
  assert.deepEqual(values, [-2, -1, 0, 1, 2, 3]);
  assert.equal(random.randomIntegerInclusive(7, 7, sequenceSource([4_294_967_295])), 7);

  assert.equal(
    random.randomIntegerInclusive(-2_147_483_648, 2_147_483_647, sequenceSource([4_294_967_295])),
    2_147_483_647,
  );
  assert.throws(() => random.randomIntegerInclusive(2, 1), /Minimum must/);
  assert.throws(() => random.randomIntegerInclusive(0.5, 2), /safe integers/);
  assert.throws(
    () => random.randomIntegerInclusive(-2_147_483_649, 2_147_483_647),
    /cannot contain more than/,
  );
});

test("unique integer lists sample without replacement and validate capacity", () => {
  const values = random.randomIntegerList(
    { min: -2, max: 2, count: 5, allowDuplicates: false },
    sequenceSource([0, 0, 0, 0, 0]),
  );
  assert.equal(new Set(values).size, 5);
  assert.deepEqual([...values].sort((a, b) => a - b), [-2, -1, 0, 1, 2]);
  assert.throws(
    () => random.randomIntegerList({ min: 1, max: 2, count: 3, allowDuplicates: false }),
    /Cannot generate 3 unique/,
  );
});

test("password alphabets honor enabled classes and every ambiguous exclusion", () => {
  const sets = random.buildPasswordCharacterSets({
    length: 12,
    useUppercase: true,
    useLowercase: true,
    useNumbers: true,
    useSymbols: false,
    excludeAmbiguous: true,
  });
  assert.deepEqual(sets.map((set) => set.length), [24, 25, 8]);
  assert.ok(sets.every((set) => !/[0O1lI]/.test(set)));
  assert.equal(sets.join(""), "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789");
});

test("password generation rejects whole invalid candidates and guarantees each selected class", () => {
  const options = {
    length: 2,
    useUppercase: true,
    useLowercase: false,
    useNumbers: true,
    useSymbols: false,
    excludeAmbiguous: true,
  };
  const source = sequenceSource([0, 1, 0, 24]);
  assert.equal(random.generatePassword(options, source), "A2");
  assert.equal(source.calls(), 4);

  assert.throws(
    () => random.generatePassword({ ...options, length: 1 }, sequenceSource([0])),
    /at least the number/,
  );
});

test("reported password bits use the exact conditioned search-space count", () => {
  const options = {
    length: 2,
    useUppercase: true,
    useLowercase: false,
    useNumbers: true,
    useSymbols: false,
    excludeAmbiguous: true,
  };
  assert.equal(random.countValidPasswords(options), BigInt(384));
  assert.ok(Math.abs(random.passwordSearchSpaceBits(options) - Math.log2(384)) < 1e-12);
});

test("generator components delegate randomness and avoid unsupported crack-time claims", () => {
  const passwordSource = read("components/tools/PasswordGenerator.tsx");
  const numberSource = read("components/tools/RandomNumberGenerator.tsx");
  const publicCopy = `${read("lib/tools.ts")}\n${read("lib/seo/tool-faqs.ts")}`;
  assert.doesNotMatch(passwordSource, /%\s*max|Estimated crack time|guesses per second|getCrackTime/);
  assert.match(passwordSource, /passwordSearchSpaceBits/);
  assert.match(passwordSource, /It is not a crack-time prediction/);
  assert.doesNotMatch(numberSource, /arr\[0\]\s*%|function randomInt|parseInt/);
  assert.match(numberSource, /randomIntegerInclusive/);
  assert.match(numberSource, /Minimum and maximum are inclusive/);
  assert.doesNotMatch(
    publicCopy,
    /105 bits|millions of years|hardware entropy|cannot be predicted or reproduced|true fairness|Cryptographic — auditable/i,
  );
  assert.match(publicCopy, /not a crack-time prediction|not a draw-audit system/i);
});
