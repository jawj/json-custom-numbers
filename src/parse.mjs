/*
  2023-05-20 / George MacKerron (mackerron.com)
  Based on https://github.com/douglascrockford/JSON-js/blob/03157639c7a7cddd2e9f032537f346f1a87c0f6d/json_parse.js
  Public Domain
  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
*/

"use strict";

// note: these assignments will be overwritten, but establish variable type
let at = 0;     // the index of the current character
let ch = " ";   // the current character
let text = "";
let skipIllegalStringCharCheck = false;
let numericReviverFn;

const escapee = {
  '"': '"',
  "\\": "\\",
  "/": "/",
  b: "\b",
  f: "\f",
  n: "\n",
  r: "\r",
  t: "\t"
};
const illegalStringChars = /[\n\t\u0000-\u001f]/;
const numRegExp = /(-)?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?/y;

export class JSONParseError extends Error { }

function error(m) {
  throw new JSONParseError(`JSON parse error: ${m}\nAt character ${at} in JSON: ${text}`);
};

function next() {
  ch = text.charAt(at++);
  return ch;
};

function nextExpect(c) {
  if (c && c !== ch) error("Expected '" + c + "' instead of '" + ch + "'");
  ch = text.charAt(at++);
  return ch;
};

function number() {
  numRegExp.lastIndex = at - 1;
  const matched = numRegExp.test(text);
  if (!matched) error("Bad number");
  const { lastIndex } = numRegExp;
  const string = text.slice(at - 1, lastIndex);
  const value = numericReviverFn ? numericReviverFn(string) : +string;
  at = lastIndex;
  next();
  return value;
};

function string() {
  let value = "";

  if (ch === '"') {
    parseloop:
    while (next()) {
      if (ch === '"') {
        next();
        return value;
      }

      if (ch === "\\") {
        next();

        if (ch === "u") {
          let uffff = 0;
          for (let i = 0; i < 4; i += 1) {
            const hex = parseInt(next(), 16);
            if (!isFinite(hex)) break parseloop;
            uffff = uffff * 16 + hex;
          }
          value += String.fromCharCode(uffff);

        } else if (escapee[ch]) {
          value += escapee[ch];

        } else {
          break;
        }

      } else {
        const nextQuote = text.indexOf('"', at);
        if (nextQuote === -1) break;  // -> unterminated string
        let chunk = text.slice(at - 1, nextQuote);
        const nextBackslash = chunk.indexOf("\\");
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
  // "!" follows " ": using `< "!"` can usually short-circuit the next 4 comparisons
  while (ch < "!" && (ch === " " || ch === "\n" || ch === "\r" || ch === "\t")) next();
};

function word() {
  switch (ch) {
    case "t":
      nextExpect("t");
      nextExpect("r");
      nextExpect("u");
      nextExpect("e");
      return true;
    case "f":
      nextExpect("f");
      nextExpect("a");
      nextExpect("l");
      nextExpect("s");
      nextExpect("e");
      return false;
    case "n":
      nextExpect("n");
      nextExpect("u");
      nextExpect("l");
      nextExpect("l");
      return null;
  }
  error("Unexpected '" + ch + "'");
};

function array() {
  const arr = [];
  let i = 0;

  if (ch === "[") {
    nextExpect("[");
    white();
    if (ch === "]") {
      nextExpect("]");
      return arr;  // empty array
    }
    while (ch) {
      arr[i++] = value();
      white();
      if (ch === "]") {
        nextExpect("]");
        return arr;
      }
      nextExpect(",");
      white();
    }
  }
  error("Bad array");
};

function object() {
  const obj = {};

  if (ch === "{") {
    nextExpect("{");
    white();
    if (ch === "}") {
      nextExpect("}");
      return obj;  // empty object
    }
    while (ch) {
      const key = string();
      white();
      nextExpect(":");
      obj[key] = value();
      white();
      if (ch === "}") {
        nextExpect("}");
        return obj;
      }
      nextExpect(",");
      white();
    }
  }
  error("Bad object");
};

function value() {
  white();
  switch (ch) {
    case "{": return object();
    case "[": return array();
    case '"': return string();
    case "-": return number();
    default: return (ch >= "0" && ch <= "9") ? number() : word();
  }
};

export default function (source, reviver, numericReviver, fastStrings) {

  if (typeof source !== 'string') error("JSON source is not a string");

  at = 0;
  ch = " ";
  text = source;
  skipIllegalStringCharCheck = fastStrings;
  numericReviverFn = numericReviver;

  const result = value();
  white();
  if (ch) error("Syntax error");

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
