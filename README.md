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
01_typical_3kb     x  10000 |  11.8μs |  23.3μs  (x1.98) |  56.6μs  (x4.81) |  43.3μs  (x3.68) |  62.7μs  (x5.32)
02_typical_28kb    x   1000 |  96.7μs | 292.8μs  (x3.03) | 579.8μs  (x6.00) | 452.7μs  (x4.68) | 621.2μs  (x6.43)
03_mixed_83b       x  50000 |   1.8μs |   3.4μs  (x1.90) |   6.7μs  (x3.81) |   6.8μs  (x3.82) |   5.9μs  (x3.35)
04_short_numbers   x  50000 |   1.9μs |   6.4μs  (x3.38) |   9.0μs  (x4.77) |   9.1μs  (x4.84) |   8.7μs  (x4.65)
05_long_numbers    x  50000 |   1.8μs |   4.3μs  (x2.34) |   8.6μs  (x4.67) |  13.3μs  (x7.22) |   4.9μs  (x2.64)
06_short_strings   x  50000 |   1.9μs |   2.2μs  (x1.18) |   3.8μs  (x2.02) |   3.8μs  (x2.05) |   3.5μs  (x1.85)
07_long_strings    x   2500 |  53.4μs |  39.5μs  (x0.74) | 764.8μs (x14.32) | 526.3μs  (x9.86) | 444.1μs  (x8.32)
08_string_escapes  x 100000 |   0.9μs |   3.9μs  (x4.07) |  10.9μs (x11.51) |   9.9μs (x10.40) |   5.7μs  (x6.02)
09_bool_null       x 100000 |   0.9μs |   2.2μs  (x2.49) |   3.8μs  (x4.20) |   3.8μs  (x4.17) |   5.3μs  (x5.86)
10_package_json    x  25000 |   4.6μs |   7.7μs  (x1.66) |  35.1μs  (x7.60) |  27.8μs  (x6.03) |  24.4μs  (x5.27)
```

### Stringify

The numbers for `stringify()` follow a more or less similar pattern, but performance differences between `JSON.stringify()`, this library and other libraries are generally smaller:

**Lower numbers are better**

```
test               x   reps |  native |     this library |        crockford |      json-bigint |    lossless-json
01_typical_3kb     x  10000 |   9.0μs |  17.0μs  (x1.90) |  24.3μs  (x2.71) |  27.0μs  (x3.02) |  28.1μs  (x3.14)
02_typical_28kb    x   1000 |  58.0μs | 145.2μs  (x2.50) | 201.0μs  (x3.47) | 229.3μs  (x3.95) | 278.0μs  (x4.79)
03_mixed_83b       x  50000 |   1.4μs |   2.5μs  (x1.72) |   4.0μs  (x2.77) |   4.1μs  (x2.83) |   3.2μs  (x2.20)
04_short_numbers   x  50000 |   2.1μs |   3.7μs  (x1.79) |   4.6μs  (x2.19) |   5.5μs  (x2.66) |   7.3μs  (x3.50)
05_long_numbers    x  50000 |   2.0μs |   1.1μs  (x0.55) |   1.5μs  (x0.74) |   1.8μs  (x0.89) |   3.4μs  (x1.69)
06_short_strings   x  50000 |   1.1μs |   2.8μs  (x2.49) |   3.1μs  (x2.78) |   3.6μs  (x3.28) |   3.8μs  (x3.41)
07_long_strings    x   2500 | 103.5μs | 114.6μs  (x1.11) |  83.8μs  (x0.81) |  79.7μs  (x0.77) | 103.5μs  (x1.00)
08_string_escapes  x 100000 |   0.5μs |   0.6μs  (x1.21) |   3.4μs  (x6.52) |   3.9μs  (x7.46) |   0.6μs  (x1.08)
09_bool_null       x 100000 |   1.0μs |   1.6μs  (x1.55) |   2.5μs  (x2.44) |   3.1μs  (x2.97) |   4.2μs  (x4.03)
10_package_json    x  25000 |   4.0μs |   6.4μs  (x1.58) |   8.1μs  (x1.99) |   9.0μs  (x2.23) |   9.9μs  (x2.44)
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
