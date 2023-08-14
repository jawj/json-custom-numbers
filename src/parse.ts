/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive JSON parser that's intended to
 * precisely match native `JSON.parse` behaviour but also allow for custom
 * number parsing.
 */

"use strict";

export class JSONParseError extends Error { }

const
  /* <cut> -- sed will cut this section and esbuild will define constants as literals */
  tab = 9,
  newline = 10,
  cr = 13,
  space = 32,
  quote = 34,
  comma = 44,
  colon = 58,
  opensquare = 91,
  closesquare = 93,
  backslash = 92,
  f = 102,
  n = 110,
  t = 116,
  u = 117,
  openbrace = 123,
  closebrace = 125,
  /* </cut> */

  // these 'sticky' RegExps are used to parse (1) strings and (2) numbers, true/false and null
  stringChunkRegExp = /[^"\\\u0000-\u001f]*/y,
  wordRegExp = /-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,

  // this array is indexed by the char code of an escape character 
  // e.g. \n -> 'n'.charCodeAt() === 110, so escapes[110] === '\n'
  escapes = '.................................."............./.............................................\\......\b....\f........\n....\r..\t'
    .split('.'),

  // these arrays are indexed by the char code of a hex digit, used for \uXXXX escapes
  badChar = 65536,  // = 0xffff + 1: signals a bad character, since it's out of range
  hexLookup: Uint32Array[] = [];

type Obj = Record<string, any>;

for (let i = 0; i < 4; i++) {
  const arr = hexLookup[i] = new Uint32Array(f + 1);
  const shift = i << 2;
  let j = 0;
  for (; j < 48; j++) arr[j] = badChar;
  for (; j < 58; j++) arr[j] = (j - 48) << shift;  // 0 - 9
  for (; j < 65; j++) arr[j] = badChar;
  for (; j < 71; j++) arr[j] = (j - 55) << shift;  // A - F
  for (; j < 97; j++) arr[j] = badChar;
  for (; j < 103; j++) arr[j] = (j - 87) << shift;  // a - f
}

function chDesc(ch: number, prefix = '') {
  if (!(ch >= 0)) return 'end of input';
  if (ch > 31 && ch < 127) return `'${prefix}${String.fromCharCode(ch)}'`;
  if (ch === newline) return '\\n';
  if (ch === tab) return '\\t';
  const hexRep = ch.toString(16);
  const paddedHexRep = '0000'.slice(hexRep.length) + hexRep;
  return (ch > 31 ? `'${prefix}${String.fromCharCode(ch)}', ` : '') + `\\u${paddedHexRep}`;
}

function reviveContainer(reviver: (key: string, value: any) => any, container: Record<string, any>) {
  const keys = Object.keys(container);
  const numKeys = keys.length;
  for (let i = 0; i < numKeys; i++) {
    const k = keys[i];
    const v = reviver.call(container, k, container[k]);
    if (v !== undefined) container[k] = v;
    else delete container[k];
  }
}

export function parse(
  text: string,
  reviver?: (key: string, value: any) => any,
  numberParser?: (string: string) => any,
  maxDepth = Infinity,  // all native implementations fail with an out-of-memory error when depth is too large
) {
  if (typeof text !== 'string') text = String(text);  // force string
  if (typeof reviver !== 'function') reviver = undefined;  // ignore non-function revivers, like JSON.parse does

  const
    stack: any[] = [],
    maxStackPtr = (maxDepth - 1) * 2;  // 2 is the number of entries added to the stack per nested container

  let
    stackPtr = 0,     // the stack pointer
    at = 0,           // character index into text
    ch: number,       // current character code
    container,        // the current container
    isArray: boolean, // is the current container an array? (if not, it's an object)
    key: any,         // the current key (number or string)
    value: any;       // the current value

  function error(m: string) {
    throw new JSONParseError(`${m}\nAt character ${at} in JSON: ${text}`);
  }

  function containerDesc() {
    return isArray === true ? 'in array' : isArray === false ? 'in object' : 'at top level';
  }

  function word() {
    if (!(ch >= 0)) error(`Unexpected end of JSON input ${containerDesc()}`);

    const startAt = at - 1;  // the first digit/letter was already consumed, so go back 1
    wordRegExp.lastIndex = startAt;
    const matched = wordRegExp.test(text);
    if (!matched) error(`Unexpected ${chDesc(ch)}, expecting JSON value ${containerDesc()}`);

    at = wordRegExp.lastIndex;

    let val;
    switch (ch) {
      case f:
        val = false;
        break;
      case n:
        val = null;
        break;
      case t:
        val = true;
        break;
      default:
        const str = text.slice(startAt, at);
        val = numberParser ? numberParser(str) : +str;
    }

    ch = text.charCodeAt(at++);
    return val;
  };

  function string() {  // note: it's on you to check that ch == '"'.charCodeAt() before you call this
    let str = '';
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
        case quote:  // end of string
          ch = text.charCodeAt(at++);
          return str;

        case backslash:
          ch = text.charCodeAt(at++);
          if (ch === u) {  // Unicode \uXXXX escape
            const charCode =
              hexLookup[3][text.charCodeAt(at++)] +
              hexLookup[2][text.charCodeAt(at++)] +
              hexLookup[1][text.charCodeAt(at++)] +
              hexLookup[0][text.charCodeAt(at++)];

            if (charCode < badChar) {  // (NaN also fails this test)
              str += String.fromCharCode(charCode);
              continue;
            }
            error(`Invalid \\uXXXX escape in string`);
          }

          const esc = escapes[ch];  // single-character escape
          if (esc) {  // i.e. esc !== '' && esc !== undefined
            str += esc;
            continue;
          }
          error(`Invalid escape sequence in string: ${chDesc(ch, '\\')}`);

        default:
          // something is wrong
          if (!(ch >= 0)) error('Unterminated string');
          error(`Invalid unescaped ${chDesc(ch)} in string`);
      }

    }
  };

  parse: {
    do { ch = text.charCodeAt(at++) } while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab));

    switch (ch) {
      case openbrace:
        container = {};
        key = undefined;
        isArray = false;
        break;

      case opensquare:
        container = [];
        key = 0;
        isArray = true;
        break;

      case quote:
        value = string();
        break parse;

      default:
        value = word();
        break parse;
    }

    do { ch = text.charCodeAt(at++) } while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab));

    parseloop: for (; ;) {
      if (isArray) {
        arrayloop: for (; ;) {
          if (ch === closesquare) {
            do { ch = text.charCodeAt(at++) } while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab));
            if (reviver !== undefined) reviveContainer(reviver, container);
            value = container;
            if (stackPtr === 0) break parse;

            container = stack[--stackPtr];
            key = stack[--stackPtr];
            isArray = typeof key === 'number';
            container[isArray ? key++ : key] = value;
            continue parseloop;  // skips stackPtr check
          }

          if (key !== 0) {
            if (ch !== comma) error(`Unexpected ${chDesc(ch)}, expecting ',' or ']' after value in array`);
            do { ch = text.charCodeAt(at++) } while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab));
          }

          switch (ch) {
            case quote:
              (container as any[])[key++] = string();
              break;

            case openbrace:
              do { ch = text.charCodeAt(at++) } while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab));
              if (ch === closebrace) {
                (container as any[])[key++] = {};
                ch = text.charCodeAt(at++);
                break;

              } else {
                stack[stackPtr++] = key;
                stack[stackPtr++] = container;
                container = {};
                key = undefined;
                isArray = false;
                break arrayloop;
              }

            case opensquare:
              do { ch = text.charCodeAt(at++) } while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab));
              if (ch === closesquare) {
                (container as any[])[key++] = [];
                ch = text.charCodeAt(at++);
                break;

              } else {
                stack[stackPtr++] = key;
                stack[stackPtr++] = container;
                container = [];
                key = 0;
                isArray = true;
                break arrayloop;
              }

            default:
              (container as any[])[key++] = word();
          }

          while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab)) ch = text.charCodeAt(at++);
        }

      } else {
        objectloop: for (; ;) {
          if (ch === closebrace) {
            do { ch = text.charCodeAt(at++) } while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab));
            if (reviver !== undefined) reviveContainer(reviver, container);
            value = container;
            if (stackPtr === 0) break parse;

            container = stack[--stackPtr];
            key = stack[--stackPtr];
            isArray = typeof key === 'number';
            container[isArray ? key++ : key] = value;
            continue parseloop;  // skips stackPtr check
          }

          if (key !== undefined) {
            if (ch !== comma) error(`Unexpected ${chDesc(ch)}, expecting ',' or '}' after value in object`);
            do { ch = text.charCodeAt(at++) } while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab));
          }

          if (ch !== quote) error(`Unexpected ${chDesc(ch)}, expecting '}' or double-quoted key in object`);

          key = string();
          while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab)) ch = text.charCodeAt(at++);

          if (ch !== colon) error(`Unexpected ${chDesc(ch)}, expecting ':' after key in object`);
          do { ch = text.charCodeAt(at++) } while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab));

          switch (ch) {
            case quote:
              (container as Obj)[key] = string();
              break;

            case openbrace:
              do { ch = text.charCodeAt(at++) } while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab));
              if (ch === closebrace) {
                (container as Obj)[key] = {};
                ch = text.charCodeAt(at++);
                break;

              } else {
                stack[stackPtr++] = key;
                stack[stackPtr++] = container;
                container = {};
                key = undefined;
                isArray = false;
                break objectloop;
              }

            case opensquare:
              do { ch = text.charCodeAt(at++) } while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab));
              if (ch === closesquare) {
                (container as Obj)[key] = [];
                ch = text.charCodeAt(at++);
                break;

              } else {
                stack[stackPtr++] = key;
                stack[stackPtr++] = container;
                container = [];
                key = 0;
                isArray = true;
                break objectloop;
              }

            default:
              (container as Obj)[key] = word();
          }

          while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab)) ch = text.charCodeAt(at++);
        }
      }

      if (stackPtr > maxStackPtr) error(`Structure too deeply nested (current maximum is ${maxDepth})`);
    }
  }

  while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab)) ch = text.charCodeAt(at++);
  if (ch >= 0) error('Unexpected data after end of JSON input');

  if (reviver !== undefined) {
    value = { '': value };
    reviveContainer(reviver, value);
    value = value[''];
  }

  return value;
}
