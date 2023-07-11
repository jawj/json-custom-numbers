/*
  2023-07-10 / George MacKerron (mackerron.com)
  Based on https://github.com/douglascrockford/JSON-js/blob/03157639c7a7cddd2e9f032537f346f1a87c0f6d/json_parse.js
  Public Domain
  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
*/

"use strict";

export class JSONParseError extends Error { }

let
  at,  // the index of the current character
  ch,  // the current character code
  text,  // JSON source string
  numericReviverFn,  // function that transforms numeric strings ("123") to numbers (123)
  textDec;  // a TextDecoder instance, if one becomes necessary

const
  // these 'sticky' RegExps are used to parse (1) strings and (2) numbers, true/false and null
  stringChunkRegExp = /[^"\\\u0000-\u001f]*/y,
  wordRegExp = /-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,

  // this array is indexed by the char code of an escape character 
  // e.g. \n -> 'n'.charCodeAt() === 110, so escapes[110] === '\n'
  x = "",
  escapes = [x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, "\"", x, x, x, x, x, x, x, x, x, x, x, x, "/", x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, "\\", x, x, x, x, x, "\b", x, x, x, "\f", x, x, x, x, x, x, x, "\n", x, x, x, "\r", x, "\t"],

  // these arrays are indexed by the char code of a hex digit, used for \uXXXX escapes
  y = 65536,  // = 0xffff + 1: signals a bad character, since it's out of range
  hexLookup1 = new Uint32Array([y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 0, 4096, 8192, 12288, 16384, 20480, 24576, 28672, 32768, 36864, y, y, y, y, y, y, y, 40960, 45056, 49152, 53248, 57344, 61440, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 40960, 45056, 49152, 53248, 57344, 61440]),
  hexLookup2 = new Uint32Array([y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 0, 256, 512, 768, 1024, 1280, 1536, 1792, 2048, 2304, y, y, y, y, y, y, y, 2560, 2816, 3072, 3328, 3584, 3840, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 2560, 2816, 3072, 3328, 3584, 3840]),
  hexLookup3 = new Uint32Array([y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 0, 16, 32, 48, 64, 80, 96, 112, 128, 144, y, y, y, y, y, y, y, 160, 176, 192, 208, 224, 240, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 160, 176, 192, 208, 224, 240]),
  hexLookup4 = new Uint32Array([y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, y, y, y, y, y, y, y, 10, 11, 12, 13, 14, 15, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 10, 11, 12, 13, 14, 15]);

function error(m) {
  throw new JSONParseError(m + "\nAt character " + at + " in JSON: " + text);
};

function chDesc(prefix) {
  return ch >= 0 ? "'" + (prefix || '') + String.fromCharCode(ch) + "'" : "end of input";
}

function word() {
  const startAt = at - 1;  // the first digit/letter was already consumed, so go back 1
  wordRegExp.lastIndex = startAt;
  wordRegExp.test(text) || error("Unexpected character or end of input");
  at = wordRegExp.lastIndex;

  let val;
  if (ch < 102 /* f */) {  // has to be a number
    const str = text.slice(startAt, at);
    val = numericReviverFn ? numericReviverFn(str) : +str;

  } else {  // must be null/true/false
    val = ch === 110 /* n */ ? null : ch === 116 /* t */;
  }

  ch = text.charCodeAt(at++);
  return val;
};

function string() {  // note: it's on you to check that ch == '"'.charCodeAt() before you call this
  let str = "";
  for (; ;) {
    stringChunkRegExp.lastIndex = at;  // find next chunk without \ or " or invalid chars
    stringChunkRegExp.test(text);

    const lastIndex = stringChunkRegExp.lastIndex;
    if (lastIndex > at) {
      str += text.slice(at, lastIndex);
      at = lastIndex;
    }

    ch = text.charCodeAt(at++);  // what comes after it?
    switch (ch) {
      case 34 /* " */:  // end of string
        ch = text.charCodeAt(at++);
        return str;

      case 92 /* \ */:  // backslash escape
        ch = text.charCodeAt(at++);
        if (ch === 117 /* u */) {  // Unicode \uXXXX escape
          const charCode =
            hexLookup1[text.charCodeAt(at++)] + hexLookup2[text.charCodeAt(at++)] +
            hexLookup3[text.charCodeAt(at++)] + hexLookup4[text.charCodeAt(at++)];

          if (charCode < 65536) {  // (NaN also fails this test)
            str += String.fromCharCode(charCode);
            continue;
          }
          error("Invalid \\uXXXX escape in string");
        }

        const esc = escapes[ch];  // single-character escape
        if (esc) {
          str += esc;
          continue;
        }
        error("Invalid escape sequence " + chDesc("\\") + " in string");

      default:  // something is wrong
        if (isNaN(ch)) error("Unterminated string");

        const invalidChDesc = ch === 10 ? "newline" : ch === 9 ? "tab" : "control character";
        const hexRep = ch.toString(16);
        const paddedHexRep = "0000".slice(hexRep.length) + hexRep;
        error("Invalid unescaped " + invalidChDesc + " (\\u" + paddedHexRep + ") in string");
    }
  }
};

function array() {
  const arr = [];
  let i = 0;
  // the '< 33' helps performance by short-circuiting the four other conditions in most cases
  do { ch = text.charCodeAt(at++) } while (ch < 33 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
  if (ch === 93 /* ] */) {
    ch = text.charCodeAt(at++);
    return arr;  // empty array
  }
  while (ch >= 0) {  // i.e. !isNaN(ch)
    arr[i++] = value();
    while (ch < 33 && (ch === 32 || ch === 10 || ch === 13 || ch === 9)) ch = text.charCodeAt(at++);
    if (ch === 93 /* ] */) {
      ch = text.charCodeAt(at++);
      return arr;
    }
    if (ch !== 44 /* , */) error("Expected ',' but got " + chDesc() + " after array element");
    do { ch = text.charCodeAt(at++) } while (ch < 33 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
  }
  error("Unterminated array");
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
    if (ch !== 58 /* : */) error("Expected ':' but got " + chDesc() + " after key in object");
    ch = text.charCodeAt(at++);
    obj[key] = value();
    while (ch < 33 && (ch === 32 || ch === 10 || ch === 13 || ch === 9)) ch = text.charCodeAt(at++);
    if (ch === 125 /* } */) {
      ch = text.charCodeAt(at++);
      return obj;
    }
    if (ch !== 44 /* , */) error("Expected ',' or '}' but got " + chDesc() + " after value in object");
    do { ch = text.charCodeAt(at++) } while (ch < 33 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
  }
  error("Expected '\"' but got " + chDesc() + " in object");
};

function value() {
  while (ch < 33 && (ch === 32 || ch === 10 || ch === 13 || ch === 9)) ch = text.charCodeAt(at++);
  switch (ch) {
    case 34 /*  " */: return string();
    case 123 /* { */: return object();
    case 91 /*  [ */: return array();
    default /*    */: return word();
  }
};

export function parse(source, reviver, numericReviver) {
  if (globalThis.Buffer && source instanceof globalThis.Buffer) source = (textDec ??= new TextDecoder()).decode(source);
  if (typeof source !== "string") error("JSON must be a string or Buffer");

  at = 0;
  ch = 32;
  text = source;
  numericReviverFn = numericReviver;

  const result = value();
  while (ch < 33 && (ch === 32 || ch === 10 || ch === 13 || ch === 9)) ch = text.charCodeAt(at++);
  if (ch >= 0) error("Unexpected data at end of input");  // i.e. !isNaN(ch)

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
