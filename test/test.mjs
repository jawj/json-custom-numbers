import fs from 'fs';
import path from 'path';
import col from 'colors/safe.js';
import { parse } from '../src/parse.mjs';
import { stringify } from '../src/stringify.mjs';
import { parse as parseCrockford } from './test_comparison/crockford_parse.mjs';
import { parse as parseBigInt } from 'json-bigint';
import { parse as parseLossless } from 'lossless-json';

const perfOnly = process.argv[2] === '--perf-only';
const confOnly = process.argv[2] === '--conf-only';

const folderPath = 'test/test_parsing';
const filenames = fs
  .readdirSync(folderPath)
  .filter(filename =>
    /[.]json$/.test(filename) &&
    fs.statSync(path.join(folderPath, filename)).isFile()
  )
  .sort();


console.log(col.inverse((`=== parse ===\n`)));

if (!perfOnly) {
  let passes = 0, fails = 0;
  console.log(col.bold(`Running JSON.parse comparison tests ...`));

  function compare(filename, json, trueFn, trueFnName, testFn, testFnName) {
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
      console.log(`  FAIL: ${trueFnName} ${trueErr ? 'error' : 'OK'}, ${testFnName} ${testErr ? 'error' : 'OK'}\n`);
      // process.exit(1);
      fails += 1;

    } else if (JSON.stringify(testResult) !== JSON.stringify(trueResult)) {
      console.log(filename, json);
      console.log(`  FAIL: ${trueFnName} (${JSON.stringify(trueResult)}) !== ${testFnName} (${JSON.stringify(testResult)})\n`);
      // process.exit(1);
      fails += 1;

    } else {
      passes += 1;
    }
  }

  for (const filename of filenames) {
    const json = fs.readFileSync(path.join(folderPath, filename), 'utf8');
    compare(filename, json, JSON.parse, 'JSON.parse', parse, 'parse');
  }

  console.log(`\n${passes} passes, ${fails} fails\n`);

  if (fails > 0) process.exit(1);


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

  if (!bigNumPass) process.exit(1);


  console.log(col.bold(`\nRunning error messages test ...\n`));

  const testErr = (json, message) => {
    let caught = undefined;
    try {
      parse(json);
    } catch (err) {
      caught = err;
    }
    if (!caught || !caught.message.startsWith(message)) {
      console.log('Expected error: ' + message);
      console.log(caught ? 'Got: ' + caught.message : 'No error thrown');
      fails += 1;
    }
  }

  testErr('{', `Expected '"' but got end of input in object`);
  testErr('{x', `Expected '"' but got 'x' in object`);
  testErr('{"x', `Unterminated string`);
  testErr('{"x"', `Expected ':' but got end of input after key in object`);
  testErr('{"x":', `Unexpected character or end of input`);
  testErr('{"x":x', `Unexpected character or end of input`);
  testErr('{"x":1', `Expected ',' or '}' but got end of input after value in object`);
  testErr('[', `Unterminated array`);
  testErr('[1', `Expected ',' but got end of input after array element`);
  testErr('[1x', `Expected ',' but got 'x' after array element`);
  testErr('[1,', `Unterminated array`);
  testErr('[1,x', `Unexpected character or end of input`);
  testErr('"abc', `Unterminated string`);
  testErr('"\u0000', `Invalid unescaped control character (\\u0000) in string`);
  testErr('"\n', `Invalid unescaped newline (\\u000a) in string`);
  testErr('"\t', `Invalid unescaped tab (\\u0009) in string`);
  testErr('"\\u"', `Invalid \\uXXXX escape in string`);
  testErr('"\\uaaa"', `Invalid \\uXXXX escape in string`);
  testErr('"\\uaaag"', `Invalid \\uXXXX escape in string`);
  testErr('"\\a"', `Invalid escape sequence '\\a' in string`);
  testErr('~', `Unexpected character or end of input`);
  testErr('[1,2,~]', `Unexpected character or end of input`);
  testErr('.1', `Unexpected character or end of input`);
  testErr('1.', `Unexpected data at end of input`);
  testErr('01', `Unexpected data at end of input`);
  testErr('[01]', `Expected ',' but got '1' after array element`);

  if (fails > 0) process.exit(1);

  console.log('Pass\n');
}

if (!confOnly) {
  console.log(col.bold(`Running perf tests ...\n`));

  const cpuUsage = (prev) => {
    if (process.cpuUsage) {
      const usage = process.cpuUsage(prev);
      return prev ? (usage.user + usage.system) * .001 : usage;
    } else {
      const usage = performance.now ? performance.now() : Date.now();
      return usage - (prev ?? 0);
    }
  }

  const ljust = (s, len) => s + ' '.repeat(Math.max(0, len - s.length));
  const rjust = (s, len) => ' '.repeat(Math.max(0, len - s.length)) + s;
  const perf = (reps, baseline, fn) => {
    if (global.gc) global.gc();

    const t0 = cpuUsage();
    for (let i = 0; i < reps; i++) fn();
    if (global.gc) global.gc();
    const t = cpuUsage(t0);

    let result = rjust(t.toFixed(), 5) + 'ms';
    if (typeof baseline === 'number') {
      const factor = t / baseline;
      const highlight = factor < 1 ? col.green : factor > 10 ? col.red : factor > 5 ? col.yellow : x => x;
      result += highlight(rjust(`(x${factor.toFixed(2)})`, 9));
    }
    return [result, t];
  };

  console.log(col.bold(`test               x   reps |  native |     this library |        crockford |      json-bigint |    lossless-json`));

  for (const filename of filenames) {
    if (!filename.startsWith('perf_')) continue;
    const json = fs.readFileSync(path.join(folderPath, filename), 'utf8');
    const [, name, repsStr] = filename.match(/^perf_(.+)_x([0-9]+)[.]json$/) ?? [, 'Perf test', 10000];
    const reps = Number(repsStr);

    const [baselineResult, t] = perf(reps, null, () => JSON.parse(json));
    const [parseResult] = perf(reps, t, () => parse(json));
    const [crockfordResult] = perf(reps, t, () => parseCrockford(json));
    const [bigIntResult] = perf(reps, t, () => parseBigInt(json));
    const [losslessResult] = perf(reps, t, () => parseLossless(json, undefined, s => parseFloat(s)));

    const title = `${ljust(name, 18)} x ${rjust(repsStr, 6)}`;
    console.log(`${title} | ${baselineResult} | ${parseResult} | ${crockfordResult} | ${bigIntResult} | ${losslessResult}`);
  }

  console.log();
}


console.log(col.inverse((`=== stringify ===\n`)));

if (!perfOnly) {
  let passes = 0, fails = 0;
  console.log(col.bold(`Running JSON.stringify comparison tests ...`));

  function compare(filename, obj, trueFn, trueFnName, testFn, testFnName) {
    for (const replacer of [undefined, ['a', 'x', 'users'], (k, v) => v + v, /./]) {
      for (const indent of [undefined, 2, '\t', '--']) {
        const trueResult = trueFn(obj, replacer, indent);
        const testResult = testFn(obj, replacer, indent);
        if (trueResult !== testResult) {
          console.log(filename, obj);
          console.log(`  FAIL: ${trueFnName} (${trueResult}) !== ${testFnName} (${testResult})\n`);
          // process.exit(1);
          fails += 1;

        } else {
          passes += 1;
        }
      }
    }
  }

  class X {
    #a = 1;
    b = 2;
  }

  for (const filename of [...filenames, null]) {
    let obj;

    if (filename === null) {
      obj = {
        a: 0, b: "", c: null, d: undefined, e: new Date(), f: /./, g: X, h: new X(), i: 1 + undefined, j: Infinity,
        k: [0, "", null, undefined, new Date(), /./, X, new X(), 1 + undefined, Infinity]
      };

    } else {
      if (/^[niz]_/.test(filename)) continue;
      const json = fs.readFileSync(path.join(folderPath, filename), 'utf8');
      obj = JSON.parse(json);
    }

    compare(filename, obj, JSON.stringify, 'JSON.stringify', stringify, 'stringify');
  }

  console.log(`\n${passes} passes, ${fails} fails\n`);

  if (fails > 0) process.exit(1);
}
