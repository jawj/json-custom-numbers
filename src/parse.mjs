/*
  2023-05-26 / George MacKerron (mackerron.com)
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
let textDec;

const stringChunkRegExp = /[^"\\\n\t\u0000-\u001f]*/y;
const wordRegExp = /-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y;

// this array is indexed by the char code of an escape character 
// e.g. \n -> 'n'.charCodeAt() === 110, so escapes[110] === '\n'
const x = "";
const escapes = [x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, "\"", x, x, x, x, x, x, x, x, x, x, x, x, "/", x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, "\\", x, x, x, x, x, "\b", x, x, x, "\f", x, x, x, x, x, x, x, "\n", x, x, x, "\r", x, "\t"];

// these are indexed by the char code of a hex digit used for \uXXXX escapes
const hexLookup1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4097, 8193, 12289, 16385, 20481, 24577, 28673, 32769, 36865, 0, 0, 0, 0, 0, 0, 0, 40961, 45057, 49153, 53249, 57345, 61441, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 40961, 45057, 49153, 53249, 57345, 61441];
const hexLookup2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 257, 513, 769, 1025, 1281, 1537, 1793, 2049, 2305, 0, 0, 0, 0, 0, 0, 0, 2561, 2817, 3073, 3329, 3585, 3841, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2561, 2817, 3073, 3329, 3585, 3841];
const hexLookup3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 17, 33, 49, 65, 81, 97, 113, 129, 145, 0, 0, 0, 0, 0, 0, 0, 161, 177, 193, 209, 225, 241, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 161, 177, 193, 209, 225, 241];
const hexLookup4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0, 0, 0, 0, 0, 0, 0, 11, 12, 13, 14, 15, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 12, 13, 14, 15, 16];

function error(m) {
  throw new JSONParseError(m + "\nAt character " + at + " in JSON: " + text);
};

function chDesc(prefix) {
  return ch >= 0 ? "'" + (prefix || '') + String.fromCharCode(ch) + "'" : "end of input";
}

function word() {
  let val;

  const startAt = at - 1;  // the first digit/letter was already consumed
  wordRegExp.lastIndex = startAt;
  wordRegExp.test(text) || error("Unexpected character or end of input");

  const { lastIndex } = wordRegExp;
  if (ch < 102 /* f */) {  // numbers
    const string = text.slice(startAt, lastIndex);
    val = numericReviverFn ? numericReviverFn(string) : +string;

  } else {  // null/true/false
    val = ch === 110 /* n */ ? null : ch === 116 /* t */;
  }

  at = lastIndex;
  ch = text.charCodeAt(at++);
  return val;
};

function badUnicode() { error("Invalid \\uXXXX escape in string"); }

function string() {  // note: it's on you to check that ch == '"'.charCodeAt() before you call this
  let str = "";

  for (; ;) {
    stringChunkRegExp.lastIndex = at;  // find next chunk without \ or " or invalid chars
    stringChunkRegExp.test(text);

    const { lastIndex } = stringChunkRegExp;
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
        str += ch === 117 /* u */ ?
          String.fromCharCode(
            (hexLookup1[text.charCodeAt(at++)] || badUnicode()) +
            (hexLookup2[text.charCodeAt(at++)] || badUnicode()) +
            (hexLookup3[text.charCodeAt(at++)] || badUnicode()) +
            (hexLookup4[text.charCodeAt(at++)] || badUnicode()) - 4
          ) :
          escapes[ch] ||
          error("Invalid escape sequence " + chDesc("\\") + " in string");
        continue;

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
    if (ch !== 44 /* , */) error("Expected ',' but got " + chDesc() + " after value in object");
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
    default: /*    */ return word();
  }
};

export function parse(source, reviver, numericReviver) {
  if (source instanceof Uint8Array) source = (textDec ??= new TextDecoder()).decode(source);
  if (typeof source !== "string") error("JSON must be a string, Buffer or Uint8Array");

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