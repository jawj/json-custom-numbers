# JSON custom numbers

https://github.com/jawj/json-custom-numbers

This is a heavily modified version of [Douglas Crockford's recursive-descent JSON parser](https://github.com/douglascrockford/JSON-js/blob/03157639c7a7cddd2e9f032537f346f1a87c0f6d/json_parse.js). 

These modifications:

* **enable custom number parsing** via a function you supply at parse time, which is the point of using this library

* match `JSON.parse` behaviour by allowing duplicate object keys (last value wins), and by being strict about whitespace characters, number formats (`.5`, `5.` and `05` are errors), unicode escapes, and unescaped `\t`, `\n` and control characters in strings

* significantly optimise performance

* add more informative error messages


## Conformance and compatibility

The `parse()` function matches the behaviour of `JSON.parse()` for every test in the [JSON Parsing Test Suite](https://github.com/nst/JSONTestSuite). If you find a case where behaviour (other than the wording of error messages) differs between the two, please file an issue.


## Performance

I've spent some time optimising parsing performance. This implementation is the one I found to be fastest in most scenarios. If you figure out something reliably faster, I'd be glad to hear about it.

Performance comparisons are dependent on the JavaScript engine and on the nature of the JSON string to be parsed. 

On Node.js (V8):

* The best case is JSON that's all long strings with few escape sequences. On these sorts of inputs, this library may be up to **20% faster** than `JSON.parse`.

* The worst case is JSON that's all strings that are mainly escape sequences. In such cases, this library may be around 3.5x slower than `JSON.parse()`.

* Typically, this library is 2 – 3x slower than `JSON.parse()`.

Performance in Bun (JavaScriptCore) is broadly similar, except the best case is about 20% slower than `JSON.parse`, rather than 20% faster.

Tests are included to compare the performance of this library, [Crockford's reference implementation]((https://github.com/douglascrockford/JSON-js/blob/03157639c7a7cddd2e9f032537f346f1a87c0f6d/json_parse.js)), and the [json-bigint](https://www.npmjs.com/package/json-bigint) and [lossless-json](https://www.npmjs.com/package/lossless-json) libraries against native `JSON.parse` across a range of inputs. Here's some example output, from Node.js 20.0 on a 2020 Intel MacBook Pro:

```
test               x   reps |  native |     this library |        crockford |      json-bigint |    lossless-json
01_typical_3kb     x  10000 |   128ms |   287ms  (x2.24) |   614ms  (x4.79) |   468ms  (x3.65) |   638ms  (x4.98)
02_typical_28kb    x   1000 |   100ms |   296ms  (x2.96) |   541ms  (x5.42) |   466ms  (x4.67) |   642ms  (x6.43)
03_mixed_83b       x  50000 |    93ms |   207ms  (x2.21) |   339ms  (x3.63) |   365ms  (x3.91) |   380ms  (x4.07)
04_short_numbers   x  50000 |   112ms |   368ms  (x3.27) |   454ms  (x4.04) |   436ms  (x3.88) |   484ms  (x4.30)
05_long_numbers    x  50000 |   100ms |   173ms  (x1.73) |   432ms  (x4.30) |   674ms  (x6.71) |   321ms  (x3.20)
06_short_strings   x  50000 |   100ms |   116ms  (x1.16) |   178ms  (x1.78) |   196ms  (x1.96) |   237ms  (x2.36)
07_long_strings    x   2500 |   142ms |   109ms  (x0.77) |  1761ms (x12.37) |  1245ms  (x8.75) |  1121ms  (x7.88)
08_string_escapes  x 100000 |   108ms |   375ms  (x3.47) |  1069ms  (x9.89) |  1016ms  (x9.41) |   616ms  (x5.70)
09_bool_null       x 100000 |    99ms |   238ms  (x2.40) |   400ms  (x4.03) |   395ms  (x3.98) |   584ms  (x5.89)
10_package_json    x  25000 |   103ms |   189ms  (x1.83) |   534ms  (x5.16) |   484ms  (x4.68) |   481ms  (x4.66)
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
