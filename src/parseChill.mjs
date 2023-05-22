/*
  2023-05-22 / George MacKerron (mackerron.com)
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
let numericReviverFn;

const wordRegExp = /-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?/y;
const escapes = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "\"", "", "", "", "", "", "", "", "", "", "", "", "", "/", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "\\", "", "", "", "", "", "\b", "", "", "", "\f", "", "", "", "", "", "", "", "\n", "", "", "", "\r", "", "\t"];
const hextab1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4096, 8192, 12288, 16384, 20480, 24576, 28672, 32768, 36864, 0, 0, 0, 0, 0, 0, 0, 40960, 45056, 49152, 53248, 57344, 61440, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 40960, 45056, 49152, 53248, 57344, 61440];
const hextab2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 256, 512, 768, 1024, 1280, 1536, 1792, 2048, 2304, 0, 0, 0, 0, 0, 0, 0, 2560, 2816, 3072, 3328, 3584, 3840, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2560, 2816, 3072, 3328, 3584, 3840];
const hextab3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 32, 48, 64, 80, 96, 112, 128, 144, 0, 0, 0, 0, 0, 0, 0, 160, 176, 192, 208, 224, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160, 176, 192, 208, 224, 240];
const hextab4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0, 0, 0, 0, 0, 10, 11, 12, 13, 14, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 11, 12, 13, 14, 15];

function error(m) {
  throw new JSONParseError(`${m}\nAt character ${at} in JSON: ${text}`);
};

function number() {
  let value;

  wordRegExp.lastIndex = at - 1;
  wordRegExp.test(text) || error("Unexpected value");

  const { lastIndex } = wordRegExp;
  const string = text.slice(at - 1, lastIndex);
  value = numericReviverFn ? numericReviverFn(string) : +string;

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
      value += chunk;
      at = nextQuote + 1;
      ch = text.charAt(at++);
      return value;

    } else {  // deal with backslash escapes
      chunk = chunk.slice(0, nextBackslash);
      value += chunk;
      at += nextBackslash + 1;

      let code = text.charCodeAt(at++);
      value += code === 117 /* u */ ?
        String.fromCharCode(
          hextab1[text.charCodeAt(at++)] +
          hextab2[text.charCodeAt(at++)] +
          hextab3[text.charCodeAt(at++)] +
          hextab4[text.charCodeAt(at++)]
        ) :
        escapes[code] || error("Invalid escape in string");
    }
  }
};

function array() {
  const arr = [];
  let i = 0;
  do { ch = text.charAt(at++) } while (ch < "!" && ch);
  if (ch === "]") {
    ch = text.charAt(at++)
    return arr;  // empty array
  }
  while (ch) {
    arr[i++] = value();
    while (ch < "!" && ch) ch = text.charAt(at++);
    if (ch === "]") {
      ch = text.charAt(at++)
      return arr;
    }
    do { ch = text.charAt(at++) } while (ch < "!" && ch);
  }
  error("Invalid array");
};

function object() {
  const obj = {};
  do { ch = text.charAt(at++) } while (ch < "!" && ch);
  if (ch === "}") {
    ch = text.charAt(at++);
    return obj;  // empty object
  }
  while (ch === '"') {
    const key = string();
    while (ch < "!" && ch) ch = text.charAt(at++);
    ch = text.charAt(at++);
    obj[key] = value();
    while (ch < "!" && ch) ch = text.charAt(at++);
    if (ch === "}") {
      ch = text.charAt(at++);
      return obj;
    }
    do { ch = text.charAt(at++) } while (ch < "!" && ch);
  }
  error("Invalid object");
};

function value() {
  while (ch < "!" && ch) ch = text.charAt(at++);
  switch (ch) {
    case '"': return string();
    case "{": return object();
    case "[": return array();
    case "t":
      at += 3;
      ch = text.charAt(at++);
      return true;
    case "f":
      at += 4;
      ch = text.charAt(at++);
      return false;
    case "n":
      at += 3
      ch = text.charAt(at++);
      return null;
    default:
      return number();
  }
};

export function parse(source, reviver, numericReviver) {
  if (typeof source !== "string") error("JSON source is not a string");

  at = 0;
  ch = " ";
  text = source;
  numericReviverFn = numericReviver;

  const result = value();
  while (ch < "!" && ch) ch = text.charAt(at++);
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
