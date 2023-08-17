"use strict";
/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive JSON parser that's intended to
 * precisely match native `JSON.parse` behaviour but also allow for custom
 * number parsing.
 */
export class JSONParseError extends Error {
}
const stringChunkRegExp = /[^"\\\u0000-\u001f]*/y, wordRegExp = /-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y, escapes = '.................................."............./.............................................\\......\b....\f........\n....\r..	'.split("."), badChar = 65536, hexLookup = [];
for (let i = 0; i < 4; i++) {
  const arr = hexLookup[i] = new Uint32Array(103);
  const shift = i << 2;
  let j = 0;
  for (; j < 48; j++)
    arr[j] = badChar;
  for (; j < 58; j++)
    arr[j] = j - 48 << shift;
  for (; j < 65; j++)
    arr[j] = badChar;
  for (; j < 71; j++)
    arr[j] = j - 55 << shift;
  for (; j < 97; j++)
    arr[j] = badChar;
  for (; j < 103; j++)
    arr[j] = j - 87 << shift;
}
function chDesc(ch, prefix = "") {
  if (!(ch >= 0))
    return "end of JSON input";
  if (ch > 31 && ch < 127)
    return `'${prefix}${String.fromCharCode(ch)}'`;
  if (ch === 10)
    return "\\n";
  if (ch === 9)
    return "\\t";
  const hexRep = ch.toString(16);
  const paddedHexRep = "0000".slice(hexRep.length) + hexRep;
  return (ch > 31 ? `'${prefix}${String.fromCharCode(ch)}', ` : "") + `\\u${paddedHexRep}`;
}
function reviveContainer(reviver, container) {
  const keys = Object.keys(container);
  const numKeys = keys.length;
  for (let i = 0; i < numKeys; i++) {
    const k = keys[i];
    const v = reviver.call(container, k, container[k]);
    if (v !== void 0)
      container[k] = v;
    else
      delete container[k];
  }
}
export function parse(text, reviver, numberParser, maxDepth = Infinity) {
  if (typeof text !== "string")
    text = String(text);
  if (typeof reviver !== "function")
    reviver = void 0;
  const stack = [], maxStackPtr = (maxDepth - 1) * 2;
  let stackPtr = 0, at = 0, ch, container, isArray, key, value;
  function error(m) {
    throw new JSONParseError(`${m}
At character ${at} in JSON: ${text}`);
  }
  function depthError() {
    error(`JSON structure is too deeply nested (current maximum depth: ${maxDepth})`);
  }
  function word() {
    const startAt = at - 1;
    wordRegExp.lastIndex = startAt;
    const matched = wordRegExp.test(text);
    if (!matched)
      error(`Unexpected ${chDesc(ch)}, expecting JSON value ${isArray === true ? "in array" : isArray === false ? "in object" : "at top level"}`);
    at = wordRegExp.lastIndex;
    switch (ch) {
      case 102:
        return false;
      case 110:
        return null;
      case 116:
        return true;
      default:
        const str = text.slice(startAt, at);
        return numberParser ? numberParser(str, key) : +str;
    }
  }
  function string() {
    let str = "";
    for (; ; ) {
      stringChunkRegExp.lastIndex = at;
      stringChunkRegExp.test(text);
      const lastIndex = stringChunkRegExp.lastIndex;
      if (lastIndex > at) {
        str += text.slice(at, lastIndex);
        at = lastIndex;
      }
      ch = text.charCodeAt(at++);
      switch (ch) {
        case 34:
          return str;
        case 92:
          ch = text.charCodeAt(at++);
          if (ch === 117) {
            const charCode = hexLookup[3][text.charCodeAt(at++)] + hexLookup[2][text.charCodeAt(at++)] + hexLookup[1][text.charCodeAt(at++)] + hexLookup[0][text.charCodeAt(at++)];
            if (charCode < badChar) {
              str += String.fromCharCode(charCode);
              continue;
            }
            error(`Invalid \\uXXXX escape in string`);
          }
          const esc = escapes[ch];
          if (esc) {
            str += esc;
            continue;
          }
          error(`Invalid escape sequence in string: ${chDesc(ch, "\\")}`);
        default:
          if (!(ch >= 0))
            error("Unterminated string");
          error(`Invalid unescaped ${chDesc(ch)} in string`);
      }
    }
  }
  parse: {
    do {
      ch = text.charCodeAt(at++);
    } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
    switch (ch) {
      case 123:
        container = {};
        key = void 0;
        isArray = false;
        break;
      case 91:
        container = [];
        key = 0;
        isArray = true;
        break;
      case 34:
        value = string();
        break parse;
      default:
        value = word();
        break parse;
    }
    parseloop:
      for (; ; ) {
        if (isArray) {
          for (; ; ) {
            do {
              ch = text.charCodeAt(at++);
            } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
            if (ch === 93) {
              if (reviver !== void 0)
                reviveContainer(reviver, container);
              value = container;
              if (stackPtr === 0)
                break parse;
              container = stack[--stackPtr];
              key = stack[--stackPtr];
              isArray = typeof key === "number";
              container[isArray ? key++ : key] = value;
              continue parseloop;
            }
            if (key !== 0) {
              if (ch !== 44)
                error(`Unexpected ${chDesc(ch)}, expecting ',' or ']' after value in array`);
              do {
                ch = text.charCodeAt(at++);
              } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
            }
            switch (ch) {
              case 34:
                container[key++] = string();
                continue;
              case 123:
                if (stackPtr === maxStackPtr)
                  depthError();
                stack[stackPtr++] = key;
                stack[stackPtr++] = container;
                container = {};
                key = void 0;
                isArray = false;
                continue parseloop;
              case 91:
                if (stackPtr === maxStackPtr)
                  depthError();
                stack[stackPtr++] = key;
                stack[stackPtr++] = container;
                container = [];
                key = 0;
                continue;
              default:
                container[key++] = word();
            }
          }
        } else {
          for (; ; ) {
            do {
              ch = text.charCodeAt(at++);
            } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
            if (ch === 125) {
              if (reviver !== void 0)
                reviveContainer(reviver, container);
              value = container;
              if (stackPtr === 0)
                break parse;
              container = stack[--stackPtr];
              key = stack[--stackPtr];
              isArray = typeof key === "number";
              container[isArray ? key++ : key] = value;
              continue parseloop;
            }
            if (key !== void 0) {
              if (ch !== 44)
                error(`Unexpected ${chDesc(ch)}, expecting ',' or '}' after value in object`);
              do {
                ch = text.charCodeAt(at++);
              } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
            }
            if (ch !== 34)
              error(`Unexpected ${chDesc(ch)}, expecting '}' or double-quoted key in object`);
            key = string();
            do {
              ch = text.charCodeAt(at++);
            } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
            if (ch !== 58)
              error(`Unexpected ${chDesc(ch)}, expecting ':' after key in object`);
            do {
              ch = text.charCodeAt(at++);
            } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
            switch (ch) {
              case 34:
                container[key] = string();
                continue;
              case 123:
                if (stackPtr === maxStackPtr)
                  depthError();
                stack[stackPtr++] = key;
                stack[stackPtr++] = container;
                container = {};
                key = void 0;
                continue;
              case 91:
                if (stackPtr === maxStackPtr)
                  depthError();
                stack[stackPtr++] = key;
                stack[stackPtr++] = container;
                container = [];
                key = 0;
                isArray = true;
                continue parseloop;
              default:
                container[key] = word();
            }
          }
        }
      }
  }
  do {
    ch = text.charCodeAt(at++);
  } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
  if (ch >= 0)
    error("Unexpected data after end of JSON input");
  if (reviver !== void 0) {
    value = { "": value };
    reviveContainer(reviver, value);
    value = value[""];
  }
  return value;
}
