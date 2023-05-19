/*
  2023-05-19 / George MacKerron (mackerron.com)

  Public Domain.
  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

  This is based on Douglas Crockford's recursive descent JSON parser from 
  https://github.com/douglascrockford/JSON-js/blob/03157639c7a7cddd2e9f032537f346f1a87c0f6d/json_parse.js
  with various modifications (see README).

  ---

  json_parse.js
  2016-05-02

  Public Domain.
  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
  This file creates a json_parse function.
      json_parse(text, reviver)
          This method parses a JSON text to produce an object or array.
          It can throw a SyntaxError exception.
          The optional reviver parameter is a function that can filter and
          transform the results. It receives each of the keys and values,
          and its return value is used instead of the original value.
          If it returns what it received, then the structure is not modified.
          If it returns undefined then the member is deleted.
          Example:
          // Parse the text. Values that look like ISO date strings will
          // be converted to Date objects.
          myData = json_parse(text, function (key, value) {
              var a;
              if (typeof value === "string") {
                  a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                  if (a) {
                      return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                          +a[5], +a[6]));
                  }
              }
              return value;
          });
  This is a reference implementation. You are free to copy, modify, or
  redistribute.
  This code should be minified before deployment.
  See http://javascript.crockford.com/jsmin.html
  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
  NOT CONTROL.
*/

"use strict";

// This is a function that can parse a JSON text, producing a JavaScript
// data structure. It is a simple, recursive descent parser. It does not use
// eval or regular expressions, so it can be used as a model for implementing
// a JSON parser in other languages.

// We are defining the function inside of another function to avoid creating
// global variables.

var at;     // The index of the current character
var ch;     // The current character
var escapee = {
  "\"": "\"",
  "\\": "\\",
  "/": "/",
  b: "\b",
  f: "\f",
  n: "\n",
  r: "\r",
  t: "\t"
};
var text;

/* begin modification */
var numericReviverFn;
var skipIllegalStringCharCheck;
var illegalStringChars = /[\n\t\u0000-\u001f]/;
var numRegExp = /(-)?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?/y;
/* end modification */

function error(m) {

  // Call error when something is wrong.

  throw {
    name: "SyntaxError",
    message: m,
    at: at,
    text: text
  };
};

function next(c) {

  // If a c parameter is provided, verify that it matches the current character.

  if (c && c !== ch) {
    error("Expected '" + c + "' instead of '" + ch + "'");
  }

  // Get the next character. When there are no more characters,
  // return the empty string.

  ch = text.charAt(at);
  at += 1;
  return ch;
};

function number() {

  // Parse a number value.

  /* modified original implementation */
  // /* begin modification */
  // var isNegative = false;
  // var hasDecimalPoint = false;
  // var hasExponent = false;
  // var hasExponentDigits = false;
  // /* end modification */

  // var value;
  // var string = "";

  // if (ch === "-") {
  //   /* begin modification */
  //   isNegative = true;
  //   /* end modification */

  //   string = "-";
  //   next("-");
  // }

  // /* begin modification */
  // var leadingZero = ch === "0";
  // var digits = 0;
  // var hasDecimalDigits = false;
  // /* end modification */

  // while (ch >= "0" && ch <= "9") {
  //   string += ch;
  //   /* begin modification */
  //   digits += 1;
  //   /* end modification */
  //   next();
  // }

  // /* begin modification */
  // if (digits === 0) error("No integer part");
  // if (digits > 1 && leadingZero) error("Illegal leading zero"); 
  // /* end modification */

  // if (ch === ".") {
  //   /* begin modification */
  //   hasDecimalPoint = true;
  //   /* end modification */
  //   string += ".";
  //   while (next() && ch >= "0" && ch <= "9") {
  //     /* begin modification */
  //     hasDecimalDigits = true;
  //     /* end modification */
  //     string += ch;
  //   }
  //   /* begin modification */
  //   if (!hasDecimalDigits) error("Unterminated fraction");
  //   /* end modification */
  // }
  // if (ch === "e" || ch === "E") {
  //   /* begin modification */
  //   hasExponent = true;
  //   /* end modification */
  //   string += ch;
  //   next();
  //   if (ch === "-" || ch === "+") {
  //     string += ch;
  //     next();
  //   }
  //   while (ch >= "0" && ch <= "9") {
  //     /* begin modification */
  //     hasExponentDigits = true;
  //     /* end modification */
  //     string += ch;
  //     next();
  //   }
  //   /* begin modification */
  //   if (!hasExponentDigits) error("Missing exponent");
  //   /* end modification */
  // }

  // /* begin modification */
  // if (numericReviverFn) return numericReviverFn(string, { isNegative, hasDecimalPoint, hasExponent });
  // /* end modification */

  // value = +string;
  // /* original implementation */
  // // if (!isFinite(value)) {
  // /* end original implementation */
  // /* new implementation */
  // if (isNaN(value)) {
  // /* end new implementation */
  //   error("Bad number");
  // } else {
  //   return value;
  // }
  /* end modified original implementation */

  /* new implementation */
  numRegExp.lastIndex = at - 1;
  var matched = numRegExp.test(text);
  if (!matched) error("Bad number");
  var { lastIndex } = numRegExp;
  var string = text.slice(at - 1, lastIndex);
  var value = numericReviverFn ? numericReviverFn(string) : +string;
  at = lastIndex;
  next();
  return value;
  /* end new implementation */

  /* alternative RegExp implementation: this benchmarks slower */
  // var remaining = text.slice(at - 1);
  // var match = remaining.match(/^(-)?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?/);
  // if (match === null) error("Bad number");
  // var [string, signPart, intPart, decPart, expPart] = match;
  // var value = numericReviverFn ? numericReviverFn(string, { signPart, intPart, decPart, expPart }) : +string;
  // at += string.length - 1;
  // next();
  // return value;
  /* end alternative implementation */
};

function string() {

  // Parse a string value.

  var hex;
  var i;
  var value = "";
  var uffff;

  // When parsing for string values, we must look for " and \ characters.

  if (ch === "\"") {
    /* begin modification */
    parseloop:
    /* end modification */
    while (next()) {
      if (ch === "\"") {
        next();
        return value;
      }
      if (ch === "\\") {
        next();
        if (ch === "u") {
          uffff = 0;
          for (i = 0; i < 4; i += 1) {
            hex = parseInt(next(), 16);
            if (!isFinite(hex)) {
              /* begin original implementation */
              // break;
              /* end original implementation */

              /* begin new implementation */
              break parseloop;  // throws error on invalid unicode escapes
              /* end new implementation */
            }
            uffff = uffff * 16 + hex;
          }
          value += String.fromCharCode(uffff);
        } else if (typeof escapee[ch] === "string") {
          value += escapee[ch];
        } else {
          break;
        }
      } else {
        /* original implementation */
        // value += ch
        /* end original implementation */

        /* begin new implementation, where we pick out runs of non-quote, non-backslash characters using indexOf */
        var nextQuote = text.indexOf("\"", at);
        if (nextQuote === -1) break;  // -> unterminated string
        var chunk = text.slice(at - 1, nextQuote);
        var nextBackslash = chunk.indexOf("\\");
        if (nextBackslash === -1) {
          at = nextQuote;
        } else {
          chunk = chunk.slice(0, nextBackslash);
          at += nextBackslash - 1;
        }
        if (!skipIllegalStringCharCheck && illegalStringChars.test(chunk)) break;
        value += chunk;
        /* end new implementation */

        /* begin alternative implementation, where we pick out runs of non-quote, non-backslash characters using charAt */
        /* (note: benchmarks in Node show this is slightly slower) */
        // let start = at - 1;
        // for (;;) {
        //   ch = text.charAt(at);
        //   if (ch === "\"" || ch === "\\") break;
        //   at += 1;
        // }
        // value += text.slice(start, at);
        /* end alternative implementation */

        /* begin alternative implementation, using RegExps */
        /* (note: benchmarks in Node show this is also slower) */
        // var remaining = text.slice(at - 1);
        // var [chunk] = remaining.match(/^[^"\\]*/);
        // if (!skipIllegalStringCharCheck && illegalStringChars.test(chunk)) error("String has invalid characters");
        // value += chunk;
        // at += chunk.length - 1;
        /* end alternative implementation */
      }
    }
  }
  error("Bad string");
};

function white() {

  // Skip whitespace.

  /* original implementation */
  // while (ch && ch <= " ") {
  /* end original implementation */

  /* new implementation */
  while (ch === " " || ch === "\n" || ch === "\r" || ch === "\t") {
    /* end new implementation */
    next();
  }
};

function word() {

  // true, false, or null.

  switch (ch) {
    case "t":
      next("t");
      next("r");
      next("u");
      next("e");
      return true;
    case "f":
      next("f");
      next("a");
      next("l");
      next("s");
      next("e");
      return false;
    case "n":
      next("n");
      next("u");
      next("l");
      next("l");
      return null;
  }
  error("Unexpected '" + ch + "'");
};

function array() {

  // Parse an array value.

  var arr = [];

  if (ch === "[") {
    next("[");
    white();
    if (ch === "]") {
      next("]");
      return arr;   // empty array
    }
    while (ch) {
      arr.push(value());
      white();
      if (ch === "]") {
        next("]");
        return arr;
      }
      next(",");
      white();
    }
  }
  error("Bad array");
};

function object() {

  // Parse an object value.

  var key;
  var obj = {};

  if (ch === "{") {
    next("{");
    white();
    if (ch === "}") {
      next("}");
      return obj;   // empty object
    }
    while (ch) {
      key = string();
      white();
      next(":");

      /* original implementation */
      // if (Object.hasOwnProperty.call(obj, key)) {
      //   error("Duplicate key '" + key + "'");
      // }
      /* end original implementation */

      /* note: we remove the above check for speed and to match JSON.parse */

      obj[key] = value();
      white();
      if (ch === "}") {
        next("}");
        return obj;
      }
      next(",");
      white();
    }
  }
  error("Bad object");
};

function value() {

  // Parse a JSON value. It could be an object, an array, a string, a number,
  // or a word.

  white();
  switch (ch) {
    case "{":
      return object();
    case "[":
      return array();
    case "\"":
      return string();
    case "-":
      return number();
    default:
      return (ch >= "0" && ch <= "9")
        ? number()
        : word();
  }
};

// Return the json_parse function. It will have access to all of the above
// functions and variables.

export function parse(source, reviver, numericReviver, fastStrings) {
  var result;

  /* begin modification */
  if (typeof source !== 'string') error("JSON source is not a string");
  numericReviverFn = numericReviver;
  skipIllegalStringCharCheck = fastStrings;
  /* end modification */

  text = source;
  at = 0;
  ch = " ";
  result = value();
  white();
  if (ch) {
    error("Syntax error");
  }

  // If there is a reviver function, we recursively walk the new structure,
  // passing each name/value pair to the reviver function for possible
  // transformation, starting with a temporary root object that holds the result
  // in an empty key. If there is not a reviver function, we simply return the
  // result.

  return (typeof reviver === "function")
    ? (function walk(holder, key) {
      var k;
      var v;
      var val = holder[key];
      if (val && typeof val === "object") {
        for (k in val) {
          if (Object.prototype.hasOwnProperty.call(val, k)) {
            v = walk(val, k);
            if (v !== undefined) {
              val[k] = v;
            } else {
              delete val[k];
            }
          }
        }
      }
      return reviver.call(holder, key, val);
    }({ "": result }, ""))
    : result;
};
