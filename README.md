# JSON custom numbers

https://github.com/jawj/json-custom-numbers

This package implements JSON `parse` and `stringify` functions to support custom number parsing and stringification.

Similar packages exist, but this one has some attractive features:

* Totally flexible number parsing and stringification, via functions you supply.

* Drop-in replacement for native `JSON.parse` and `JSON.stringify`: aims to exactly reproduce all other native behaviour.

* Non-recursive implementations, meaning deeply nested objects can't overflow the call stack.

* Faster than the alternatives.

* Informative error messages.

Note: the `stringify()` function makes use of native `JSON.stringify()` for string escaping, and is thus not a full replacement for the native function. If this is a problem for you, let me know: `replace()`, which is slightly slower, can easily be used for escaping instead.


## Conformance and compatibility

The `parse()` function matches the behaviour of `JSON.parse()` for every test in the [JSON Parsing Test Suite](https://github.com/nst/JSONTestSuite), and a few more besides.

The `stringify()` function matches `JSON.stringify()` for every valid case in the suite, and some others, with a variety of `indent` and `replacer` arguments.


### Known differences

* The `stringify()` implementation is non-recursive, and the maximum allowable nesting depth is thus explicitly configurable (and defaults to 50,000). By contrast, native `JSON.stringify()` appears to be implemented with recursion, and maximum depth is thus limited by the call stack size.

* Error messages do not match any of the native implementations (which are all different).

If you discover any other behaviour that differs between these functions and the native JSON functions, please file an issue.


## Performance

I've put some effort into optimising performance, and this library is substantially faster than similar libraries.

Performance comparisons depend both on the JavaScript engine and on the nature of the JSON data to be parsed/generated. If you figure out how to make either `parse()` or `stringify()` reliably faster, I'd be glad to hear about it.


### Parse

On Node.js 20:

* The best case is JSON that's all long strings with few escape sequences. On these sorts of inputs, this library may be **25% faster** than `JSON.parse()`.

* Typically, this library is 2 – 4x slower than `JSON.parse()`.

Tests are included to compare the performance of this library, [Crockford's reference implementation](https://github.com/douglascrockford/JSON-js/blob/03157639c7a7cddd2e9f032537f346f1a87c0f6d/json_parse.js), and the [json-bigint](https://www.npmjs.com/package/json-bigint) and [lossless-json](https://www.npmjs.com/package/lossless-json) libraries against native `JSON.parse` across a range of inputs. 

Reported timings represent a single `parse()` operation, and are the median of 50 trials of `reps`/50 operations each. Numbers in parentheses are the multiple of the time taken by native `JSON.parse()`.

Here's some example output, from Node.js 20.0 on a 2020 Intel MacBook Pro.

**Lower numbers are better**

```
test               x   reps |  native |     this library |        crockford |      json-bigint |    lossless-json
01_typical_3kb     x  10000 |  12.0μs |  20.5μs  (x1.71) |  54.0μs  (x4.49) |  42.7μs  (x3.55) |  58.1μs  (x4.83)
02_typical_28kb    x   1000 |  94.2μs | 287.0μs  (x3.05) | 549.2μs  (x5.83) | 454.4μs  (x4.82) | 600.3μs  (x6.37)
03_mixed_83b       x  50000 |   1.7μs |   3.0μs  (x1.72) |   6.4μs  (x3.70) |   6.5μs  (x3.78) |   5.7μs  (x3.31)
04_short_numbers   x  50000 |   1.9μs |   6.2μs  (x3.31) |   9.2μs  (x4.89) |   8.9μs  (x4.71) |   8.2μs  (x4.36)
05_long_numbers    x  50000 |   1.8μs |   2.9μs  (x1.58) |   8.2μs  (x4.52) |  12.8μs  (x7.03) |   4.5μs  (x2.47)
06_short_strings   x  50000 |   1.9μs |   2.1μs  (x1.11) |   3.3μs  (x1.74) |   3.7μs  (x1.94) |   3.4μs  (x1.79)
07_long_strings    x   2500 |  53.4μs |  39.8μs  (x0.74) | 743.8μs (x13.92) | 537.4μs (x10.06) | 448.2μs  (x8.39)
08_string_escapes  x 100000 |   1.0μs |   3.8μs  (x3.98) |  10.7μs (x11.15) |  10.0μs (x10.42) |   5.8μs  (x6.04)
09_bool_null       x 100000 |   1.0μs |   2.1μs  (x2.21) |   3.9μs  (x4.04) |   3.7μs  (x3.85) |   5.6μs  (x5.88)
10_package_json    x  25000 |   4.6μs |   7.3μs  (x1.61) |  32.9μs  (x7.22) |  27.6μs  (x6.06) |  24.0μs  (x5.27)
11_deep_nesting    x   1000 | 293.5μs | 374.9μs  (x1.28) | 543.1μs  (x1.85) | 508.2μs  (x1.73) | 607.7μs  (x2.07)
```

### Stringify

The numbers for `stringify()` follow a more or less similar pattern, but performance differences between `JSON.stringify()`, this library and other libraries are generally smaller:

**Lower numbers are better**

```
test               x   reps |  native |     this library |        crockford |      json-bigint |    lossless-json
01_typical_3kb     x  10000 |   8.2μs |  16.7μs  (x2.02) |  25.0μs  (x3.03) |  26.6μs  (x3.23) |  27.3μs  (x3.31)
02_typical_28kb    x   1000 |  56.9μs | 154.1μs  (x2.71) | 203.8μs  (x3.58) | 219.2μs  (x3.85) | 274.6μs  (x4.82)
03_mixed_83b       x  50000 |   1.5μs |   2.5μs  (x1.68) |   3.8μs  (x2.62) |   4.4μs  (x3.03) |   3.3μs  (x2.23)
04_short_numbers   x  50000 |   2.1μs |   3.7μs  (x1.74) |   4.6μs  (x2.17) |   5.7μs  (x2.70) |   7.6μs  (x3.63)
05_long_numbers    x  50000 |   2.0μs |   1.2μs  (x0.57) |   1.5μs  (x0.74) |   1.8μs  (x0.87) |   3.4μs  (x1.68)
06_short_strings   x  50000 |   1.9μs |   3.1μs  (x1.60) |   3.2μs  (x1.65) |   3.6μs  (x1.88) |   3.8μs  (x1.98)
07_long_strings    x   2500 | 104.4μs | 118.8μs  (x1.14) |  81.0μs  (x0.78) |  75.7μs  (x0.72) |  98.6μs  (x0.94)
08_string_escapes  x 100000 |   0.5μs |   0.6μs  (x1.19) |   3.4μs  (x6.37) |   3.5μs  (x6.56) |   0.6μs  (x1.04)
09_bool_null       x 100000 |   1.1μs |   1.6μs  (x1.44) |   2.6μs  (x2.33) |   3.0μs  (x2.71) |   4.3μs  (x3.91)
10_package_json    x  25000 |   4.1μs |   7.1μs  (x1.72) |   7.9μs  (x1.91) |   8.3μs  (x2.02) |   9.9μs  (x2.41)
11_deep_nesting    x   1000 | 175.0μs | 379.3μs  (x2.17) | 444.7μs  (x2.54) | 566.0μs  (x3.23) | 362.8μs  (x2.07)
```

In contrast with the situation for parsing, this library's `stringify()` is not faster than every alternative library in every case. This comes down to the approach taken to string escaping: I've optimised for the average and worst cases, rather than the best.


## Installation and use

Install:

`npm install json-custom-numbers`

Import:

`import { parse, stringify } from 'json-custom-numbers';`

For usage, see the examples below and the [type definitions](dist/index.d.ts).


### Parsing to `BigInt`

A key application of this library is converting large integers in JSON (e.g. from Postgres query results) to [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)s.

```javascript
import { parse } from 'json-custom-numbers';

// `JSON.parse` loses precision for large integers
JSON.parse("9007199254740991"); // => 9007199254740991
JSON.parse("9007199254740993"); // => 9007199254740992 <- wrong number

// without a `numberParser` function, our behaviour is identical
parse("9007199254740991"); // => 9007199254740991
parse("9007199254740993"); // => 9007199254740992 <- wrong number

// this function converts only large integers to `BigInt`
function numberParser(s) {
  const n = +s;
  if (n >= Number.MIN_SAFE_INTEGER && n <= Number.MAX_SAFE_INTEGER) return n;
  if (s.indexOf('.') !== -1 || s.indexOf('e') !== -1 || s.indexOf('E') !== -1) return n;
  return BigInt(s);
}
parse("9007199254740991", null, numberParser);  // => 9007199254740991
parse("9007199254740993", null, numberParser);  // => 9007199254740993n <- now correct
```

### Stringifying `BigInt`

In reverse:

```javascript
import { stringify } from 'json-custom-numbers';

// this throws TypeError: Do not know how to serialize a BigInt
JSON.stringify(9007199254740993n);

// this serializes BigInt as a quoted string
JSON.stringify(9007199254740993n, (k, v) => typeof v === 'bigint' ? v.toString() : v);  // => "9007199254740993"

// this also serializes BigInt as a quoted string
BigInt.prototype.toJSON = function() { return this.toString(); }
JSON.stringify(9007199254740993n);  // => "9007199254740993"

// this serializes BigInt as a long number (i.e. unquoted), like Postgres does
function customSerializer(k, v, type) { if (type === 'bigint') return v.toString(); }
stringify(9007199254740993n, undefined, undefined, customSerializer);  // => 9007199254740993
```


## Orientation

The code is in `src/parse.ts` and `src/stringify.ts`.

Currently, there are two build stages: the first creates `.mjs` files in `src`, while the second creates minified `.js` files in `dist`. The only `package.json` scripts you're likely to need to call directly are `build` and `test`/`testConf`/`testPerf`.


## License

[MIT licensed](LICENSE).

Note that most tests in the [`test_parsing`](test/test_parsing/) folder that start with `y_`, `n_` or `i_` are from Nicolas Seriot's [JSON Test Suite](https://github.com/nst/JSONTestSuite), which is also MIT licensed.
