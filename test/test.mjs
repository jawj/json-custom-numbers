import fs from 'fs';
import path from 'path';
import { parse } from '../src/parse.mjs';
import { parse as crockford } from './test_comparison/crockford.mjs';
import { performance } from 'perf_hooks';

const folderPath = 'test/test_parsing';
const repetitions = 10000;

const filenames = fs
  .readdirSync(folderPath)
  .filter(filename =>
    /[.]json$/.test(filename) &&
    fs.statSync(path.join(folderPath, filename)).isFile()
  )
  .sort();

let passes = 0, fails = 0;
const perftests = {};

console.log(`Running JSON.parse comparison tests ...`);

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

console.log(`Running number parsing test ...`);

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

console.log(bigNumPass ? 'Pass' : 'FAIL');

console.log(`\nRunning perf tests ...\n`);

for (const filename in perftests) {
  const json = perftests[filename];

  const jpt0 = performance.now();
  for (let i = 0; i < repetitions; i++) JSON.parse(json);
  const jpt = performance.now() - jpt0;

  const ct0 = performance.now();
  for (let i = 0; i < repetitions; i++) crockford(json);
  const ct = performance.now() - ct0;

  const wet0 = performance.now();
  for (let i = 0; i < repetitions; i++) parse(json);
  const wet = performance.now() - wet0;

  const weft0 = performance.now();
  for (let i = 0; i < repetitions; i++) parse(json, null, null, true);
  const weft = performance.now() - weft0;

  console.log(`${filename} x ${repetitions}: JSON.parse = ${jpt.toFixed()}ms, crockford = ${ct.toFixed()}ms (${(jpt  / ct).toFixed(2)}x), parse = ${wet.toFixed()}ms (${(jpt / wet).toFixed(2)}x), parse (fastStrings) = ${weft.toFixed()}ms (${(jpt / weft).toFixed(2)}x)`);
}

process.exit(bigNumPass && fails === 0 ? 0 : 1);
