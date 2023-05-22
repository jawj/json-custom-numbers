import fs from 'fs';
import path from 'path';
import { parse } from '../src/parse.mjs';
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

for (const filename of filenames) {
  const json = fs.readFileSync(path.join(folderPath, filename), 'utf8');
  if (filename.startsWith('perf_')) perftests[filename] = json;

  let jpGotErr = undefined;
  let jpResult = undefined;
  try {
    jpResult = JSON.parse(json);
  } catch (err) {
    jpGotErr = err;
  }

  let weGotErr = undefined;
  let weResult = undefined;
  try {
    weResult = parse(json);
  } catch (err) {
    weGotErr = err;
  }

  if (!!weGotErr !== !!jpGotErr) {
    console.log(filename, json);
    console.log(jpGotErr ? jpGotErr.message : weGotErr.message);
    console.log(`  FAIL: JSON.parse ${jpGotErr ? 'error' : 'OK'}, parse ${weGotErr ? 'error' : 'OK'}\n`);
    // process.exit();
    fails += 1;
    continue;
  }

  if (JSON.stringify(weResult) !== JSON.stringify(jpResult)) {
    console.log(filename, json);
    console.log(`${filename} FAIL: JSON.parse (${JSON.stringify(jpResult)}) !== parse (${JSON.stringify(weResult)})\n`);
    // process.exit();
    fails += 1;
    continue;
  }

  passes += 1;
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

const revived = parse(bigNumJson, null, nr);
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

console.log(col.bold(`test               x   reps |  native |        crockford |     this, strict |        this, lax`));
for (const filename in perftests) {
  const json = perftests[filename];
  const [, name, repsStr] = filename.match(/^perf_(.+)_x([0-9]+)[.]json$/) ?? [, 'Perf test', 10000];
  const reps = Number(repsStr);

  const [baselineResult, t] = perf(reps, null, () => JSON.parse(json));
  const [crockfordResult] = perf(reps, t, () => crockford(json));
  const [parseResult] = perf(reps, t, () => parse(json));
  const [parseLaxResult] = perf(reps, t, () => parse(json, null, null, true));

  const title = `${ljust(name, 18)} x ${rjust(repsStr, 6)}`;
  console.log(`${title} | ${baselineResult} | ${crockfordResult} | ${parseResult} | ${parseLaxResult}`);
}

console.log();