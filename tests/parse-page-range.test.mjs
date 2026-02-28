import test from "node:test";
import assert from "node:assert/strict";
import { parsePageRange } from "../lib/parse-page-range.mjs";

test("parsePageRange handles all and empty inputs", () => {
  assert.deepEqual(parsePageRange("all", 4), [0, 1, 2, 3]);
  assert.deepEqual(parsePageRange("", 3), [0, 1, 2]);
});

test("parsePageRange handles ranges, lists, dedupe, and bounds", () => {
  assert.deepEqual(parsePageRange("1-3, 2, 5, 999", 6), [0, 1, 2, 4]);
  assert.deepEqual(parsePageRange("3-1, foo, -1", 5), []);
  assert.deepEqual(parsePageRange("2-4,4-5", 5), [1, 2, 3, 4]);
});
