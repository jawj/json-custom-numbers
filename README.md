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

Tests are included to compare the performance of this library, [Crockford's reference implementation]((https://github.com/douglascrockford/JSON-js/blob/03157639c7a7cddd2e9f032537f346f1a87c0f6d/json_parse.js)), and the [json-bigint](https://www.npmjs.com/package/json-bigint) and [lossless-json](https://www.npmjs.com/package/lossless-json) libraries against native `JSON.parse` across a range of inputs. Here's some example output, from Node.js 20.0 on a 2020 Intel MacBook Pro:

**Lower numbers are better**

```
test               x   reps |  native |     this library |        crockford |      json-bigint |    lossless-json
01_typical_3kb     x  10000 |   131ms |   316ms  (x2.41) |   615ms  (x4.70) |   470ms  (x3.59) |   648ms  (x4.95)
02_typical_28kb    x   1000 |    98ms |   333ms  (x3.42) |   552ms  (x5.66) |   453ms  (x4.64) |   622ms  (x6.38)
03_mixed_83b       x  50000 |    98ms |   206ms  (x2.11) |   334ms  (x3.42) |   372ms  (x3.82) |   355ms  (x3.64)
04_short_numbers   x  50000 |   112ms |   386ms  (x3.46) |   424ms  (x3.79) |   440ms  (x3.94) |   472ms  (x4.22)
05_long_numbers    x  50000 |   102ms |   164ms  (x1.60) |   404ms  (x3.95) |   672ms  (x6.57) |   327ms  (x3.20)
06_short_strings   x  50000 |   109ms |   136ms  (x1.25) |   197ms  (x1.81) |   197ms  (x1.80) |   235ms  (x2.15)
07_long_strings    x   2500 |   140ms |   104ms  (x0.74) |  1761ms (x12.56) |  1284ms  (x9.15) |  1130ms  (x8.06)
08_string_escapes  x 100000 |   108ms |   380ms  (x3.50) |  1017ms  (x9.38) |   992ms  (x9.14) |   622ms  (x5.73)
09_bool_null       x 100000 |   101ms |   277ms  (x2.75) |   377ms  (x3.73) |   373ms  (x3.69) |   651ms  (x6.45)
10_package_json    x  25000 |   131ms |   244ms  (x1.86) |   796ms  (x6.05) |   705ms  (x5.36) |   675ms  (x5.14)
```

### Stringify

The numbers for `stringify()` follow a more or less similar pattern, but performance differences between `JSON.stringify()`, this library and other libraries are generally smaller:

**Lower numbers are better**

```
test               x   reps |  native |     this library |        crockford |      json-bigint |    lossless-json
01_typical_3kb     x  10000 |    92ms |   190ms  (x2.07) |   257ms  (x2.80) |   285ms  (x3.11) |   328ms  (x3.57)
02_typical_28kb    x   1000 |    67ms |   185ms  (x2.77) |   213ms  (x3.20) |   224ms  (x3.37) |   325ms  (x4.88)
03_mixed_83b       x  50000 |    79ms |   136ms  (x1.72) |   194ms  (x2.46) |   210ms  (x2.65) |   220ms  (x2.78)
04_short_numbers   x  50000 |   113ms |   206ms  (x1.82) |   235ms  (x2.07) |   285ms  (x2.51) |   384ms  (x3.39)
05_long_numbers    x  50000 |   111ms |    65ms  (x0.59) |    99ms  (x0.89) |   107ms  (x0.96) |   203ms  (x1.83)
06_short_strings   x  50000 |    63ms |   161ms  (x2.54) |   165ms  (x2.61) |   189ms  (x2.97) |   219ms  (x3.45)
07_long_strings    x   2500 |   239ms |   265ms  (x1.11) |   184ms  (x0.77) |   187ms  (x0.78) |   255ms  (x1.07)
08_string_escapes  x 100000 |    65ms |    82ms  (x1.27) |   332ms  (x5.15) |   344ms  (x5.33) |    75ms  (x1.16)
09_bool_null       x 100000 |   115ms |   169ms  (x1.47) |   248ms  (x2.16) |   316ms  (x2.75) |   449ms  (x3.90)
10_package_json    x  25000 |   112ms |   178ms  (x1.59) |   217ms  (x1.93) |   231ms  (x2.06) |   278ms  (x2.48)
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
JSON.parse("9007199254740993"); // => 9007199254740992 <- different number

// without a `numberReviver` function, our behaviour is identical
parse("9007199254740991"); // => 9007199254740991
parse("9007199254740993"); // => 9007199254740992 <- different number

// this function converts only large integers to `BigInt`
function numberReviver(s) {
  const n = +s;
  if (n >= Number.MIN_SAFE_INTEGER && n <= Number.MAX_SAFE_INTEGER) return n;
  if (s.indexOf('.') !== -1 || s.indexOf('e') !== -1 || s.indexOf('E') !== -1) return n;
  return BigInt(s);
}
parse("9007199254740991", null, numberReviver);  // => 9007199254740991
parse("9007199254740993", null, numberReviver);  // => 9007199254740993n <- now correct
```

### Stringifying `BigInt`

In reverse:

```javascript
import { stringify } from 'json-custom-numbers';

// this throws TypeError: Do not know how to serialize a BigInt
JSON.stringify(9007199254740993n);

// this serializes BigInt as a quoted string
BigInt.prototype.toJSON = function() { return this.toString(); }
JSON.stringify(9007199254740993n);  // => "9007199254740993"

// this serializes BigInt as an unquoted string
function bigIntReplacer(x) {
  if (typeof x === 'bigint') return x.toString();
}
stringify(9007199254740993n, undefined, undefined, bigIntReplacer);  // => 9007199254740993
```


## Orientation

The code is in `src/parse.ts` and `src/stringify.ts`.

Currently, there are two build stages: the first creates `.mjs` files in `src`, and the second creates minified `.js` files in `dist`. The only `package.json` scripts you're likely to need to call directly are `build` and `test`/`testConf`/`testPerf`.


## Licence

Public Domain.

NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

Except: most tests in the [`test_parsing`](test/test_parsing/) folder that start with `y_`, `n_` or `i_` are from Nicolas Seriot's [JSON Test Suite](https://github.com/nst/JSONTestSuite), which is MIT licenced.
