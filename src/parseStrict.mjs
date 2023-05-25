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

const stringChunkRegExp = /[^"\\\n\t\u0000-\u001f]*/y;
const wordRegExp = /-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y;

// this array is indexed by the char code of an escape character 
// e.g. \n -> 'n'.charCodeAt(0) === 110, so escapes[110] === '\n'
const escapes = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "\"", "", "", "", "", "", "", "", "", "", "", "", "", "/", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "\\", "", "", "", "", "", "\b", "", "", "", "\f", "", "", "", "", "", "", "", "\n", "", "", "", "\r", "", "\t"];

// these arrays are indexed by the char code of a unicode escape hex digit;
// they store the relevant value for each of the 4 digit positions,
// but with 1 added so we can distinguish '0' from an invalid hex digit
// e.g. \u1234
// -> the '1' in position 1 is worth 1 << 12 = 4096 
// -> '1'.charCodeAt(0) === 49
// -> hexLookup1[49] === 4096 + 1 = 4097
const hexLookup1 = new Uint16Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4097, 8193, 12289, 16385, 20481, 24577, 28673, 32769, 36865, 0, 0, 0, 0, 0, 0, 0, 40961, 45057, 49153, 53249, 57345, 61441, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 40961, 45057, 49153, 53249, 57345, 61441]);
const hexLookup2 = new Uint16Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 257, 513, 769, 1025, 1281, 1537, 1793, 2049, 2305, 0, 0, 0, 0, 0, 0, 0, 2561, 2817, 3073, 3329, 3585, 3841, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2561, 2817, 3073, 3329, 3585, 3841]);
const hexLookup3 = new Uint16Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 17, 33, 49, 65, 81, 97, 113, 129, 145, 0, 0, 0, 0, 0, 0, 0, 161, 177, 193, 209, 225, 241, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 161, 177, 193, 209, 225, 241]);
const hexLookup4 = new Uint16Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0, 0, 0, 0, 0, 0, 0, 11, 12, 13, 14, 15, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 12, 13, 14, 15, 16]);

function error(m) {
  throw new JSONParseError(`${m}\nAt character ${at} in JSON: ${text}`);
};

function word() {
  let value;

  const startAt = at - 1;  // the first digit/letter was already consumed
  wordRegExp.lastIndex = startAt;
  wordRegExp.test(text) || error("Unexpected character");

  const { lastIndex } = wordRegExp;
  if (ch < "f") {  // numbers
    const string = text.slice(startAt, lastIndex);
    value = numericReviverFn ? numericReviverFn(string) : +string;

  } else {  // true/false/null
    value = ch === "n" ? null : ch === "t";
  }

  at = lastIndex;
  ch = text.charAt(at++);
  return value;
};

function badUnicode() { error("Invalid \\uXXXX escape in string"); }

function string() {  // note: it's on you to check that ch == '"' before you call this
  let value = "";

  for (; ;) {
    stringChunkRegExp.lastIndex = at;
    stringChunkRegExp.test(text);

    const { lastIndex } = stringChunkRegExp;
    if (lastIndex > at) {
      value += text.slice(at, lastIndex);
      at = lastIndex;
    }
    ch = text.charAt(at++);

    switch (ch) {
      case '"':
        ch = text.charAt(at++);
        return value;

      case "\\":
        const code = text.charCodeAt(at++);
        value += code === 117 /* 'u'.charCodeAt(0) */ ?
          String.fromCharCode(
            (hexLookup1[text.charCodeAt(at++)] || badUnicode()) +
            (hexLookup2[text.charCodeAt(at++)] || badUnicode()) +
            (hexLookup3[text.charCodeAt(at++)] || badUnicode()) +
            (hexLookup4[text.charCodeAt(at++)] || badUnicode()) - 4
          ) :
          escapes[code] ||
          error(`Invalid escape sequence '\\${String.fromCharCode(code)}' in string`);
        continue;

      case "":
        error("Unterminated string");

      default:  // must be one of \n\t\u0000-\u001f
        const charDesc = ch === '\n' ? 'newline' : ch === '\t' ? 'tab' : 'control character';
        const hexRep = ch.charCodeAt(0).toString(16);
        error(`Invalid unescaped ${charDesc} (U+${'0000'.slice(hexRep.length) + hexRep}) in string`);
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
    if (ch !== ",") error("Expected ',' but got '" + ch + "' between array elements");
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
    if (ch !== ":") error("Expected ':' but got '" + ch + "' between key and value in object");
    ch = text.charAt(at++);
    obj[key] = value();
    while (ch < "!" && (ch === " " || ch === "\n" || ch === "\r" || ch === "\t")) ch = text.charAt(at++);
    if (ch === "}") {
      ch = text.charAt(at++);
      return obj;
    }
    if (ch !== ",") error("Expected ',' but got '" + ch + "' between items in object");
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
