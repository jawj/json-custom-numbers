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
test               x  reps |  native |        crockford |     this, strict |        this, lax
01_typical_3kb     x 25000 |   347ms |  1433ms  (x4.13) |   810ms  (x2.33) |   705ms  (x2.03)
02_typical_28kb    x  5000 |   490ms |  2840ms  (x5.80) |  1858ms  (x3.79) |  1665ms  (x3.40)
03_mixed_83b       x 50000 |   102ms |   385ms  (x3.76) |   250ms  (x2.44) |   216ms  (x2.11)
04_short_numbers   x 50000 |   105ms |   676ms  (x6.42) |   495ms  (x4.70) |   492ms  (x4.67)
05_long_numbers    x 50000 |   101ms |   501ms  (x4.94) |   219ms  (x2.16) |   202ms  (x1.99)
06_short_strings   x 50000 |    98ms |   298ms  (x3.05) |   247ms  (x2.54) |   210ms  (x2.16)
07_long_strings    x  5000 |   256ms |  3953ms (x15.43) |   138ms  (x0.54) |    17ms  (x0.07)
08_string_escapes  x 75000 |    70ms |   975ms (x13.87) |   607ms  (x8.64) |   523ms  (x7.44)
09_bool_null       x 75000 |    77ms |   521ms  (x6.79) |   320ms  (x4.18) |   319ms  (x4.17)
```

## Usage

For usage, see [the type definitions](dist/index.d.ts).

## Number parsing

A key application of this library is converting large integers in JSON (e.g. from Postgres query results) to [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)s.

```javascript
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
