
import fs from 'fs';
import path from 'path';
import col from 'colors/safe.js';
import { parse } from '../src/parse.mjs';
import { stringify } from '../src/stringify.mjs';
import { parse as parseCrockford } from './test_comparison/crockford_parse.mjs';
import { stringify as stringifyCrockford } from './test_comparison/crockford_stringify.mjs';
import { parse as parseBigInt, stringify as stringifyBigInt } from 'json-bigint';
import { parse as parseLossless, stringify as stringifyLossless } from 'lossless-json';

const perfOnly = process.argv[2] === '--perf-only';
const confOnly = process.argv[2] === '--conf-only';

function thoroughTransform(k, v) {
  return Array.isArray(v) ? [...v, typeof v, k, typeof k, typeof this, this.length] :
    typeof v === 'object' ? { ...v, vType: typeof v, k, kType: typeof k, thisType: typeof this, thisLength: Object.keys(this).length } :
      v === 'main' || v === false ? undefined : `v:${v},tv:${typeof v},k:${k},tk:${typeof k},tt:${typeof this},tl:${Array.isArray(this) ? this.length : Object.keys(this).length}`;
}

function undefinedTransform(k, v) {
  return undefined;
}

const folderPath = 'test/test_parsing';
const filenames = fs
  .readdirSync(folderPath)
  .filter(filename =>
    /[.]json$/.test(filename) &&
    fs.statSync(path.join(folderPath, filename)).isFile()
  )
  .sort();

function compare(filename, json, trueFn, trueFnName, testFn, testFnName, outcomes, format = JSON.stringify) {
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
    outcomes.fails += 1;

  } else if (format(testResult) !== format(trueResult)) {
    console.log(filename, json);
    console.log(`  FAIL: ${trueFnName} (${format(trueResult)}) !== ${testFnName} (${format(testResult)})\n`);
    // process.exit(1);
    outcomes.fails += 1;

  } else {
    outcomes.passes += 1;
  }
}


console.log(col.inverse((`=== parse ===\n`)));

if (!perfOnly) {
  const outcomes = { passes: 0, fails: 0 };
  console.log(col.bold(`Running JSON.parse comparison tests ...`));

  for (const filename of [...filenames, ':deep']) {
    let json;
    switch (filename) {
      case ':deep':
        const n = 1e5;
        json = JSON.parse('['.repeat(n) + '"x"' + ']'.repeat(n));
        break;

      default:
        json = fs.readFileSync(path.join(folderPath, filename), 'utf8');
    }
    compare(filename, json, JSON.parse, 'JSON.parse', parse, 'parse', outcomes);
    compare(filename, json, json => JSON.parse(json, thoroughTransform), 'JSON.parse (thorough reviver)', json => parse(json, thoroughTransform), 'parse (thorough reviver)', outcomes);
    compare(filename, json, json => JSON.parse(json, undefinedTransform), 'JSON.parse (undefined reviver)', json => parse(json, undefinedTransform), 'parse (undefined reviver)', outcomes);
  }

  console.log(`\n${outcomes.passes} passes, ${outcomes.fails} fails\n`);

  if (outcomes.fails > 0) process.exit(1);

  console.log(col.bold(`Running number parsing test ...\n`));

  const bigNumJson = "[9007199254740991, 9007199254740991.1, 900719925474099.1e1, 9007199254740993]";

  function nr(k, s) {
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

  // if (!bigNumPass) process.exit(1);

  console.log(col.bold(`\nRunning error messages test ...\n`));

  const testErr = (json, message) => {
    // return;
    let caught = undefined;
    try {
      parse(json, undefined, undefined, 3);
    } catch (err) {
      caught = err;
      // console.log(caught.message);
    }
    if (!caught || caught.message.split('\n')[0] !== message) {
      console.log('Expected error: ' + message);
      console.log(caught ? 'Got: ' + caught.message : 'No error thrown');
      outcomes.fails += 1;
    }
  }

  testErr('', `Unexpected end of JSON input, expecting JSON value`);
  testErr('x', `Unexpected 'x', expecting JSON value`);
  testErr('{', `Unexpected end of JSON input, expecting '}' or double-quoted key in object`);
  testErr('{"' + 'x'.repeat(1000) + '":"123",\n  "y": x123456789 }', `Unexpected 'x', expecting JSON value in object`);
  testErr('{"' + 'x'.repeat(1000) + '":"123","y":x123456789}', `Unexpected 'x', expecting JSON value in object`);
  testErr('{x', `Unexpected 'x', expecting '}' or double-quoted key in object`);
  testErr('{"x', `Unterminated string in object`);
  testErr('{"x"', `Unexpected end of JSON input, expecting ':' after key in object`);
  testErr('{"x":', `Unexpected end of JSON input, expecting JSON value in object`);
  testErr('{"x":x', `Unexpected 'x', expecting JSON value in object`);
  testErr('{"x":1', `Unexpected end of JSON input, expecting ',' or '}' after value in object`);
  testErr('[', `Unexpected end of JSON input, expecting JSON value in array`);
  testErr('[1', `Unexpected end of JSON input, expecting ',' or ']' after value in array`);
  testErr('[1x', `Unexpected 'x', expecting ',' or ']' after value in array`);
  testErr('[1,', `Unexpected end of JSON input, expecting JSON value in array`);
  testErr('[1,x', `Unexpected 'x', expecting JSON value in array`);
  testErr('["x', `Unterminated string in array`);
  testErr('"abc', `Unterminated string`);
  testErr('"\u0000', `Invalid unescaped \\u0000 in string`);
  testErr('"\n', `Invalid unescaped \\n in string`);
  testErr('"\t', `Invalid unescaped \\t in string`);
  testErr('"\\u"', `Invalid \\uXXXX escape in string`);
  testErr('"\\uaaa"', `Invalid \\uXXXX escape in string`);
  testErr('"\\uaaag"', `Invalid \\uXXXX escape in string`);
  testErr('"\\uaaa', `Invalid \\uXXXX escape in string`);
  testErr('"\\a"', `Invalid escape sequence: '\\a' in string`);
  testErr('"\\', `Invalid escape sequence: end of JSON input in string`);
  testErr('~', `Unexpected '~', expecting JSON value`);
  testErr('[1,2,~]', `Unexpected '~', expecting JSON value in array`);
  testErr('.1', `Unexpected '.', expecting JSON value`);
  testErr('1.', `Unexpected data after end of JSON input`);
  testErr('01', `Unexpected data after end of JSON input`);
  testErr('[01]', `Unexpected '1', expecting ',' or ']' after value in array`);
  testErr('[1,\u0000]', `Unexpected \\u0000, expecting JSON value in array`);
  testErr('"\\×"', `Invalid escape sequence: '\\×' or \\u00d7 in string`);
  testErr(`"\\
  `, `Invalid escape sequence: \\n in string`);
  testErr('[100,[100,[100,[1]]]]', 'JSON structure too deeply nested (current max depth: 3) in array');
  
  if (outcomes.fails > 0) process.exit(1);

  console.log('Pass\n');
}

const cpuUsage = (prev) => {
  if (process.cpuUsage) {
    const usage = process.cpuUsage(prev);
    return prev ? (usage.user + usage.system) : usage;
  } else {
    const usage = 1000 * (performance.now ? performance.now() : Date.now());
    return usage - (prev ?? 0);
  }
}

export function median(data) {
  const { length } = data;
  data.sort((a, b) => a - b);
  return length % 2 === 1 ?
    data[(length - 1) * .5] :
    .5 * data[length * .5 - 1] + .5 * data[length * .5];
}

const ljust = (s, len) => s + ' '.repeat(Math.max(0, len - s.length));
const rjust = (s, len) => ' '.repeat(Math.max(0, len - s.length)) + s;

const repsPerTrial = 50;
const perf = (reps, baseline, fn) => {
  const timings = [];
  for (let i = 0; i < reps / repsPerTrial; i++) {
    const t0 = cpuUsage();
    for (let j = 0; j < repsPerTrial; j ++) fn();
    const t = cpuUsage(t0) / repsPerTrial;
    timings.push(t);
  }
  const t = median(timings);
  
  let result = rjust(t.toFixed(1), 6) + 'μs';
  if (typeof baseline === 'number') {
    const factor = t / baseline;
    const highlight = factor < 1 ? col.green : factor > 10 ? col.red : factor > 5 ? col.yellow : x => x;
    result += highlight(rjust(`(x${factor.toFixed(2)})`, 9));
  }
  return [result, t];
};

if (!confOnly) {
  console.log(col.bold(`Running perf tests ...\n`));
  console.log(col.bold(`test               x   reps |   native |      this library |         crockford |       json-bigint |     lossless-json`));

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
  const outcomes = { passes: 0, fails: 0 };
  console.log(col.bold(`Running JSON.stringify comparison tests ...`));

  class X {
    #a = 1;
    b = 2;
  }

  class Y {
    x = 'y';
    toJSON(key) {
      return { yx: this.x, withKey: key };
    }
  }

  for (const filename of [...filenames, ':mixed', ':circular', ':repeat-obj', ':deep']) {
    let obj;
    switch (filename) {
      case ':mixed':
        // wide range of non-JSON types
        obj = {
          a: 0, b: "", c: null, d: undefined, e: new Date(), f: /./, g: X, h: new X(), i: 1 + undefined, j: Infinity,
          k: [0, "", null, undefined, new Date(), /./, X, new X(), 1 + undefined, Infinity], l: new Y(), m: []
        };
        break;

      case ':circular':
        // circular reference
        obj = { a: 1 };
        obj.b = obj;
        break;

      case ':repeat-obj':
        // non-circular repeated reference
        const ref = [1];
        obj = { a: ref, b: ref };
        break;

      case ':deep':
        // deeply-nested object
        const n = 1e5;  // all implementations are expected to fail at this depth
        obj = JSON.parse('['.repeat(n) + ']'.repeat(n));
        break;

      default:
        if (/^[niz]_/.test(filename)) continue;
        const json = fs.readFileSync(path.join(folderPath, filename), 'utf8');
        obj = JSON.parse(json);
    }

    for (const replacer of [undefined, ['a', 'x', 'users', 12], /./, thoroughTransform, undefinedTransform]) {
      for (const indent of [undefined, 2, 15, ' '.repeat(15), '\t', '--']) {
        compare(filename, obj, x => JSON.stringify(x, replacer, indent), 'JSON.stringify', x => stringify(x, replacer, indent), 'stringify', outcomes, x => x);
      }
    }
  }

  console.log(`\n${outcomes.passes} passes, ${outcomes.fails} fails\n`);

  const bigInt = 9007199254740993n
  const bigIntJSON = stringify(bigInt, undefined, undefined, (k, v, t) => { if (t === 'bigint') return v.toString() });
  console.log(bigIntJSON);
  if (bigIntJSON === bigInt.toString()) console.log('Pass: BigInt stringified\n');
  else console.log('Fail: BigInt stringify failed\n');

  if (outcomes.fails > 0) process.exit(1);
}

if (!confOnly) {
  console.log(col.bold(`Running perf tests ...\n`));
  console.log(col.bold(`test               x   reps |   native |      this library |         crockford |       json-bigint |     lossless-json`));

  for (const filename of filenames) {
    if (!filename.startsWith('perf_')) continue;
    const json = fs.readFileSync(path.join(folderPath, filename), 'utf8');
    const obj = JSON.parse(json);
    const [, name, repsStr] = filename.match(/^perf_(.+)_x([0-9]+)[.]json$/) ?? [, 'Perf test', 10000];
    const reps = Number(repsStr);

    const [baselineResult, t] = perf(reps, null, () => JSON.stringify(obj));
    const [stringifyResult] = perf(reps, t, () => stringify(obj));
    const [crockfordResult] = perf(reps, t, () => stringifyCrockford(obj));
    const [bigIntResult] = perf(reps, t, () => stringifyBigInt(obj));
    const [losslessResult] = perf(reps, t, () => stringifyLossless(obj));

    const title = `${ljust(name, 18)} x ${rjust(repsStr, 6)}`;
    console.log(`${title} | ${baselineResult} | ${stringifyResult} | ${crockfordResult} | ${bigIntResult} | ${losslessResult}`);
  }

  console.log();
}
