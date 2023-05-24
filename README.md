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

On Node.js 18.10 and 20.0 (V8):

* The best case is JSON that contains mainly long strings with few escape sequences. This library may then be **over 10x faster** than native `JSON.parse()` if checking for unescaped tabs, newlines and control characters is turned off, and still up to 2x faster if it's turned on (which is the default).

* The worst case is JSON that contains mainly short numbers and/or strings comprised entirely of escape sequences. This library may then be around 5x slower than `JSON.parse()`.

* Typically, this library is 2 – 4x slower than `JSON.parse()`. Unless you're regularly parsing very large JSON strings, the difference probably isn't very important.

On Bun 0.6.1 (JavaScriptCore):

* Performance in Bun is slightly worse: typically 3 - 5x slower than native `JSON.parse` (except for string escape sequences, which may be up to 10x slower).

I compared several alternative approaches to number and string parsing. The implementations currently used are the ones I found to be fastest in most scenarios. If you figure out something reliably faster, I'd be glad to hear about it.

This is an example of performance test output (on a 2020 Intel MacBook Pro):

```
test               x   reps |  native |        crockford |     this, strict |     this, faster
01_typical_3kb     x  25000 |   363ms |  1554ms  (x4.28) |   793ms  (x2.19) |   654ms  (x1.80)
02_typical_28kb    x   5000 |   506ms |  3100ms  (x6.13) |  1911ms  (x3.78) |  1752ms  (x3.46)
03_mixed_83b       x  50000 |    99ms |   371ms  (x3.75) |   255ms  (x2.58) |   215ms  (x2.18)
04_short_numbers   x  50000 |   103ms |   538ms  (x5.24) |   466ms  (x4.54) |   454ms  (x4.42)
05_long_numbers    x  50000 |    95ms |   453ms  (x4.77) |   229ms  (x2.42) |   209ms  (x2.20)
06_short_strings   x  50000 |   102ms |   187ms  (x1.83) |   225ms  (x2.22) |   171ms  (x1.68)
07_long_strings    x   5000 |   274ms |  3991ms (x14.59) |   146ms  (x0.53) |    14ms  (x0.05)
08_string_escapes  x 100000 |    99ms |  1105ms (x11.15) |   428ms  (x4.32) |   403ms  (x4.07)
09_bool_null       x 100000 |    97ms |   408ms  (x4.20) |   378ms  (x3.88) |   375ms  (x3.85)
10_package_json    x  25000 |   105ms |   605ms  (x5.79) |   252ms  (x2.41) |   198ms  (x1.90)
```

## Installation and use

To install, run `npm install json-custom-numbers`.

Import with one of: 

* `import { parse } from 'json-custom-numbers';` — for behaviour that exactly matches `JSON.parse`.

* `import { parse } from 'json-custom-numbers/faster';` — to gain some performance by allowing unescaped `\n`, `\t` and control characters in strings (as Crockford's reference implementation does).

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
