"use strict";
/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive, state machine-based JSON parser that's
 * intended to precisely match native `JSON.parse` behaviour but also allow for
 * custom number parsing.
 */
export class JSONParseError extends Error {
}
const stateDescs = [
  // array indices match the parser state values
  "JSON value",
  "end of input",
  "'}' or first key in object",
  "key in object",
  "':'",
  "value in object",
  "',' or '}' in object",
  "']' or first value in array",
  "value in array",
  "',' or ']' in array"
], stringChunkRegExp = /[^"\\\u0000-\u001f]*/y, wordRegExp = /-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y, escapes = '.................................."............./.............................................\\......\b....\f........\n....\r..	'.split("."), badChar = 65536, hexLookup = [], depthErrMsg = "Maximum nesting depth exceeded";
for (let i = 0; i < 4; i++) {
  const arr = hexLookup[i] = new Uint32Array(102 + 1);
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
    return "end of input";
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
  const stack = [], maxStackPtr = maxDepth * 3;
  let stackPtr = 0, at = 0, ch, state = 0, container, key, value;
  function error(m) {
    throw new JSONParseError(`${m}
At character ${at} in JSON: ${text}`);
  }
  parseloop:
    for (; ; ) {
      do {
        ch = text.charCodeAt(at++);
      } while (ch < 33 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
      switch (ch) {
        case 44:
          switch (state) {
            case 6:
              container[key] = value;
              state = 3;
              continue;
            case 9:
              container[key++] = value;
              state = 8;
              continue;
            default:
              error(`Unexpected ',', expecting ${stateDescs[state]}`);
          }
        case 34:
          value = "";
          stringloop:
            for (; ; ) {
              stringChunkRegExp.lastIndex = at;
              stringChunkRegExp.test(text);
              const lastIndex = stringChunkRegExp.lastIndex;
              if (lastIndex > at) {
                value += text.slice(at, lastIndex);
                at = lastIndex;
              }
              ch = text.charCodeAt(at++);
              switch (ch) {
                case 34:
                  break stringloop;
                case 92:
                  ch = text.charCodeAt(at++);
                  if (ch === 117) {
                    const charCode = hexLookup[3][text.charCodeAt(at++)] + hexLookup[2][text.charCodeAt(at++)] + hexLookup[1][text.charCodeAt(at++)] + hexLookup[0][text.charCodeAt(at++)];
                    if (charCode < badChar) {
                      value += String.fromCharCode(charCode);
                      continue;
                    }
                    error("Invalid \\uXXXX escape in string");
                  }
                  const esc = escapes[ch];
                  if (esc) {
                    value += esc;
                    continue;
                  }
                  error(`Invalid escape sequence in string: ${chDesc(ch, "\\")}`);
              }
              if (!(ch >= 0))
                error("Unterminated string");
              error(`Invalid unescaped ${chDesc(ch)} in string`);
            }
          switch (state) {
            case 3:
            case 2:
              key = value;
              state = 4;
              continue;
            case 5:
              state = 6;
              continue;
            case 8:
            case 7:
              state = 9;
              continue;
            case 0:
              state = 1;
              continue;
            default:
              error(`Unexpected '"', expecting ${stateDescs[state]}`);
          }
        case 58:
          if (state !== 4)
            error(`Unexpected ':', expecting ${stateDescs[state]}`);
          state = 5;
          continue;
        case 123:
          stack[stackPtr++] = container;
          stack[stackPtr++] = key;
          container = {};
          if (stackPtr > maxStackPtr)
            error(depthErrMsg);
          switch (state) {
            case 5:
              stack[stackPtr++] = 6;
              state = 2;
              continue;
            case 8:
            case 7:
              stack[stackPtr++] = 9;
              state = 2;
              continue;
            case 0:
              stack[stackPtr++] = 1;
              state = 2;
              continue;
            default:
              error(`Unexpected '{', expecting ${stateDescs[state]}`);
          }
        case 125:
          switch (state) {
            case 6:
              container[key] = value;
              if (reviver !== void 0)
                reviveContainer(reviver, container);
            case 2:
              value = container;
              state = stack[--stackPtr];
              key = stack[--stackPtr];
              container = stack[--stackPtr];
              continue;
            default:
              error(`Unexpected '}', expecting ${stateDescs[state]}`);
          }
        case 91:
          stack[stackPtr++] = container;
          stack[stackPtr++] = key;
          container = [];
          key = 0;
          if (stackPtr > maxStackPtr)
            error(depthErrMsg);
          switch (state) {
            case 5:
              stack[stackPtr++] = 6;
              state = 7;
              continue;
            case 8:
            case 7:
              stack[stackPtr++] = 9;
              state = 7;
              continue;
            case 0:
              stack[stackPtr++] = 1;
              state = 7;
              continue;
            default:
              error(`Unexpected '[', expecting ${stateDescs[state]}`);
          }
        case 93:
          switch (state) {
            case 9:
              container[key] = value;
              if (reviver !== void 0)
                reviveContainer(reviver, container);
            case 7:
              value = container;
              state = stack[--stackPtr];
              key = stack[--stackPtr];
              container = stack[--stackPtr];
              continue;
            default:
              error(`Unexpected ']', expecting ${stateDescs[state]}`);
          }
        default:
          const startAt = at - 1;
          wordRegExp.lastIndex = startAt;
          const matched = wordRegExp.test(text);
          if (!matched) {
            if (!(ch >= 0))
              break parseloop;
            error(`Unexpected ${chDesc(ch)}, expecting ${stateDescs[state]}`);
          }
          at = wordRegExp.lastIndex;
          switch (ch) {
            case 116:
              value = true;
              break;
            case 102:
              value = false;
              break;
            case 110:
              value = null;
              break;
            default:
              const str = text.slice(startAt, at);
              value = numberParser !== void 0 ? numberParser(str) : +str;
          }
          switch (state) {
            case 5:
              state = 6;
              continue;
            case 8:
            case 7:
              state = 9;
              continue;
            case 0:
              state = 1;
              continue;
            default:
              error(`Unexpected '${value}', expecting ${stateDescs[state]}`);
          }
      }
    }
  if (state !== 1)
    error(`Unexpected end of input, expecting ${stateDescs[state]}`);
  if (reviver !== void 0) {
    value = { "": value };
    reviveContainer(reviver, value);
    value = value[""];
  }
  return value;
}
