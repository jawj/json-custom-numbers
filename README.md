# JSON custom numbers

https://github.com/jawj/json-custom-numbers

This package offers heavily modified versions of [Douglas Crockford's recursive-descent JSON parser](https://github.com/douglascrockford/JSON-js/blob/03157639c7a7cddd2e9f032537f346f1a87c0f6d/json_parse.js) and [stringifier](https://github.com/douglascrockford/JSON-js/blob/03157639c7a7cddd2e9f032537f346f1a87c0f6d/json2.js).

These modifications:

* **enable custom number parsing and stringification** via functions you supply: this is the reason you might use this library

* match `JSON.parse()` behaviour, by allowing duplicate object keys (last value wins), and by being strict about whitespace characters, number formats (`.5`, `5.` and `05` are errors), unicode escapes, and unescaped `\t`, `\n` and control characters in strings

* match `JSON.stringify()` behaviour, by harmonising character escaping

* significantly optimise performance

* add more informative error messages


## Conformance and compatibility

The `parse()` function matches the behaviour of `JSON.parse()` for every test in the [JSON Parsing Test Suite](https://github.com/nst/JSONTestSuite).

The `stringify()` function matches `JSON.stringify()` for every valid case in the suite, with a variety of `indent` and `replacer` arguments.

Both functions are implemented with recursion, and circular references are not detected. Objects nested many thousands of levels deep, and objects that contain circular references, will therefore throw `maximum call stack size exceeded` or `too much recursion` errors.

If you discover any other behaviour (other than the wording of error messages) that differs between these functions and the built-in JSON functions, please file an issue.

Note: the `stringify()` function makes use of built-in `JSON.stringify()` for string escaping.


## Performance

I've put some effort into optimising performance, and this library is substantially faster than some similar libraries.

Performance comparisons depend both on the JavaScript engine and on the nature of the JSON data to be parsed/generated. If you figure out how to make either `parse()` or `stringify()` reliably faster, I'd be glad to hear about it.

### Parse

On Node.js 20:

* The best case is JSON that's all long strings with few escape sequences. On these sorts of inputs, this library may be up to **20% faster** than `JSON.parse()`.

* The worst case is JSON that's all strings that are mainly escape sequences. In such cases, this library may be up to 4x slower than `JSON.parse()`.

* Typically, this library is 2 – 3x slower than `JSON.parse()`.

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

### Stringify

The numbers for `stringify()` follow a more or less similar pattern, but performance differences between `JSON.stringify()`, this library and other libraries are generally smaller:

```
test               x   reps |  native |     this library |        crockford |      json-bigint |    lossless-json
01_typical_3kb     x  10000 |   106ms |   172ms  (x1.63) |   274ms  (x2.59) |   303ms  (x2.85) |   351ms  (x3.32)
02_typical_28kb    x   1000 |    71ms |   152ms  (x2.14) |   223ms  (x3.14) |   248ms  (x3.49) |   339ms  (x4.77)
03_mixed_83b       x  50000 |    83ms |   119ms  (x1.42) |   214ms  (x2.56) |   276ms  (x3.31) |   245ms  (x2.94)
04_short_numbers   x  50000 |   120ms |   211ms  (x1.76) |   277ms  (x2.31) |   339ms  (x2.84) |   424ms  (x3.54)
05_long_numbers    x  50000 |   117ms |    57ms  (x0.49) |    97ms  (x0.83) |   118ms  (x1.01) |   226ms  (x1.93)
06_short_strings   x  50000 |    68ms |   151ms  (x2.21) |   171ms  (x2.51) |   206ms  (x3.02) |   226ms  (x3.32)
07_long_strings    x   2500 |   252ms |   289ms  (x1.15) |   220ms  (x0.87) |   203ms  (x0.80) |   270ms  (x1.07)
08_string_escapes  x 100000 |    68ms |    85ms  (x1.26) |   369ms  (x5.44) |   372ms  (x5.48) |    87ms  (x1.29)
09_bool_null       x 100000 |   116ms |   155ms  (x1.34) |   277ms  (x2.39) |   323ms  (x2.79) |   487ms  (x4.20)
10_package_json    x  25000 |    87ms |   124ms  (x1.43) |   174ms  (x2.01) |   190ms  (x2.20) |   252ms  (x2.91)
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


## Licence

Public Domain.

NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

Except: most tests in the [`test_parsing`](test/test_parsing/) folder that start with `y_`, `n_` or `i_` are from Nicolas Seriot's [JSON Test Suite](https://github.com/nst/JSONTestSuite), which is MIT licenced.
