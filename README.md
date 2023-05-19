# JSON custom numbers

https://github.com/jawj/json-custom-numbers

This is a modified version of [Douglas Crockford's recursive-descent JSON parser](https://github.com/douglascrockford/JSON-js/blob/03157639c7a7cddd2e9f032537f346f1a87c0f6d/json_parse.js). All modifications (except for the conversion from [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) to [ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)) are flagged in the source. 

Crucially, these modifications:

* **enable custom number parsing**, by supplying a custom function at parse time

Less interestingly, they also:

* accelerate parsing of long strings — by using `indexOf()` and `slice()` to reduce `string += string` operations

* allow duplicate object keys (last value wins), matching `JSON.parse()`

* are strict about whitespace characters and unicode escapes, like `JSON.parse()`

* are strict about number formats (e.g. `.5`, `5.`, `05` are all errors), as with `JSON.parse()`

Lastly (though this slows things down a little, and can be switched off), they:

* throw errors on unescaped `\t`, `\n` and control characters in strings, again like `JSON.parse()`

## Conformance and compatibility

When full string checking is not explicitly turned off, the `parse()` function matches the behaviour of `JSON.parse()` for every test in the [JSON Parsing Test Suite](https://github.com/nst/JSONTestSuite).

## Performance

Performance comparisons are highly dependent on the nature of the JSON string to be parsed. Performance was tested on Node.js 18.10 only.

* The best case is JSON that contains mainly long strings. With full string checking turned off, this library may be up to 6x **faster** than `JSON.parse()` in that case. With full string checking turned on (the default), it's still around 1.5x faster.

* The worst case is JSON that contains mainly short numeric values or `true`/`false`/`null`. This library may be 6 – 7x slower than `JSON.parse()` in that case.

* More typically, this library is 3 – 4x slower than `JSON.parse()`, but around twice as fast Crockford's reference implementation (which wasn't optimised for speed). Parsing JSON is fast, so unless you are regularly parsing very large JSON strings, the difference probably isn't very important.

I compared several alternative approaches to number and string parsing, which can be seen in comments in [the source](src/parse.mjs). The implementations currently used are the ones I found to be fastest in most scenarios. If you figure out something faster, I'd be glad to hear about it.

The minified source is nice and small — 1.9 KB for the ESM version — so it won't slow down startup.

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

Except: tests in the [`test_parsing`](./test_parsing/) folder are mostly from Nicolas Seriot's [JSON Test Suite](https://github.com/nst/JSONTestSuite), which are MIT licenced.
