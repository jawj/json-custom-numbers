/*
  2023-05-21 / George MacKerron (mackerron.com)
  Based on https://github.com/douglascrockford/JSON-js/blob/03157639c7a7cddd2e9f032537f346f1a87c0f6d/json_parse.js
  Public Domain
  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
*/

"use strict";

export class JSONParseError extends Error { }

// global state
let at;  // the index of the current character
let ch;  // the current character
let text;  // JSON source
let skipIllegalStringCharCheck;
let numericReviverFn;

const illegalStringChars = /[\n\t\u0000-\u001f]/;
const wordRegExp = /true|false|null|-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?/y;
const escapes = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "\"", "", "", "", "", "", "", "", "", "", "", "", "", "/", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "\\", "", "", "", "", "", "\b", "", "", "", "\f", "", "", "", "", "", "", "", "\n", "", "", "", "\r", "", "\t"];

function error(m) {
  throw new JSONParseError(`${m}\nAt character ${at} in JSON: ${text}`);
};

function word() {
  let value;

  wordRegExp.lastIndex = at - 1;
  wordRegExp.test(text) || error("Unexpected value");

  const { lastIndex } = wordRegExp;
  if (ch < "f") {  // numbers
    const string = text.slice(at - 1, lastIndex);
    value = numericReviverFn ? numericReviverFn(string) : +string;

  } else {  // true/false/null
    value = ch === "t" ? true : ch === "f" ? false : null;
  }

  at = lastIndex;
  ch = text.charAt(at++);
  return value;
};

function string() {  // note: it's on you to check that ch == '"' before you call this
  let value = "";
  for (; ;) {
    const nextQuote = text.indexOf('"', at);
    if (nextQuote === -1) error("Unterminated string");

    if (nextQuote === at) { // empty string: we're done
      at = nextQuote + 1;
      ch = text.charAt(at++);
      return value;
    }

    let chunk = text.slice(at, nextQuote); // non-empty string: let's retrieve it
    const nextBackslash = chunk.indexOf("\\");

    if (nextBackslash === -1) {  // no backslashes up to end quote: we're done
      if (!skipIllegalStringCharCheck && illegalStringChars.test(chunk)) error("Invalid character in string");
      value += chunk;
      at = nextQuote + 1;
      ch = text.charAt(at++);
      return value;

    } else {  // deal with backslash escapes
      chunk = chunk.slice(0, nextBackslash);
      if (!skipIllegalStringCharCheck && illegalStringChars.test(chunk)) error("Invalid character in string");
      value += chunk;
      at += nextBackslash + 1;

      let code = text.charCodeAt(at++);
      if (code === 117 /* u */) {
        let uffff = 0;
        for (let shift = 12; shift >= 0; shift -= 4) {  // unrolling this loop isn't measurably faster
          code = text.charCodeAt(at++);
          uffff |= (code > 47 && code < 58 ? code - 48 /* 0 - 9 */ :
            code > 64 && code < 71 ? code - 55 /* A - F */ :
              code > 96 && code < 103 ? code - 87 /* a - f */ :
                error("Invalid \\uXXXX escape in string")) << shift;
        }
        value += String.fromCharCode(uffff);

      } else {
        let esc = escapes[code];
        if (!esc) error("Invalid escape in string");
        value += esc;
      }
    }
  }
};

function array() {
  const arr = [];
  let i = 0;
  // the '< "!"' helps performance by short-circuiting the four other conditions in most cases
  do { ch = text.charAt(at++) } while (ch < "!" && (ch === " " || ch === "\n" || ch === "\r" || ch === "\t"));
  if (ch === "]") {
    ch = text.charAt(at++)
    return arr;  // empty array
  }
  while (ch) {
    arr[i++] = value();
    while (ch < "!" && (ch === " " || ch === "\n" || ch === "\r" || ch === "\t")) ch = text.charAt(at++);
    if (ch === "]") {
      ch = text.charAt(at++)
      return arr;
    }
    if (ch !== ",") error("Expected ',', got '" + ch + "' between array elements");
    do { ch = text.charAt(at++) } while (ch < "!" && (ch === " " || ch === "\n" || ch === "\r" || ch === "\t"));
  }
  error("Invalid array");
};

function object() {
  const obj = {};
  do { ch = text.charAt(at++) } while (ch < "!" && (ch === " " || ch === "\n" || ch === "\r" || ch === "\t"));
  if (ch === "}") {
    ch = text.charAt(at++);
    return obj;  // empty object
  }
  while (ch === '"') {
    const key = string();
    while (ch < "!" && (ch === " " || ch === "\n" || ch === "\r" || ch === "\t")) ch = text.charAt(at++);
    if (ch !== ":") error("Expected ':', got '" + ch + "' between key and value in object");
    ch = text.charAt(at++);
    obj[key] = value();
    while (ch < "!" && (ch === " " || ch === "\n" || ch === "\r" || ch === "\t")) ch = text.charAt(at++);
    if (ch === "}") {
      ch = text.charAt(at++);
      return obj;
    }
    if (ch !== ",") error("Expected ',', got '" + ch + "' between items in object");
    do { ch = text.charAt(at++) } while (ch < "!" && (ch === " " || ch === "\n" || ch === "\r" || ch === "\t"));
  }
  error("Invalid object");
};

function value() {
  while (ch < "!" && (ch === " " || ch === "\n" || ch === "\r" || ch === "\t")) ch = text.charAt(at++);
  switch (ch) {
    case '"': return string();
    case "{": return object();
    case "[": return array();
    default: return word();
  }
};

export function parse(source, reviver, numericReviver, fastStrings) {
  if (typeof source !== "string") error("JSON source is not a string");

  at = 0;
  ch = " ";
  text = source;
  skipIllegalStringCharCheck = fastStrings;
  numericReviverFn = numericReviver;

  const result = value();
  while (ch < "!" && (ch === " " || ch === "\n" || ch === "\r" || ch === "\t")) ch = text.charAt(at++);
  if (ch) error("Unexpected data at end");

  return (typeof reviver === "function")
    ? (function walk(holder, key) {
      const val = holder[key];
      if (val && typeof val === "object") {
        for (const k in val) {
          if (Object.prototype.hasOwnProperty.call(val, k)) {
            const v = walk(val, k);
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
