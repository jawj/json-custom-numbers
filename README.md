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

On Node.js:

* The best case is JSON that's all long strings with few escape sequences, or all deeply nested structures. On these sorts of inputs, this library may be slightly **faster** than `JSON.parse()`.

* The worst case is nothing but string escapes. On these inputs, the library may be around 4x slower than `JSON.parse()`.

* Real-world cases will generally fall somewhere between these extremes.

Tests are included to compare the performance of this library, [Crockford's reference implementation](https://github.com/douglascrockford/JSON-js/blob/03157639c7a7cddd2e9f032537f346f1a87c0f6d/json_parse.js), and the [json-bigint](https://www.npmjs.com/package/json-bigint) and [lossless-json](https://www.npmjs.com/package/lossless-json) libraries against native `JSON.parse` across a range of inputs. 

Reported timings represent a single `parse()` operation, and are the median of 50 trials of `reps`/50 operations each. Numbers in parentheses are the multiple of the time taken by native `JSON.parse()`.

Here's some example output, from Node.js 20.0 on a 2020 Intel MacBook Pro.

**Lower numbers are better**

```
test               x   reps |  native |     this library |        crockford |      json-bigint |    lossless-json
01_typical_3kb     x  10000 |  11.5μs |  22.5μs  (x1.96) |  57.5μs  (x5.00) |  42.8μs  (x3.72) |  62.4μs  (x5.42)
02_typical_28kb    x   1000 |  94.9μs | 281.2μs  (x2.96) | 588.6μs  (x6.20) | 481.9μs  (x5.08) | 617.6μs  (x6.51)
03_mixed_83b       x  50000 |   1.9μs |   3.3μs  (x1.77) |   6.1μs  (x3.27) |   6.5μs  (x3.52) |   5.8μs  (x3.13)
04_short_numbers   x  50000 |   1.9μs |   6.2μs  (x3.25) |   8.8μs  (x4.57) |   9.0μs  (x4.71) |   7.9μs  (x4.13)
05_long_numbers    x  50000 |   1.8μs |   2.9μs  (x1.57) |   8.1μs  (x4.40) |  12.9μs  (x7.01) |   4.6μs  (x2.49)
06_short_strings   x  50000 |   1.9μs |   2.2μs  (x1.14) |   3.7μs  (x1.97) |   3.8μs  (x2.00) |   3.4μs  (x1.79)
07_long_strings    x   2500 |  52.8μs |  39.4μs  (x0.75) | 744.5μs (x14.10) | 526.4μs  (x9.97) | 448.1μs  (x8.49)
08_string_escapes  x 100000 |   1.0μs |   3.8μs  (x3.88) |  10.4μs (x10.61) |   9.8μs  (x9.98) |   5.8μs  (x5.88)
09_bool_null       x 100000 |   0.9μs |   2.2μs  (x2.37) |   3.7μs  (x4.00) |   3.8μs  (x4.13) |   5.7μs  (x6.22)
10_package_json    x  25000 |   4.6μs |   7.7μs  (x1.65) |  33.2μs  (x7.15) |  27.8μs  (x5.99) |  24.8μs  (x5.34)
11_deep_nesting    x   1000 | 293.9μs | 283.5μs  (x0.96) | 521.6μs  (x1.77) | 500.4μs  (x1.70) | 597.3μs  (x2.03)
```

### Stringify

The numbers for `stringify()` follow a more or less similar pattern, but performance differences between `JSON.stringify()`, this library and other libraries are generally smaller:

**Lower numbers are better**

```
test               x   reps |  native |     this library |        crockford |      json-bigint |    lossless-json
01_typical_3kb     x  10000 |   8.2μs |  16.4μs  (x2.00) |  24.4μs  (x2.99) |  25.6μs  (x3.14) |  26.9μs  (x3.29)
02_typical_28kb    x   1000 |  59.5μs | 145.8μs  (x2.45) | 199.6μs  (x3.35) | 217.8μs  (x3.66) | 275.8μs  (x4.63)
03_mixed_83b       x  50000 |   1.5μs |   2.7μs  (x1.82) |   4.0μs  (x2.71) |   4.4μs  (x3.00) |   3.2μs  (x2.18)
04_short_numbers   x  50000 |   2.1μs |   3.6μs  (x1.71) |   4.6μs  (x2.17) |   5.6μs  (x2.67) |   7.1μs  (x3.39)
05_long_numbers    x  50000 |   2.0μs |   1.1μs  (x0.54) |   1.5μs  (x0.74) |   1.8μs  (x0.88) |   3.4μs  (x1.69)
06_short_strings   x  50000 |   1.1μs |   2.8μs  (x2.46) |   3.0μs  (x2.70) |   3.6μs  (x3.23) |   3.7μs  (x3.32)
07_long_strings    x   2500 |  97.7μs | 105.3μs  (x1.08) |  76.8μs  (x0.79) |  77.2μs  (x0.79) |  99.4μs  (x1.02)
08_string_escapes  x 100000 |   0.5μs |   0.6μs  (x1.23) |   3.4μs  (x6.50) |   3.4μs  (x6.54) |   0.6μs  (x1.08)
09_bool_null       x 100000 |   1.0μs |   1.6μs  (x1.50) |   2.5μs  (x2.40) |   2.9μs  (x2.81) |   4.1μs  (x3.98)
10_package_json    x  25000 |   4.1μs |   6.6μs  (x1.63) |   7.8μs  (x1.93) |   8.5μs  (x2.09) |   9.7μs  (x2.39)
11_deep_nesting    x   1000 | 151.9μs | 353.2μs  (x2.33) | 438.8μs  (x2.89) | 491.3μs  (x3.23) | 345.5μs  (x2.27)
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
