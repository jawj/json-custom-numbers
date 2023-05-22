import fs from 'fs';
import path from 'path';
import { parse as parseStrict } from '../src/parseStrict.mjs';
import { parse as parseChill } from '../src/parseChill.mjs';
import { parse as crockford } from './test_comparison/crockford.mjs';
import col from 'colors/safe.js';

const folderPath = 'test/test_parsing';
const filenames = fs
  .readdirSync(folderPath)
  .filter(filename =>
    /[.]json$/.test(filename) &&
    fs.statSync(path.join(folderPath, filename)).isFile()
  )
  .sort();

let passes = 0, fails = 0;
const perftests = {};

console.log(col.bold(`Running JSON.parse comparison tests ...`));

function compare(filename, json, trueFn, testFn) {
  let trueErr = undefined;
  let trueResult = undefined;
  try {
    trueResult = trueFn(json);
  } catch (err) {
    trueErr = err;
  }

  let testErr = undefined;
  let testResult = undefined;
  try {
    testResult = testFn(json);
  } catch (err) {
    testErr = err;
  }

  if (!!testErr !== !!trueErr) {
    console.log(filename, json);
    console.log(trueErr ? trueErr.message : testErr.message);
    console.log(`  FAIL: JSON.parse ${trueErr ? 'error' : 'OK'}, parse ${testErr ? 'error' : 'OK'}\n`);
    // process.exit();
    fails += 1;

  } else if (JSON.stringify(testResult) !== JSON.stringify(trueResult)) {
    console.log(filename, json);
    console.log(`${filename} FAIL: JSON.parse (${JSON.stringify(trueResult)}) !== parse (${JSON.stringify(testResult)})\n`);
    // process.exit();
    fails += 1;

  } else {
    passes += 1;
  }
}

for (const filename of filenames) {
  const json = fs.readFileSync(path.join(folderPath, filename), 'utf8');
  if (filename.startsWith('perf_')) perftests[filename] = json;

  compare(filename, json, JSON.parse, parseStrict);

  if (/^(y_|perf_)/.test(filename)) compare(filename, json, JSON.parse, parseChill);
}

console.log(`\n${passes} passes, ${fails} fails\n`);

console.log(col.bold(`Running number parsing test ...\n`));

const bigNumJson = "[9007199254740991, 9007199254740991.1, 900719925474099.1e1, 9007199254740993]";

function nr(s) {
  const n = +s;
  if (n >= Number.MIN_SAFE_INTEGER && n <= Number.MAX_SAFE_INTEGER) return n;
  if (s.indexOf('.') !== -1 || s.indexOf('e') !== -1 && s.indexOf('E') !== -1) return n;
  return BigInt(s);
}

const revived = parseStrict(bigNumJson, null, nr);
console.log(bigNumJson, '->', revived);

const bigNumPass = typeof revived[0] === 'number' &&
  typeof revived[1] === 'number' &&
  typeof revived[2] === 'number' &&
  typeof revived[3] === 'bigint';

console.log(bigNumPass ? 'Pass' : 'Fail');

if (!bigNumPass || fails > 0) process.exit(1);

console.log(col.bold(`\nRunning perf tests ...\n`));

const ljust = (s, len) => s + ' '.repeat(Math.max(0, len - s.length));
const rjust = (s, len) => ' '.repeat(Math.max(0, len - s.length)) + s;
const perf = (reps, baseline, fn) => {
  if (global.gc) global.gc();
  const t0 = performance.now();
  for (let i = 0; i < reps; i++) fn();
  const t = performance.now() - t0;
  let result = rjust(t.toFixed(), 5) + 'ms';
  if (typeof baseline === 'number') {
    const factor = t / baseline;
    const highlight = factor < 1 ? col.green : factor > 10 ? col.red : factor > 5 ? col.yellow : x => x;
    result += highlight(rjust(`(x${factor.toFixed(2)})`, 9));
  }
  return [result, t];
};

console.log(col.bold(`test               x   reps |  native |        crockford |     this, strict |      this, chill`));
for (const filename in perftests) {
  const json = perftests[filename];
  const [, name, repsStr] = filename.match(/^perf_(.+)_x([0-9]+)[.]json$/) ?? [, 'Perf test', 10000];
  const reps = Number(repsStr);

  const [baselineResult, t] = perf(reps, null, () => JSON.parse(json));
  const [crockfordResult] = perf(reps, t, () => crockford(json));
  const [parseResult] = perf(reps, t, () => parseStrict(json));
  const [parseLaxResult] = perf(reps, t, () => parseChill(json));

  const title = `${ljust(name, 18)} x ${rjust(repsStr, 6)}`;
  console.log(`${title} | ${baselineResult} | ${crockfordResult} | ${parseResult} | ${parseLaxResult}`);
}

console.log();