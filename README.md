# JSON custom numbers

https://github.com/jawj/json-custom-numbers

This is a heavily modified version of [Douglas Crockford's recursive-descent JSON parser](https://github.com/douglascrockford/JSON-js/blob/03157639c7a7cddd2e9f032537f346f1a87c0f6d/json_parse.js). 

These modifications:

* **enable custom number parsing** via a function you supply at parse time, which is the point of using this library

* match `JSON.parse` behaviour and the JSON spec, by allowing duplicate object keys (last value wins), and by being strict about whitespace characters, number formats (`.5`, `5.` and `05` are errors), unicode escapes, and unescaped `\t`, `\n` and control characters in strings

* significantly optimise performance

* add more informative error messages


## Conformance and compatibility

The `parse()` function matches the behaviour of `JSON.parse()` for every test in the [JSON Parsing Test Suite](https://github.com/nst/JSONTestSuite). If you find a case where behaviour (other than the wording of error messages) differs between the two, please file an issue.


## Performance

I've spent some time optimising parsing performance. This implementation is the one I found to be fastest in most scenarios. If you figure out something reliably faster, I'd be glad to hear about it.

Performance comparisons are dependent on the JavaScript engine the nature of the JSON string to be parsed. 

On Node.js (V8):

* The best case is JSON that's all long strings with few escape sequences. On these sorts of inputs, this library may be up to **25% faster** than `JSON.parse`.

* The worst case is JSON that's all strings that are mainly escape sequences. In such cases, this library may be around 3.5x slower than `JSON.parse()`.

* Typically, this library is 2 – 3x slower than `JSON.parse()`.

Performance in Bun (JavaScriptCore) is broadly similar, except the best case is about 15% slower than `JSON.parse`, rather than 25% faster.

Tests are included to compare the performance of this library, [Crockford's reference implementation]((https://github.com/douglascrockford/JSON-js/blob/03157639c7a7cddd2e9f032537f346f1a87c0f6d/json_parse.js)), and the [json-bigint](https://www.npmjs.com/package/json-bigint) and [lossless-json](https://www.npmjs.com/package/lossless-json) libraries against native `JSON.parse` across a range of inputs. Here's some example output, from Node.js 20.0 on a 2020 Intel MacBook Pro:

```
test               x   reps |  native |     this library |        crockford |      json-bigint |    lossless-json
01_typical_3kb     x  10000 |   132ms |   283ms  (x2.14) |   673ms  (x5.10) |   501ms  (x3.80) |   685ms  (x5.19)
02_typical_28kb    x   1000 |   106ms |   314ms  (x2.97) |   610ms  (x5.77) |   493ms  (x4.67) |   675ms  (x6.39)
03_mixed_83b       x  50000 |   101ms |   209ms  (x2.06) |   393ms  (x3.87) |   389ms  (x3.83) |   399ms  (x3.94)
04_short_numbers   x  50000 |   112ms |   373ms  (x3.33) |   484ms  (x4.33) |   473ms  (x4.23) |   501ms  (x4.48)
05_long_numbers    x  50000 |   101ms |   178ms  (x1.75) |   467ms  (x4.60) |   722ms  (x7.12) |   334ms  (x3.29)
06_short_strings   x  50000 |   108ms |   129ms  (x1.20) |   185ms  (x1.72) |   209ms  (x1.94) |   249ms  (x2.31)
07_long_strings    x   2500 |   152ms |   115ms  (x0.76) |  1927ms (x12.68) |  1340ms  (x8.82) |  1206ms  (x7.94)
08_string_escapes  x 100000 |   112ms |   394ms  (x3.52) |  1167ms (x10.43) |  1069ms  (x9.56) |   672ms  (x6.00)
09_bool_null       x 100000 |   104ms |   258ms  (x2.48) |   421ms  (x4.04) |   399ms  (x3.83) |   663ms  (x6.37)
10_package_json    x  25000 |   104ms |   194ms  (x1.87) |   541ms  (x5.21) |   467ms  (x4.49) |   486ms  (x4.68)
```


## Installation and use

Install:

`npm install json-custom-numbers`

Import:

`import { parse } from 'json-custom-numbers';`

For usage, see the example below and the [type definitions](dist/index.d.ts).


## Number parsing

A key application of this library is converting large integers in JSON (e.g. from Postgres query results) to [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)s.

```javascript
import { parse } from 'json-custom-numbers';

// `JSON.parse` loses precision for large integers
JSON.parse("9007199254740991"); // => 9007199254740991
JSON.parse("9007199254740993"); // => 9007199254740992

// without a `numberReviver` function, our behaviour is identical
parse("9007199254740991"); // => 9007199254740991
parse("9007199254740993"); // => 9007199254740992

// this `numberReviver` function converts only large integers to `BigInt`
function nr(s) {
  const n = +s;
  if (n >= Number.MIN_SAFE_INTEGER && n <= Number.MAX_SAFE_INTEGER) return n;
  if (s.indexOf('.') !== -1 || s.indexOf('e') !== -1 || s.indexOf('E') !== -1) return n;
  return BigInt(s);
}
parse("9007199254740991", null, nr);  // => 9007199254740991
parse("9007199254740993", null, nr);  // => 9007199254740993n
```


## Licence

Public Domain.

NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

Except: most tests in the [`test_parsing`](test/test_parsing/) folder that start with `y_`, `n_` or `i_` are from Nicolas Seriot's [JSON Test Suite](https://github.com/nst/JSONTestSuite), which is MIT licenced.
