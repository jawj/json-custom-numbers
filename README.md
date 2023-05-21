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

* The best case is JSON that contains mainly long strings with few escape sequences. This library may then be over 10x **faster** than `JSON.parse()`, if full string checking is turned off. With full string checking turned on (the default), it's still around 2x faster.

* The worst case is JSON that contains only short numeric values, `true`, `false` or `null`. This library may then be 4 - 5x slower than `JSON.parse()`.

* Typically, this library is 2 – 3x slower than `JSON.parse()`. Unless you're regularly parsing very large JSON strings, the difference probably isn't very important.

On Bun 0.6.1 (JavaScriptCore engine):

* Performance on Bun is somwehat more consistent across different JSON strings than Node. It's typically 2 - 4x slower than `JSON.parse`.

I compared several alternative approaches to number and string parsing. The implementations currently used are the ones I found to be fastest in most scenarios. If you figure out something reliably faster, I'd be glad to hear about it.

This is an example of performance test output (from a 2020 Intel MacBook Pro):

```
perf_bool_null.json x 10000       | JSON.parse   17ms | Crockford    63ms ( 0.27x) | parse (lax strings)    58ms ( 0.30x) | parse    44ms ( 0.39x)
perf_long_numbers.json x 10000    | JSON.parse   21ms | Crockford   104ms ( 0.21x) | parse (lax strings)    49ms ( 0.44x) | parse    59ms ( 0.36x)
perf_long_strings.json x 10000    | JSON.parse  666ms | Crockford  6421ms ( 0.10x) | parse (lax strings)    40ms (16.57x) | parse   311ms ( 2.14x)
perf_short_numbers.json x 10000   | JSON.parse   22ms | Crockford   109ms ( 0.20x) | parse (lax strings)   102ms ( 0.21x) | parse    97ms ( 0.23x)
perf_short_strings.json x 10000   | JSON.parse   20ms | Crockford    40ms ( 0.51x) | parse (lax strings)    39ms ( 0.52x) | parse    46ms ( 0.44x)
perf_typical_i.json x 10000       | JSON.parse  135ms | Crockford   597ms ( 0.23x) | parse (lax strings)   255ms ( 0.53x) | parse   312ms ( 0.43x)
perf_typical_ii.json x 10000      | JSON.parse   18ms | Crockford    66ms ( 0.28x) | parse (lax strings)    53ms ( 0.34x) | parse    58ms ( 0.31x)
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
