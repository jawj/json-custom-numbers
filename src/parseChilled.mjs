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

const wordRegExp = /true|false|null|-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?/y;
const escapes = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "\"", "", "", "", "", "", "", "", "", "", "", "", "", "/", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "\\", "", "", "", "", "", "\b", "", "", "", "\f", "", "", "", "", "", "", "", "\n", "", "", "", "\r", "", "\t"];
const hextab1 = new Uint16Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,4097,8193,12289,16385,20481,24577,28673,32769,36865,0,0,0,0,0,0,0,40961,45057,49153,53249,57345,61441,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40961,45057,49153,53249,57345,61441]);
const hextab2 = new Uint16Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,257,513,769,1025,1281,1537,1793,2049,2305,0,0,0,0,0,0,0,2561,2817,3073,3329,3585,3841,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2561,2817,3073,3329,3585,3841]);
const hextab3 = new Uint16Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,17,33,49,65,81,97,113,129,145,0,0,0,0,0,0,0,161,177,193,209,225,241,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,161,177,193,209,225,241]);
const hextab4 = new Uint16Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,5,6,7,8,9,10,0,0,0,0,0,0,0,11,12,13,14,15,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,13,14,15,16]);

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

function badUnicode() { error("Invalid \\uXXXX escape in string"); }

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
      if (nextBackslash > 0) {
        chunk = chunk.slice(0, nextBackslash);
        value += chunk;
      }
      at += nextBackslash + 1;

      let code = text.charCodeAt(at++);
      value += code === 117 /* u */ ?
        String.fromCharCode(
          // the lookup tables have 1 added to each value so that 0 means not found, which is why we subtract 4
          (hextab1[text.charCodeAt(at++)] || badUnicode()) +
          (hextab2[text.charCodeAt(at++)] || badUnicode()) +
          (hextab3[text.charCodeAt(at++)] || badUnicode()) +
          (hextab4[text.charCodeAt(at++)] || badUnicode()) - 4
        ) :
        escapes[code] || error("Invalid escape in string");
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

export function parse(source, reviver, numericReviver) {
  if (typeof source !== "string") error("JSON source is not a string");

  at = 0;
  ch = " ";
  text = source;
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
