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
01_typical_3kb     x  10000 |   131ms |   636ms  (x4.85) |   487ms  (x3.71) |   271ms  (x2.06)
02_typical_28kb    x   1000 |   105ms |   647ms  (x6.18) |   499ms  (x4.76) |   316ms  (x3.02)
03_mixed_83b       x  50000 |   111ms |   384ms  (x3.46) |   388ms  (x3.50) |   202ms  (x1.82)
04_short_numbers   x  50000 |   107ms |   512ms  (x4.78) |   483ms  (x4.51) |   382ms  (x3.57)
05_long_numbers    x  50000 |   102ms |   466ms  (x4.59) |   715ms  (x7.04) |   179ms  (x1.76)
06_short_strings   x  50000 |   105ms |   187ms  (x1.78) |   216ms  (x2.06) |   125ms  (x1.19)
07_long_strings    x   2500 |   143ms |  1896ms (x13.25) |  1355ms  (x9.47) |   107ms  (x0.75)
08_string_escapes  x 100000 |   110ms |  1122ms (x10.16) |  1069ms  (x9.68) |   371ms  (x3.36)
09_bool_null       x 100000 |   100ms |   417ms  (x4.19) |   411ms  (x4.13) |   254ms  (x2.56)
10_package_json    x  25000 |   101ms |   518ms  (x5.11) |   460ms  (x4.54) |   190ms  (x1.88)
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
