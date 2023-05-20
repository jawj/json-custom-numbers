# JSON custom numbers

https://github.com/jawj/json-custom-numbers

This is a modified version of [Douglas Crockford's recursive-descent JSON parser](https://github.com/douglascrockford/JSON-js/blob/03157639c7a7cddd2e9f032537f346f1a87c0f6d/json_parse.js). 

Crucially, the modifications:

* **enable custom number parsing**, by supplying a custom function at parse time

Less interestingly, they also:

* accelerate parsing of long strings

* allow duplicate object keys (last value wins), matching `JSON.parse()`

* are strict about whitespace characters and unicode escapes, like `JSON.parse()`

* are strict about number formats (e.g. `.5`, `5.`, `05` are all errors), like `JSON.parse()`

Lastly (though this slows things down a little, and can be switched off), they:

* throw errors on unescaped `\t`, `\n` and control characters in strings, again like `JSON.parse()`

## Conformance and compatibility

When full string checking is not explicitly turned off, the `parse()` function matches the behaviour of `JSON.parse()` for every test in the [JSON Parsing Test Suite](https://github.com/nst/JSONTestSuite).

## Performance

Performance comparisons are highly dependent on the nature of the JSON string to be parsed. Performance was tested on Node.js 18.10 only.

* The best case is JSON that contains mainly long strings. This library may then be up to 7x **faster** than `JSON.parse()`, if full string checking is turned off. Even with full string checking turned on, which is the default, it's still around 1.5x faster.

* The worst case is JSON that contains mainly short numeric values, `true`, `false` or `null`. This library may be around 5 – 6x slower than `JSON.parse()` in that case.

* More typically, this library is 2 – 3x slower than `JSON.parse()`. Unless you're regularly parsing very large JSON strings, the difference probably isn't very important.

I compared several alternative approaches to number and string parsing. The implementations currently used are the ones I found to be fastest in most scenarios. If you figure out something reliably faster, I'd be glad to hear about it.

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

// this `numberReviver` function converts large integers to `BigInt`
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

Except: tests in the [`test_parsing`](./test_parsing/) folder are mostly from Nicolas Seriot's [JSON Test Suite](https://github.com/nst/JSONTestSuite), which is MIT licenced.
