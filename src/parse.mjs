"use strict";
export class JSONParseError extends Error {
}
const stringChunkRegExp = /[^"\\\u0000-\u001f]*/y, wordRegExp = /-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y, escapes = '.................................."............./.............................................\\......\b....\f........\n....\r..	'.split("."), badChar = 65536, hexLookup = [];
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
  const stack = [], maxStackPtr = maxDepth * 2;
  let stackPtr = 0, at = 0, ch, container, isArray, key, value;
  function error(m) {
    throw new JSONParseError(`${m}
At character ${at} in JSON: ${text}`);
  }
  function word() {
    const startAt = at - 1;
    wordRegExp.lastIndex = startAt;
    const matched = wordRegExp.test(text);
    if (!matched)
      error(`Unexpected ${chDesc(ch)}, expecting number, true, false or null`);
    at = wordRegExp.lastIndex;
    let val;
    if (ch < 102) {
      const str = text.slice(startAt, at);
      val = numberParser ? numberParser(str) : +str;
    } else {
      val = ch === 110 ? null : ch === 116;
    }
    ch = text.charCodeAt(at++);
    return val;
  }
  ;
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
          ch = text.charCodeAt(at++);
          return str;
        case 92:
          ch = text.charCodeAt(at++);
          if (ch === 117) {
            const charCode = hexLookup[3][text.charCodeAt(at++)] + hexLookup[2][text.charCodeAt(at++)] + hexLookup[1][text.charCodeAt(at++)] + hexLookup[0][text.charCodeAt(at++)];
            if (charCode < badChar) {
              str += String.fromCharCode(charCode);
              continue;
            }
            error("Invalid \\uXXXX escape in string");
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
  ;
  parse: {
    do {
      ch = text.charCodeAt(at++);
    } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
    parseprimitive: {
      switch (ch) {
        case 123:
          do {
            ch = text.charCodeAt(at++);
          } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
          if (ch === 125) {
            value = {};
            break parse;
          } else {
            container = {};
            key = void 0;
            isArray = false;
            break parseprimitive;
          }
        case 91:
          do {
            ch = text.charCodeAt(at++);
          } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
          if (ch === 93) {
            value = [];
            break parse;
          } else {
            container = [];
            key = 0;
            isArray = true;
            break parseprimitive;
          }
        case 34:
          value = string();
          break parse;
        default:
          value = word();
          break parse;
      }
    }
    parseloop:
      for (; ; ) {
        if (!(ch >= 0))
          error("Premature end of JSON data");
        if (stackPtr > maxStackPtr)
          error(`Structure too deeply nested (current maximum is ${maxDepth})`);
        if (!isArray) {
          for (; ; ) {
            if (ch === 125) {
              do {
                ch = text.charCodeAt(at++);
              } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
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
                error("Expected ',' or '}' but got " + chDesc(ch) + " after value in object");
              do {
                ch = text.charCodeAt(at++);
              } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
            }
            if (ch !== 34)
              error(`Expected '"' but got ` + chDesc(ch) + " in object");
            key = string();
            while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9))
              ch = text.charCodeAt(at++);
            if (ch !== 58)
              error("Expected ':' but got " + chDesc(ch) + " after key in object");
            do {
              ch = text.charCodeAt(at++);
            } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
            switch (ch) {
              case 34:
                container[key] = string();
                break;
              case 123:
                do {
                  ch = text.charCodeAt(at++);
                } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
                if (ch === 125) {
                  container[key] = {};
                  ch = text.charCodeAt(at++);
                  break;
                } else {
                  stack[stackPtr++] = key;
                  stack[stackPtr++] = container;
                  container = {};
                  key = void 0;
                  isArray = false;
                  continue parseloop;
                }
              case 91:
                do {
                  ch = text.charCodeAt(at++);
                } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
                if (ch === 93) {
                  container[key] = [];
                  ch = text.charCodeAt(at++);
                  break;
                } else {
                  stack[stackPtr++] = key;
                  stack[stackPtr++] = container;
                  container = [];
                  key = 0;
                  isArray = true;
                  continue parseloop;
                }
              default:
                container[key] = word();
            }
            while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9))
              ch = text.charCodeAt(at++);
          }
        } else {
          for (; ; ) {
            if (ch === 93) {
              do {
                ch = text.charCodeAt(at++);
              } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
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
            if (key > 0) {
              if (ch !== 44)
                error("Expected ',' or ']' but got " + chDesc(ch) + " after value in array");
              do {
                ch = text.charCodeAt(at++);
              } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
            }
            switch (ch) {
              case 34:
                container[key++] = string();
                break;
              case 123:
                do {
                  ch = text.charCodeAt(at++);
                } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
                if (ch === 125) {
                  container[key++] = {};
                  ch = text.charCodeAt(at++);
                  break;
                } else {
                  stack[stackPtr++] = key;
                  stack[stackPtr++] = container;
                  container = {};
                  key = void 0;
                  isArray = false;
                  continue parseloop;
                }
              case 91:
                do {
                  ch = text.charCodeAt(at++);
                } while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
                if (ch === 93) {
                  container[key++] = [];
                  ch = text.charCodeAt(at++);
                  break;
                } else {
                  stack[stackPtr++] = key;
                  stack[stackPtr++] = container;
                  container = [];
                  key = 0;
                  isArray = true;
                  continue parseloop;
                }
              default:
                container[key++] = word();
            }
            while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9))
              ch = text.charCodeAt(at++);
          }
        }
      }
  }
  while (ch <= 32 && (ch === 32 || ch === 10 || ch === 13 || ch === 9))
    ;
  if (ch >= 0)
    error("Unexpected data after end of JSON");
  if (reviver !== void 0) {
    value = { "": value };
    reviveContainer(reviver, value);
    value = value[""];
  }
  return value;
}
