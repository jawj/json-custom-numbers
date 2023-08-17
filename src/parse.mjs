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
const stringChunkRegExp = /[^"\\\u0000-\u001f]*/y, wordRegExp = /-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y, escapes = '.................................."............./.............................................\\......\b....\f........\n....\r..	'.split("."), badChar = 65536, hl1 = new Uint32Array(103), hl2 = new Uint32Array(103), hl3 = new Uint32Array(103), hl4 = new Uint32Array(103);
let j = 0;
for (; j < 48; j++)
  hl1[j] = hl2[j] = hl3[j] = hl4[j] = badChar;
for (; j < 58; j++) {
  const x = j - 48;
  hl1[j] = x << 12;
  hl2[j] = x << 8;
  hl3[j] = x << 4;
  hl4[j] = x;
}
for (; j < 65; j++)
  hl1[j] = hl2[j] = hl3[j] = hl4[j] = badChar;
for (; j < 71; j++) {
  const x = j - 55;
  hl1[j] = x << 12;
  hl2[j] = x << 8;
  hl3[j] = x << 4;
  hl4[j] = x;
}
for (; j < 97; j++)
  hl1[j] = hl2[j] = hl3[j] = hl4[j] = badChar;
for (; j < 103; j++) {
  const x = j - 87;
  hl1[j] = x << 12;
  hl2[j] = x << 8;
  hl3[j] = x << 4;
  hl4[j] = x;
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
function revive(reviver, container) {
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
  let at = 0, ch, container, isArray, key, value;
  function err(m) {
    throw new JSONParseError(`${m}
At character ${at} in JSON: ${text}`);
  }
  function tooDeep() {
    err(`JSON structure is too deeply nested (current max depth: ${maxDepth})`);
  }
  function expected(expected2) {
    err(`Unexpected ${chDesc(ch)}, expecting ${expected2} ${isArray === true ? "in array" : isArray === false ? "in object" : "at top level"}`);
  }
  function word() {
    const startAt = at - 1;
    wordRegExp.lastIndex = startAt;
    const matched = wordRegExp.test(text);
    if (!matched)
      expected("JSON value");
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
            const charCode = hl1[text.charCodeAt(at++)] + hl2[text.charCodeAt(at++)] + hl3[text.charCodeAt(at++)] + hl4[text.charCodeAt(at++)];
            if (charCode < badChar) {
              str += String.fromCharCode(charCode);
              continue;
            }
            err(`Invalid \\uXXXX escape in string`);
          }
          const esc = escapes[ch];
          if (esc) {
            str += esc;
            continue;
          }
          err(`Invalid escape sequence in string: ${chDesc(ch, "\\")}`);
        default:
          if (!(ch >= 0))
            err("Unterminated string");
          err(`Invalid unescaped ${chDesc(ch)} in string`);
      }
    }
  }
  parse: {
    do {
      ch = text.charCodeAt(at++);
    } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
    switch (ch) {
      case 123:
        if (maxDepth === 0)
          tooDeep();
        container = {};
        key = void 0;
        isArray = false;
        break;
      case 91:
        if (maxDepth === 0)
          tooDeep();
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
    const stack = [];
    let stackPtr = 0;
    const maxStackPtr = maxDepth + maxDepth - 2;
    parseloop:
      for (; ; ) {
        if (isArray === true) {
          for (; ; ) {
            do {
              ch = text.charCodeAt(at++);
            } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
            if (ch === 93) {
              if (reviver !== void 0)
                revive(reviver, container);
              value = container;
              if (stackPtr === 0)
                break parse;
              container = stack[--stackPtr];
              key = stack[--stackPtr];
              isArray = typeof key === "number";
              if (isArray === true) {
                container[key++] = value;
                continue;
              } else {
                container[key] = value;
                continue parseloop;
              }
            }
            if (key !== 0) {
              if (ch !== 44)
                expected("',' or ']' after value");
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
                  tooDeep();
                stack[stackPtr++] = key;
                stack[stackPtr++] = container;
                container = {};
                key = void 0;
                isArray = false;
                continue parseloop;
              case 91:
                if (stackPtr === maxStackPtr)
                  tooDeep();
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
                revive(reviver, container);
              value = container;
              if (stackPtr === 0)
                break parse;
              container = stack[--stackPtr];
              key = stack[--stackPtr];
              isArray = typeof key === "number";
              if (isArray === true) {
                container[key++] = value;
                continue parseloop;
              } else {
                container[key] = value;
                continue;
              }
            }
            if (key !== void 0) {
              if (ch !== 44)
                expected("',' or '}' after value");
              do {
                ch = text.charCodeAt(at++);
              } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
            }
            if (ch !== 34)
              expected("'}' or double-quoted key");
            key = string();
            do {
              ch = text.charCodeAt(at++);
            } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
            if (ch !== 58)
              expected("':' after key");
            do {
              ch = text.charCodeAt(at++);
            } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
            switch (ch) {
              case 34:
                container[key] = string();
                continue;
              case 123:
                if (stackPtr === maxStackPtr)
                  tooDeep();
                stack[stackPtr++] = key;
                stack[stackPtr++] = container;
                container = {};
                key = void 0;
                continue;
              case 91:
                if (stackPtr === maxStackPtr)
                  tooDeep();
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
    err("Unexpected data after end of JSON input");
  if (reviver !== void 0) {
    value = { "": value };
    revive(reviver, value);
    value = value[""];
  }
  return value;
}
