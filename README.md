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

On Node.js (18.10, V8):

* The best case is JSON that's all long strings with few escape sequences. On these sorts of inputs, this library may be about **15% faster** than `JSON.parse`.

* The worst case is JSON that's all strings that are mainly escape sequences. In such cases, this library may be around 4x slower than `JSON.parse()`.

* Typically, this library is 2 – 3x slower than `JSON.parse()`.

Performance in Bun (0.6.1, JavaScriptCore) is very similar, except the best case is about 25% slower than `JSON.parse`, rather than 15% faster.

Tests are included to compare the performance of this library, [Crockford's reference implementation]((https://github.com/douglascrockford/JSON-js/blob/03157639c7a7cddd2e9f032537f346f1a87c0f6d/json_parse.js)), and the [json-bigint](https://www.npmjs.com/package/json-bigint) library against native `JSON.parse` across a range of inputs. Here's some example output, from Node.js 18.10 on a 2020 Intel MacBook Pro:

```
test               x   reps |  native |        crockford |      json-bigint |     this library
01_typical_3kb     x  10000 |   140ms |   606ms  (x4.33) |   573ms  (x4.09) |   306ms  (x2.18)
02_typical_28kb    x   1000 |    95ms |   594ms  (x6.23) |   574ms  (x6.02) |   281ms  (x2.95)
03_mixed_83b       x  50000 |   108ms |   389ms  (x3.61) |   450ms  (x4.18) |   198ms  (x1.84)
04_short_numbers   x  50000 |   106ms |   544ms  (x5.12) |   605ms  (x5.70) |   372ms  (x3.50)
05_long_numbers    x  50000 |   100ms |   448ms  (x4.50) |   789ms  (x7.92) |   177ms  (x1.78)
06_short_strings   x  50000 |   101ms |   272ms  (x2.69) |   266ms  (x2.64) |   149ms  (x1.47)
07_long_strings    x   2500 |   131ms |  1691ms (x12.93) |  1339ms (x10.24) |   109ms  (x0.83)
08_string_escapes  x 100000 |   105ms |  1095ms (x10.44) |  1061ms (x10.12) |   413ms  (x3.94)
09_bool_null       x 100000 |   106ms |   616ms  (x5.81) |   630ms  (x5.94) |   255ms  (x2.41)
10_package_json    x  25000 |    87ms |   543ms  (x6.25) |   532ms  (x6.13) |   168ms  (x1.93)
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

Except: tests in the [`test_parsing`](test/test_parsing/) folder that start with `y_`, `n_` or `i_` are from Nicolas Seriot's [JSON Test Suite](https://github.com/nst/JSONTestSuite), which is MIT licenced.
