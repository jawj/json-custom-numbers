/*
  2023-05-19 / George MacKerron (mackerron.com)
  Public Domain
  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
*/

"use strict";

let at;     // The index of the current character
let ch;     // The current character
let text;
let numericReviverFn;
let skipIllegalStringCharCheck;

const escapee = {
  "\"": "\"",
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

function next(c) {
  if (c && c !== ch) error("Expected '" + c + "' instead of '" + ch + "'");
  ch = text.charAt(at);
  at += 1;
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
  let start = at;

  if (ch === "\"") {
    parseloop:
    while (next()) {
      if (ch === "\"") {
        const chunk = text.slice(start, at - 1);
        if (!skipIllegalStringCharCheck && illegalStringChars.test(chunk)) break;
        value += chunk;

        next();
        return value;
      }

      if (ch === "\\") {
        const chunk = text.slice(start, at - 1);
        if (!skipIllegalStringCharCheck && illegalStringChars.test(chunk)) break;
        value += chunk;

        next();

        if (ch === "u") {
          let uffff = 0;
          for (let i = 0; i < 4; i++) {
            const hex = parseInt(next(), 16);
            if (!isFinite(hex)) break parseloop;
            uffff = uffff * 16 + hex;
          }
          value += String.fromCharCode(uffff);

        } else if (typeof escapee[ch] === "string") {
          value += escapee[ch];

        } else {
          break;
        }
        start = at;
      }
    }
  }

  error("Bad string");
};

function white() {
  while (ch === " " || ch === "\n" || ch === "\r" || ch === "\t") next();
};

function word() {
  switch (ch) {
    case "t":
      next("t");
      next("r");
      next("u");
      next("e");
      return true;
    case "f":
      next("f");
      next("a");
      next("l");
      next("s");
      next("e");
      return false;
    case "n":
      next("n");
      next("u");
      next("l");
      next("l");
      return null;
  }
  error("Unexpected '" + ch + "'");
};

function array() {
  const arr = [];

  if (ch === "[") {
    next("[");
    white();
    if (ch === "]") {
      next("]");
      return arr;   // empty array
    }
    while (ch) {
      arr.push(value());
      white();
      if (ch === "]") {
        next("]");
        return arr;
      }
      next(",");
      white();
    }
  }
  error("Bad array");
};

function object() {
  const obj = {};

  if (ch === "{") {
    next("{");
    white();
    if (ch === "}") {
      next("}");
      return obj;   // empty object
    }
    while (ch) {
      const key = string();
      white();
      next(":");
      obj[key] = value();
      white();
      if (ch === "}") {
        next("}");
        return obj;
      }
      next(",");
      white();
    }
  }
  error("Bad object");
};

function value() {
  white();
  switch (ch) {
    case "{":
      return object();
    case "[":
      return array();
    case "\"":
      return string();
    case "-":
      return number();
    default:
      return (ch >= "0" && ch <= "9")
        ? number()
        : word();
  }
};

export function parse(source, reviver, numericReviver, fastStrings) {

  if (typeof source !== 'string') error("JSON source is not a string");

  text = source;
  numericReviverFn = numericReviver;
  skipIllegalStringCharCheck = fastStrings;

  at = 0;
  ch = " ";

  const result = value();
  white();
  if (ch) error("Syntax error");

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
