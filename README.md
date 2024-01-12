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

In Node.js:

* In the best cases (all long strings with few escape sequences, or all deeply nested structures), this library may be slightly **faster** than `JSON.parse()`.

* More usually, this library is 1.5 – 3x slower than `JSON.parse()`. This compares favourably with alternative packages, which can be up to 10x slower.

In Bun:

* This library is usually in the range 2 – 5x slower than `JSON.parse()`. This still compares favourably with alternative packages, which can be up to 20x slower.

* These numbers are worse than for Node.js both because Bun's native `JSON.parse()` is faster and because Bun runs this library slower.

Tests are included to compare the performance of this library, [Crockford's reference implementation](https://github.com/douglascrockford/JSON-js/blob/03157639c7a7cddd2e9f032537f346f1a87c0f6d/json_parse.js), and the [json-bigint](https://www.npmjs.com/package/json-bigint) and [lossless-json](https://www.npmjs.com/package/lossless-json) libraries against native `JSON.parse` across a range of inputs. 

Reported timings represent a single `parse()` operation, and are the median of 50 trials of `reps`/50 operations each. Numbers in parentheses are the multiple of the time taken by native `JSON.parse()`.

**Lower numbers are better**

Node.js 20.0.0 on a 2020 Intel MacBook Pro:

```
test               x   reps |   native |      this library |         crockford |       json-bigint |     lossless-json
01_typical_3kb     x  10000 |   11.4μs |   21.9μs  (x1.92) |   60.3μs  (x5.29) |   44.4μs  (x3.89) |   60.7μs  (x5.32)
02_typical_28kb    x   1000 |   99.0μs |  289.8μs  (x2.93) |  580.6μs  (x5.86) |  465.5μs  (x4.70) |  621.0μs  (x6.27)
03_mixed_83b       x  50000 |    1.8μs |    3.1μs  (x1.71) |    6.3μs  (x3.41) |    6.5μs  (x3.51) |    5.8μs  (x3.13)
04_short_numbers   x  50000 |    1.9μs |    6.2μs  (x3.32) |    8.6μs  (x4.63) |    8.7μs  (x4.66) |    7.9μs  (x4.26)
05_long_numbers    x  50000 |    1.8μs |    2.9μs  (x1.59) |    8.3μs  (x4.57) |   12.9μs  (x7.10) |    4.7μs  (x2.56)
06_short_strings   x  50000 |    1.9μs |    2.4μs  (x1.25) |    3.4μs  (x1.75) |    3.8μs  (x2.00) |    3.5μs  (x1.80)
07_long_strings    x   2500 |   54.7μs |   39.7μs  (x0.73) |  765.8μs (x14.00) |  529.6μs  (x9.68) |  455.9μs  (x8.33)
08_string_escapes  x 100000 |    1.0μs |    1.9μs  (x2.02) |   10.6μs (x11.02) |    9.9μs (x10.29) |    5.9μs  (x6.13)
09_bool_null       x 100000 |    0.9μs |    2.4μs  (x2.57) |    3.9μs  (x4.20) |    4.1μs  (x4.41) |    5.4μs  (x5.83)
10_package_json    x  25000 |    4.8μs |    8.0μs  (x1.68) |   36.2μs  (x7.56) |   29.5μs  (x6.16) |   25.4μs  (x5.31)
11_deep_nesting    x   1000 |  292.1μs |  280.7μs  (x0.96) |  533.7μs  (x1.83) |  504.6μs  (x1.73) |  606.0μs  (x2.07)
12_deep_indent     x   1000 |  362.1μs |  570.6μs  (x1.58) | 2249.7μs  (x6.21) | 2233.6μs  (x6.17) | 1667.0μs  (x4.60)
```

Bun 0.8.0 on a 2020 Intel MacBook Pro:

```
test               x   reps |   native |      this library |         crockford |       json-bigint |     lossless-json
01_typical_3kb     x  10000 |   12.9μs |   26.7μs  (x2.06) |   57.0μs  (x4.41) |   49.0μs  (x3.79) |   57.3μs  (x4.43)
02_typical_28kb    x   1000 |  101.5μs |  383.3μs  (x3.78) |  676.8μs  (x6.67) |  513.9μs  (x5.06) |  789.8μs  (x7.78)
03_mixed_83b       x  50000 |    1.7μs |    4.6μs  (x2.73) |    6.4μs  (x3.76) |    6.8μs  (x4.02) |    6.5μs  (x3.81)
04_short_numbers   x  50000 |    1.9μs |    8.7μs  (x4.52) |   12.3μs  (x6.42) |   11.9μs  (x6.18) |    7.9μs  (x4.10)
05_long_numbers    x  50000 |    1.1μs |    3.3μs  (x3.02) |   10.2μs  (x9.43) |   13.3μs (x12.27) |    4.6μs  (x4.24)
06_short_strings   x  50000 |    1.9μs |    5.7μs  (x3.07) |    4.3μs  (x2.28) |    4.4μs  (x2.33) |    3.9μs  (x2.11)
07_long_strings    x   2500 |   36.0μs |   47.6μs  (x1.32) | 1122.4μs (x31.17) |  437.9μs (x12.16) |  753.1μs (x20.91)
08_string_escapes  x 100000 |    1.0μs |    3.0μs  (x3.02) |    7.0μs  (x7.16) |    6.9μs  (x7.06) |    6.1μs  (x6.20)
09_bool_null       x 100000 |    0.8μs |    2.4μs  (x3.00) |    4.2μs  (x5.22) |    4.2μs  (x5.25) |    8.0μs (x10.00)
10_package_json    x  25000 |    4.8μs |    9.3μs  (x1.94) |   38.5μs  (x8.06) |   29.6μs  (x6.19) |   28.9μs  (x6.05)
11_deep_nesting    x   1000 |  152.2μs |  564.0μs  (x3.71) |  664.8μs  (x4.37) |  610.2μs  (x4.01) |  793.1μs  (x5.21)
12_deep_indent     x   1000 |  222.9μs | 1236.1μs  (x5.55) | 2101.9μs  (x9.43) | 1981.0μs  (x8.89) | 1714.7μs  (x7.69)
```


### Stringify

The numbers for `stringify()` follow a more or less similar pattern, but performance differences between `JSON.stringify()`, this library and other libraries are generally smaller:

**Lower numbers are better**

Node.js 20.0.0 on a 2020 Intel MacBook Pro:

```
test               x   reps |   native |      this library |         crockford |       json-bigint |     lossless-json
01_typical_3kb     x  10000 |    8.2μs |   16.6μs  (x2.03) |   24.0μs  (x2.93) |   26.7μs  (x3.25) |   27.2μs  (x3.32)
02_typical_28kb    x   1000 |   59.0μs |  147.8μs  (x2.50) |  204.1μs  (x3.46) |  222.5μs  (x3.77) |  284.2μs  (x4.81)
03_mixed_83b       x  50000 |    1.5μs |    2.7μs  (x1.80) |    3.9μs  (x2.61) |    4.1μs  (x2.77) |    3.2μs  (x2.18)
04_short_numbers   x  50000 |    2.1μs |    3.6μs  (x1.73) |    4.5μs  (x2.16) |    5.6μs  (x2.68) |    7.1μs  (x3.39)
05_long_numbers    x  50000 |    2.0μs |    1.1μs  (x0.54) |    1.5μs  (x0.74) |    1.8μs  (x0.87) |    3.4μs  (x1.67)
06_short_strings   x  50000 |    1.1μs |    2.8μs  (x2.46) |    3.2μs  (x2.79) |    3.8μs  (x3.32) |    3.7μs  (x3.21)
07_long_strings    x   2500 |   97.9μs |  111.4μs  (x1.14) |   78.2μs  (x0.80) |   77.7μs  (x0.79) |  100.7μs  (x1.03)
08_string_escapes  x 100000 |    0.5μs |    0.6μs  (x1.19) |    3.4μs  (x6.30) |    3.4μs  (x6.33) |    0.6μs  (x1.04)
09_bool_null       x 100000 |    1.1μs |    1.6μs  (x1.48) |    2.5μs  (x2.33) |    2.9μs  (x2.72) |    4.2μs  (x3.85)
10_package_json    x  25000 |    4.4μs |    6.6μs  (x1.50) |    8.1μs  (x1.83) |    8.7μs  (x1.96) |   10.2μs  (x2.30)
11_deep_nesting    x   1000 |  155.6μs |  358.3μs  (x2.30) |  451.4μs  (x2.90) |  502.8μs  (x3.23) |  356.3μs  (x2.29)
12_deep_indent     x   1000 |  160.3μs |  364.8μs  (x2.28) |  455.8μs  (x2.84) |  503.7μs  (x3.14) |  357.6μs  (x2.23)
```

Bun 0.8.0 on a 2020 Intel MacBook Pro:

```
test               x   reps |   native |      this library |         crockford |       json-bigint |     lossless-json
01_typical_3kb     x  10000 |   10.5μs |   18.2μs  (x1.74) |   36.4μs  (x3.48) |   35.7μs  (x3.42) |   19.9μs  (x1.90)
02_typical_28kb    x   1000 |   93.6μs |  195.2μs  (x2.09) |  380.7μs  (x4.07) |  435.6μs  (x4.65) |  246.2μs  (x2.63)
03_mixed_83b       x  50000 |    1.8μs |    2.5μs  (x1.40) |    4.5μs  (x2.49) |    5.4μs  (x2.95) |    3.2μs  (x1.74)
04_short_numbers   x  50000 |    4.2μs |    4.0μs  (x0.94) |    5.5μs  (x1.31) |    7.0μs  (x1.65) |    8.0μs  (x1.89)
05_long_numbers    x  50000 |    1.2μs |    1.4μs  (x1.24) |    1.9μs  (x1.64) |    2.3μs  (x2.02) |    2.4μs  (x2.07)
06_short_strings   x  50000 |    0.5μs |    2.0μs  (x3.63) |    4.7μs  (x8.63) |    6.3μs (x11.74) |    2.6μs  (x4.89)
07_long_strings    x   2500 |   34.1μs |   45.9μs  (x1.34) |  108.3μs  (x3.17) |  107.3μs  (x3.14) |   32.8μs  (x0.96)
08_string_escapes  x 100000 |    0.6μs |    0.6μs  (x1.07) |    3.6μs  (x6.39) |    3.8μs  (x6.79) |    0.4μs  (x0.71)
09_bool_null       x 100000 |    0.5μs |    1.8μs  (x3.38) |    3.1μs  (x5.96) |    3.7μs  (x7.12) |    3.3μs  (x6.27)
10_package_json    x  25000 |    5.5μs |    5.3μs  (x0.96) |   12.3μs  (x2.23) |   14.8μs  (x2.69) |    6.7μs  (x1.22)
11_deep_nesting    x   1000 |  184.0μs |  352.8μs  (x1.92) |  768.6μs  (x4.18) |  955.2μs  (x5.19) |  326.6μs  (x1.78)
12_deep_indent     x   1000 |  174.1μs |  361.8μs  (x2.08) |  799.3μs  (x4.59) |  969.6μs  (x5.57) |  348.8μs  (x2.00)
```


## Installation and use

Install:

`npm install json-custom-numbers`

Import:

`import { parse, stringify } from 'json-custom-numbers';`

For usage, see the examples below and the [type definitions](index.d.ts).


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
function numberParser(k, s) {
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

Currently, there are two build stages: the first creates `.mjs` files in `src`, while the second creates minified `.js` files in the root folder. The only `package.json` scripts you're likely to need to call directly are `build` and `test`/`testConf`/`testPerf`.


## License

[MIT licensed](LICENSE).

Note that most tests in the [`test_parsing`](test/test_parsing/) folder that start with `y_`, `n_` or `i_` are from Nicolas Seriot's [JSON Test Suite](https://github.com/nst/JSONTestSuite), which is also MIT licensed.
