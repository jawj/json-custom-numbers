# JSON custom numbers

https://github.com/jawj/json-custom-numbers

This is a heavily modified version of [Douglas Crockford's recursive-descent JSON parser](https://github.com/douglascrockford/JSON-js/blob/03157639c7a7cddd2e9f032537f346f1a87c0f6d/json_parse.js). 

These modifications:

* **enable custom number parsing**, via a function you supply at parse time

* accelerate parsing, especially of long strings (by using `indexOf`), and in general by inlining short functions

* match `JSON.parse` behaviour by allowing duplicate object keys (last value wins), and by being strict about whitespace characters, number formats (`.5`, `5.` and `05` are errors), unicode escapes, and (optionally) unescaped `\t`, `\n` and control characters in strings.

## Conformance and compatibility

When full string checking is not explicitly turned off, the `parse()` function matches the behaviour of `JSON.parse()` for every test in the [JSON Parsing Test Suite](https://github.com/nst/JSONTestSuite), and a few more.

## Performance

Performance comparisons are very dependent on the nature of the JSON string to be parsed and the JavaScript engine used. 

On Node.js 18.10 and 20.0 (V8 engine):

* The best case is JSON that contains mainly long strings with few escape sequences. This library may then be over 10x **faster** than `JSON.parse()`, if full string checking is turned off. With full string checking turned on (the default), it's still up to 2x faster.

* The worst case is JSON that contains strings comprised entirely of escape sequences. This library may then be up to 10x slower than `JSON.parse()`.

* Typically, this library is 2 – 4x slower than `JSON.parse()`. Unless you're regularly parsing very large JSON strings, the difference probably isn't very important.

On Bun 0.6.1 (JavaScriptCore engine):

* Performance on Bun is somewhat more consistent across different JSON strings than Node, and also typically 2 - 4x slower than `JSON.parse`.

I compared several alternative approaches to number and string parsing. The implementations currently used are the ones I found to be fastest in most scenarios. If you figure out something reliably faster, I'd be glad to hear about it.

This is an example of performance test output (on a 2020 Intel MacBook Pro):

```
test               x   reps |  native |        crockford |     this, strict |     this, faster
01_typical_3kb     x  25000 |   279ms |  1450ms  (x5.21) |   805ms  (x2.89) |   623ms  (x2.24)
02_typical_28kb    x   5000 |   403ms |  2829ms  (x7.03) |  1792ms  (x4.45) |  1540ms  (x3.82)
03_mixed_83b       x  50000 |   101ms |   393ms  (x3.90) |   266ms  (x2.64) |   228ms  (x2.26)
04_short_numbers   x  50000 |    97ms |   607ms  (x6.23) |   468ms  (x4.80) |   462ms  (x4.74)
05_long_numbers    x  50000 |   102ms |   492ms  (x4.85) |   219ms  (x2.15) |   209ms  (x2.06)
06_short_strings   x  50000 |    98ms |   295ms  (x3.02) |   206ms  (x2.10) |   155ms  (x1.58)
07_long_strings    x   5000 |   235ms |  3399ms (x14.45) |   134ms  (x0.57) |    15ms  (x0.06)
08_string_escapes  x 100000 |    90ms |  1105ms (x12.33) |   541ms  (x6.03) |   445ms  (x4.96)
09_bool_null       x 100000 |    88ms |   639ms  (x7.29) |   438ms  (x5.00) |   376ms  (x4.29)
```

## Usage

For usage, see [the type definitions](dist/index.d.ts).

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
  if (s.indexOf('.') !== -1 || s.indexOf('e') !== -1 && s.indexOf('E') !== -1) return n;
  return BigInt(s);
}
parse("9007199254740991", null, nr);  // => 9007199254740991
parse("9007199254740993", null, nr);  // => 9007199254740993n
```

## Licence

Public Domain.

NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

Except: tests in the [`test_parsing`](test/test_parsing/) folder that start with `y_`, `n_` or `i_` are from Nicolas Seriot's [JSON Test Suite](https://github.com/nst/JSONTestSuite), which is MIT licenced.
