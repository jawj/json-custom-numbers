"use strict";

let text;
let at;     // the index of the current character
let ch;     // the current character code
const escapee = {
  34: "\"",
  92: "\\",
  47: "/",
  98: "\b",
  102: "\f",
  110: "\n",
  114: "\r",
  116: "\t"
};

let numericReviverFn;
let skipIllegalStringCharCheck;
const illegalStringChars = /[\n\t\u0000-\u001f]/;
const numRegExp = /(-)?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?/y;

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

  if (c !== undefined && c !== ch) {
    error("Expected '" + c + "' instead of '" + ch + "'");
  }

  // Get the next character. When there are no more characters,
  // return NaN.

  ch = text.charCodeAt(at);
  at += 1;
  return ch;
};

function number() {

  // Parse a number value.

  numRegExp.lastIndex = at - 1;
  var matched = numRegExp.test(text);
  if (!matched) error("Bad number");
  var { lastIndex } = numRegExp;
  var string = text.slice(at - 1, lastIndex);
  var value = numericReviverFn ? numericReviverFn(string) : +string;
  at = lastIndex;
  next();
  return value;
};

function string() {

  // Parse a string value.

  let value = "";

  // When parsing for string values, we must look for " and \ characters.

  if (ch === 34 /* " */) {
    parseloop:
    while (next()) {
      if (ch === 34 /* " */) {
        next();
        return value;
      }
      if (ch === 92 /* \ */) {
        next();
        if (ch === 117 /* u */) {
          let uffff = 0;
          for (let i = 0; i < 4; i += 1) {
            next();
            const hex = ch > 47 && ch < 58 /* 0 - 9 */ ? ch - 48 :
              ch > 96 && ch < 103 /* a - f */ ? ch - 87 :
                ch > 64 && ch < 71 /* A - F */ ? ch - 55 : -1;

            if (hex === -1)  break parseloop;  // throws error on invalid unicode escapes
            uffff = uffff * 16 + hex;
          }
          value += String.fromCharCode(uffff);

        } else if (escapee[ch]) {
          value += escapee[ch];

        } else {
          break;
        }
      } else {
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
      }
    }
  }
  error("Bad string");
};

function white() {

  // Skip whitespace.

  while (ch === 32 /* space */ || ch === 10 /* \n */ || ch === 13 /* \r */ || ch === 9 /* \t */) {
    next();
  }
};

function word() {

  // true, false, or null.

  switch (ch) {
    case 116  /* t */:
      next(116 /* t */);
      next(114 /* r */);
      next(117 /* u */);
      next(101 /* e */);
      return true;

    case 102 /* f */:
      next(102 /* f */);
      next(97 /* a */);
      next(108 /* l */);
      next(115 /* s */);
      next(101 /* e */);
      return false;

    case 110 /* n */:
      next(110 /* n */);
      next(117 /* u */);
      next(108 /* l */);
      next(108 /* l */);
      return null;
  }

  error("Unexpected '" + String.fromCharCode(ch) + "'");
};

function array() {

  // Parse an array value.

  var arr = [];

  if (ch === 91 /* [ */) {
    next(91);
    white();
    if (ch === 93 /* ] */) {
      next(93);
      return arr;   // empty array
    }
    while (ch) {
      arr.push(value());
      white();
      if (ch === 93 /* ] */) {
        next(93 /* ] */);
        return arr;
      }
      next(44 /* , */);
      white();
    }
  }
  error("Bad array");
};

function object() {

  // Parse an object value.

  var key;
  var obj = {};

  if (ch === 123 /* { */) {
    next(123 /* { */);
    white();
    if (ch === 125 /* } */) {
      next(125 /* } */);
      return obj;   // empty object
    }
    while (ch) {
      key = string();
      white();
      next(58 /* : */);

      obj[key] = value();
      white();
      if (ch === 125 /* } */) {
        next(125 /* } */);
        return obj;
      }
      next(44 /* , */);
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
    case 123 /* { */:
      return object();
    case 91 /* [ */:
      return array();
    case 34 /* " */:
      return string();
    case 45 /* - */:
      return number();
    default:
      return (ch > 47 && ch < 58 /* 0 - 9 */)
        ? number()
        : word();
  }
};

// Return the json_parse function. It will have access to all of the above
// functions and variables.

export function parse(source, reviver, numericReviver, fastStrings) {
  var result;

  if (typeof source !== 'string') error("JSON source is not a string");
  numericReviverFn = numericReviver;
  skipIllegalStringCharCheck = fastStrings;

  text = source;
  at = 0;
  ch = 32;
  result = value();
  white();
  if (!isNaN(ch)) {
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
