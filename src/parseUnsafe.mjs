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

const wordRegExp = /-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?/y;

// this array is indexed by the char code of an escape character 
// e.g. \n -> 'n'.charCodeAt(0) === 110, so escapes[110] === '\n'
const escapes = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "\"", "", "", "", "", "", "", "", "", "", "", "", "", "/", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "\\", "", "", "", "", "", "\b", "", "", "", "\f", "", "", "", "", "", "", "", "\n", "", "", "", "\r", "", "\t"];

// these are indexed by the char code of a hex digit used for \uXXXX escapes
const hexLookup1 = new Uint16Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4096, 8192, 12288, 16384, 20480, 24576, 28672, 32768, 36864, 0, 0, 0, 0, 0, 0, 0, 40960, 45056, 49152, 53248, 57344, 61440, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 40960, 45056, 49152, 53248, 57344, 61440]);
const hexLookup2 = new Uint16Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 256, 512, 768, 1024, 1280, 1536, 1792, 2048, 2304, 0, 0, 0, 0, 0, 0, 0, 2560, 2816, 3072, 3328, 3584, 3840, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2560, 2816, 3072, 3328, 3584, 3840]);
const hexLookup3 = new Uint16Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 32, 48, 64, 80, 96, 112, 128, 144, 0, 0, 0, 0, 0, 0, 0, 160, 176, 192, 208, 224, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 160, 176, 192, 208, 224, 240]);
const hexLookup4 = new Uint16Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0, 0, 0, 0, 0, 10, 11, 12, 13, 14, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 11, 12, 13, 14, 15]);

function error(m) {
  throw new JSONParseError(m + "\nAt character " + at + " in JSON: " + text);
};

function word() {
  let val;

  const startAt = at - 1;  // the first digit/letter was already consumed
  wordRegExp.lastIndex = startAt;
  wordRegExp.test(text) || error("Unexpected character or end of string");

  const { lastIndex } = wordRegExp;
  const string = text.slice(startAt, lastIndex);
  val = numericReviverFn ? numericReviverFn(string) : +string;

  at = lastIndex;
  ch = text.charCodeAt(at++);
  return val;
};

function string() {  // note: it's on you to check that ch == '"' before you call this
  let value = "";
  let nextQuote = -1;
  for (; ;) {
    if (nextQuote < at) nextQuote = text.indexOf('"', at);
    if (nextQuote === -1) error("Unterminated string");

    if (nextQuote === at) { // empty string: we're done
      at = nextQuote + 1;
      ch = text.charCodeAt(at++);
      return value;
    }

    let chunk = text.slice(at, nextQuote); // non-empty string: let's retrieve it
    const nextBackslash = chunk.indexOf("\\");

    if (nextBackslash === -1) {  // no backslashes up to end quote: we're done
      value += chunk;
      at = nextQuote + 1;
      ch = text.charCodeAt(at++);
      return value;

    } else {  // deal with backslash escapes
      if (nextBackslash > 0) {
        chunk = chunk.slice(0, nextBackslash);
        value += chunk;
      }
      at += nextBackslash + 1;

      ch = text.charCodeAt(at++);
      value += ch === 117 /* u */ ?
        String.fromCharCode(
          hexLookup1[text.charCodeAt(at++)] +
          hexLookup2[text.charCodeAt(at++)] +
          hexLookup3[text.charCodeAt(at++)] +
          hexLookup4[text.charCodeAt(at++)]
        ) :
        escapes[ch] || error("Invalid escape in string");
    }
  }
};

function array() {
  const arr = [];
  let i = 0;
  // the '< 33' helps performance by short-circuiting the four other conditions in most cases
  do { ch = text.charCodeAt(at++) } while (ch < 33);
  if (ch === 93 /* ] */) {
    ch = text.charCodeAt(at++)
    return arr;  // empty array
  }
  while (ch >= 0) {  // i.e. !isNaN(ch)
    arr[i++] = value();
    while (ch < 33) ch = text.charCodeAt(at++);
    if (ch === 93 /* ] */) {
      ch = text.charCodeAt(at++)
      return arr;
    }
    do { ch = text.charCodeAt(at++) } while (ch < 33);
  }
  error("Invalid array");
};

function object() {
  const obj = {};
  do { ch = text.charCodeAt(at++) } while (ch < 33);
  if (ch === 125 /* } */) {
    ch = text.charCodeAt(at++);
    return obj;  // empty object
  }
  while (ch === 34 /* " */) {
    const key = string();
    while (ch < 33) ch = text.charCodeAt(at++);
    ch = text.charCodeAt(at++);
    obj[key] = value();
    while (ch < 33) ch = text.charCodeAt(at++);
    if (ch === 125 /* } */) {
      ch = text.charCodeAt(at++);
      return obj;
    }
    do { ch = text.charCodeAt(at++) } while (ch < 33);
  }
  error("Invalid object");
};

function value() {
  while (ch < 33) ch = text.charCodeAt(at++);
  switch (ch) {
    case 34 /*  " */:
      return string();
    case 123 /* { */:
      return object();
    case 91 /*  [ */:
      return array();
    case 116 /* t */:
      at += 3;
      ch = text.charCodeAt(at++);
      return true;
    case 102 /* f */:
      at += 4;
      ch = text.charCodeAt(at++);
      return false;
    case 110 /* n */:
      at += 3;
      ch = text.charCodeAt(at++);
      return null;
    default:
      return word();
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
