import { parse } from '../src/parse.mjs';
import fs from 'fs';
import path from 'path';

const folderPath = 'test/test_parsing';
const filenames = fs
  .readdirSync(folderPath)
  .filter(filename =>
    /^perf_.+[.]json$/.test(filename) &&
    fs.statSync(path.join(folderPath, filename)).isFile()
  )
  .sort();

let mixedJson = '{"x":1';
for (const filename of filenames) {
  const json = fs.readFileSync(path.join(folderPath, filename), 'utf8');
  mixedJson += `,"${filename}":${json}`;
}
mixedJson += '}';

const t0 = performance.now();
for (let i = 0; i < 1000; i ++) parse(mixedJson);
const t = performance.now() - t0;

console.log(t);
