/*
  2023-05-25 / George MacKerron (mackerron.com)
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
  throw new JSONParseError(m + "\nAt character " + at + " in JSON: " + text);
};

function word() {
  let value;

  const startAt = at - 1;  // the first digit/letter was already consumed
  wordRegExp.lastIndex = startAt;
  wordRegExp.test(text) || error("Unexpected character (or end of string)");

  const { lastIndex } = wordRegExp;
  if (ch < 102 /* f */) {  // numbers
    const string = text.slice(startAt, lastIndex);
    value = numericReviverFn ? numericReviverFn(string) : +string;

  } else {  // true/false/null
    value = ch === 110 /* n */ ? null : ch === 116 /* t */;
  }

  at = lastIndex;
  ch = text.charCodeAt(at++);
  return value;
};

function badUnicode() { error("Invalid \\uXXXX escape in string"); }

function string() {  // note: it's on you to check that ch == '"'.charCodeAt() before you call this
  let value = "";

  for (; ;) {
    stringChunkRegExp.lastIndex = at;
    stringChunkRegExp.test(text);

    const { lastIndex } = stringChunkRegExp;
    if (lastIndex > at) {
      value += text.slice(at, lastIndex);
      at = lastIndex;
    }

    ch = text.charCodeAt(at++);
    switch (ch) {
      case 34 /* " */:
        ch = text.charCodeAt(at++);
        return value;

      case 92 /* \ */:
        ch = text.charCodeAt(at++);
        value += ch === 117 /* u */ ?
          String.fromCharCode(
            (hexLookup1[text.charCodeAt(at++)] || badUnicode()) +
            (hexLookup2[text.charCodeAt(at++)] || badUnicode()) +
            (hexLookup3[text.charCodeAt(at++)] || badUnicode()) +
            (hexLookup4[text.charCodeAt(at++)] || badUnicode()) - 4
          ) :
          escapes[ch] ||
          error("Invalid escape sequence '" + String.fromCharCode(ch) + "' in string");
        continue;

      default:
        // end of string?
        if (isNaN(ch)) error("Unterminated string");
        // must be one of \n\t\u0000-\u001f
        const charDesc = ch === 10 ? "newline" : ch === 9 ? "tab" : "control character";
        const hexRep = ch.toString(16);
        const paddedHexRep = "0000".slice(hexRep.length) + hexRep;
        error("Invalid unescaped " + charDesc + " (U+" + paddedHexRep + ") in string");
    }
  }
};

function array() {
  const arr = [];
  let i = 0;
  // the '< 33' helps performance by short-circuiting the four other conditions in most cases
  do { ch = text.charCodeAt(at++) } while (ch < 33 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
  if (ch === 93 /* ] */) {
    ch = text.charCodeAt(at++)
    return arr;  // empty array
  }
  while (ch >= 0) {  // i.e. !isNaN(ch)
    arr[i++] = value();
    while (ch < 33 && (ch === 32 || ch === 10 || ch === 13 || ch === 9)) ch = text.charCodeAt(at++);
    if (ch === 93 /* ] */) {
      ch = text.charCodeAt(at++)
      return arr;
    }
    if (ch !== 44 /* , */) error("Expected ',' but got '" + String.fromCharCode(ch) + "' between array elements");
    do { ch = text.charCodeAt(at++) } while (ch < 33 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
  }
  error("Invalid array");
};

function object() {
  const obj = {};
  do { ch = text.charCodeAt(at++) } while (ch < 33 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
  if (ch === 125 /* } */) {
    ch = text.charCodeAt(at++);
    return obj;  // empty object
  }
  while (ch === 34 /* " */) {
    const key = string();
    while (ch < 33 && (ch === 32 || ch === 10 || ch === 13 || ch === 9)) ch = text.charCodeAt(at++);
    if (ch !== 58 /* : */) error("Expected ':' but got '" + String.fromCharCode(ch) + "' between key and value in object");
    ch = text.charCodeAt(at++);
    obj[key] = value();
    while (ch < 33 && (ch === 32 || ch === 10 || ch === 13 || ch === 9)) ch = text.charCodeAt(at++);
    if (ch === 125 /* } */) {
      ch = text.charCodeAt(at++);
      return obj;
    }
    if (ch !== 44 /* , */) error("Expected ',' but got '" + String.fromCharCode(ch) + "' between items in object");
    do { ch = text.charCodeAt(at++) } while (ch < 33 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
  }
  error("Invalid object");
};

function value() {
  while (ch < 33 && (ch === 32 || ch === 10 || ch === 13 || ch === 9)) ch = text.charCodeAt(at++);
  switch (ch) {
    case 34 /*  " */: return string();
    case 123 /* { */: return object();
    case 91 /*  [ */: return array();
    default: /*    */ return word();
  }
};

export function parse(source, reviver, numericReviver) {
  if (source instanceof Uint8Array) source = new TextDecoder().decode(source);
  if (typeof source !== "string") error("JSON must be a string, Buffer or Uint8Array");

  at = 0;
  ch = 32;
  text = source;
  numericReviverFn = numericReviver;

  const result = value();
  while (ch < 33 && (ch === 32 || ch === 10 || ch === 13 || ch === 9)) ch = text.charCodeAt(at++);
  if (ch >= 0) error("Unexpected data at end");  // i.e. !isNaN(ch)

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
