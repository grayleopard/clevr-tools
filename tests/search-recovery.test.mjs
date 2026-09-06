import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
function load(file, dependencies = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const compiledModule = {exports:{}};
  new Function("exports", "module", "require", code)(compiledModule.exports,compiledModule,(key)=>{if (!(key in dependencies)) throw new Error(key); return dependencies[key];});
  return compiledModule.exports;
}
const data=load("lib/data-size.ts");
const conversions=load("lib/conversions.ts",{"@/lib/data-size":data});
const examples=load("lib/converter-examples.ts",{"./conversions":conversions});
const percentage=load("lib/percentage.ts");
const heic=load("lib/image-remediation/heic-validation.ts");
const worker=load("lib/heic/owned-worker.ts",{"../image-remediation/heic-validation":heic});
const analytics=load("lib/analytics/calculator-events.ts");

test("search examples use accurate conversion factors",()=>{
 assert.equal(examples.exampleResult("data",{value:4.7,from:"GB",to:"MB"}),"4,700");
 assert.equal(examples.exampleResult("speed",{value:113,from:"km/h",to:"mph"}),"70.21494");
 assert.equal(examples.exampleResult("weight",{value:1,from:"lb",to:"oz"}),"16");
 assert.equal(examples.exampleResult("weight",{value:1,from:"st",to:"lb"}),"14");
});
test("conversion input rejects partial numbers and overflow",()=>{
 for(const value of ["", " ", "12oops", "1e309", "Infinity", "NaN", "1,000"]) assert.equal(examples.parseConverterInput(value),null,value);
 assert.equal(examples.parseConverterInput("1e3"),1000);
 assert.equal(examples.parseConverterInput("-0.25"),-.25);
});
test("percentage results handle zero, negative baselines, missing input and overflow",()=>{
 assert.equal(percentage.calculatePercentage("percent-of","15","200").result,"30");
 assert.equal(percentage.calculatePercentage("is-what-percent","30","200").result,"15%");
 assert.equal(percentage.calculatePercentage("percent-change","200","200").result,"0% — no change");
 assert.equal(percentage.calculatePercentage("percent-change","250","200").result,"20% decrease");
 assert.ok(percentage.calculatePercentage("percent-change","-200","100").error);
 assert.ok(percentage.calculatePercentage("is-what-percent","10","0").error);
 assert.ok(percentage.calculatePercentage("percent-of","1e308","1e308").error);
 assert.equal(percentage.calculatePercentage("percent-of","","200").result,"");
});
function fakeWorker() { return {terminated:0,onmessage:null,onerror:null,onmessageerror:null,postMessage(){},terminate(){this.terminated++;}}; }
test("HEIC deadline terminates the decoder instead of merely hiding its result",async()=>{
 const fake=fakeWorker();
 await assert.rejects(worker.runHeicWorker(()=>fake,new Blob(),.9,undefined,10),{code:"timeout"});
 assert.equal(fake.terminated,1);
});
test("HEIC cancellation and completion both release the worker",async()=>{
 const fake=fakeWorker(), controller=new AbortController();
 const pending=worker.runHeicWorker(()=>fake,new Blob(),.9,controller.signal);
 controller.abort();
 await assert.rejects(pending,{name:"AbortError"});
 assert.equal(fake.terminated,1);
 const successful=fakeWorker();
 const done=worker.runHeicWorker(()=>successful,new Blob(),.9);
 const blob=new Blob(["jpeg"]);
 successful.onmessage({data:{blob}});
 assert.equal(await done,blob);
 assert.equal(successful.terminated,1);
});
test("calculator measurement only emits allowlisted content-free payloads",()=>{
 const events=[];
 global.window={gtag:(...args)=>events.push(args)};
 try {
  analytics.trackCalculatorEvent("data","succeeded");
  analytics.trackCalculatorEvent("user-secret","started");
  analytics.trackCalculatorEvent("data","user-secret");
  assert.deepEqual(events,[["event","calculator_succeeded",{tool:"data"}]]);
 } finally {delete global.window;}
});

test("HEIC input limits also apply outside the drop zone", async () => {
 await assert.rejects(heic.assertHeicInput({size:50 * 1024 * 1024 + 1}), {code:"too-large"});
});
