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
  hl1 = new Uint32Array(103),
  hl2 = new Uint32Array(103),
  hl3 = new Uint32Array(103),
  hl4 = new Uint32Array(103);

type Obj = Record<string, any>;

// set up hex lookup arrays, used to decode Unicode \uXXXX escapes
let j = 0;
for (; j < 48; j++) hl1[j] = hl2[j] = hl3[j] = hl4[j] = badChar;
for (; j < 58; j++) {
  const x = j - 48;  // 0 - 9
  hl1[j] = x << 12;
  hl2[j] = x << 8;
  hl3[j] = x << 4;
  hl4[j] = x;
}
for (; j < 65; j++) hl1[j] = hl2[j] = hl3[j] = hl4[j] = badChar;
for (; j < 71; j++) {
  const x = j - 55;  // A - F
  hl1[j] = x << 12;
  hl2[j] = x << 8;
  hl3[j] = x << 4;
  hl4[j] = x;
}
for (; j < 97; j++) hl1[j] = hl2[j] = hl3[j] = hl4[j] = badChar;
for (; j < 103; j++) {
  const x = j - 87;  // a - f
  hl1[j] = x << 12;
  hl2[j] = x << 8;
  hl3[j] = x << 4;
  hl4[j] = x;
}

// describe a character in an error message
function chDesc(ch: number, prefix = '') {
  if (!(ch >= 0)) return 'end of JSON input';
  if (ch > 31 && ch < 127) return `'${prefix}${String.fromCharCode(ch)}'`;
  if (ch === newline) return '\\n';
  if (ch === tab) return '\\t';
  const hexRep = ch.toString(16);
  const paddedHexRep = '0000'.slice(hexRep.length) + hexRep;
  return (ch > 31 ? `'${prefix}${String.fromCharCode(ch)}', ` : '') + `\\u${paddedHexRep}`;
}

// apply reviver function to an object or array
function revive(reviver: (key: string, value: any) => any, container: Record<string, any>) {
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
  numberParser?: (string: string, key?: string | number | undefined) => any,
  maxDepth = Infinity,  // all native implementations fail with an out-of-memory error when depth is too large
) {
  if (typeof text !== 'string') text = String(text);  // force string
  if (typeof reviver !== 'function') reviver = undefined;  // ignore non-function revivers, like JSON.parse does

  const
    stack: any[] = [],
    // - two entries are added to the stack per nested container
    // - because topmost container + key are not on the stack, real depth is stackPtr + 2
    // - therefore:
    maxStackPtr = maxDepth + maxDepth - 2;

  let
    stackPtr = 0,                     // the stack pointer
    at = 0,                           // character index into text
    ch: number,                       // current character code
    container: Obj | any[],           // the current container
    isArray: boolean,                 // is the current container an array? (if not, it's an object)
    key: string | number | undefined, // the current key (number or string)
    value: any;                       // the current value

  function err(m: string) {
    throw new JSONParseError(`${m}\nAt character ${at} in JSON: ${text}`);
  }

  function tooDeep() {
    err(`JSON structure is too deeply nested (current max depth: ${maxDepth})`);
  }

  function expected(expected: string) {
    err(`Unexpected ${chDesc(ch)}, expecting ${expected} ${isArray === true ? 'in array' : isArray === false ? 'in object' : 'at top level'}`);
  }

  function word() {
    const startAt = at - 1;  // the first digit/letter was already consumed, so go back 1
    wordRegExp.lastIndex = startAt;
    const matched = wordRegExp.test(text);
    if (!matched) expected('JSON value');
    at = wordRegExp.lastIndex;

    switch (ch) {
      case f: return false;
      case n: return null;
      case t: return true;
      default:
        const str = text.slice(startAt, at);
        return numberParser ? numberParser(str, key) : +str;
    }
  }

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
        case quote:
          return str;

        case backslash:
          ch = text.charCodeAt(at++);
          if (ch === u) {  // Unicode \uXXXX escape
            const charCode =
              hl1[text.charCodeAt(at++)] +
              hl2[text.charCodeAt(at++)] +
              hl3[text.charCodeAt(at++)] +
              hl4[text.charCodeAt(at++)];

            if (charCode < badChar) {  // (NaN also fails this test)
              str += String.fromCharCode(charCode);
              continue;
            }
            err(`Invalid \\uXXXX escape in string`);
          }

          const esc = escapes[ch];  // single-character escape
          if (esc) {  // i.e. esc !== '' && esc !== undefined
            str += esc;
            continue;
          }
          err(`Invalid escape sequence in string: ${chDesc(ch, '\\')}`);

        default:
          // something is wrong
          if (!(ch >= 0)) err('Unterminated string');
          err(`Invalid unescaped ${chDesc(ch)} in string`);
      }
    }
  }

  parse: {
    do { ch = text.charCodeAt(at++) } while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab));

    switch (ch) {
      case openbrace:
        if (maxDepth === 0) tooDeep();
        container = {};
        key = undefined;
        isArray = false;
        break;

      case opensquare:
        if (maxDepth === 0) tooDeep();
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

    parseloop: for (; ;) {
      if (isArray === true) {
        // array loop
        for (; ;) {
          do { ch = text.charCodeAt(at++) } while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab));

          if (ch === closesquare) {
            if (reviver !== undefined) revive(reviver, container);
            value = container;
            if (stackPtr === 0) break parse;

            container = stack[--stackPtr];
            key = stack[--stackPtr];
            isArray = typeof key === 'number';

            if (isArray === true) {
              (container as any)[(key as number)++] = value;
              continue;  // still in an array: no need to break array loop

            } else {
              (container as any)[key as string] = value;
              continue parseloop;
            }
          }

          if (key !== 0) {
            if (ch !== comma) expected("',' or ']' after value");
            do { ch = text.charCodeAt(at++) } while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab));
          }

          switch (ch) {
            case quote:
              (container as any[])[(key as number)++] = string();
              continue;

            case openbrace:
              if (stackPtr === maxStackPtr) tooDeep();
              stack[stackPtr++] = key;
              stack[stackPtr++] = container;
              container = {};
              key = undefined;
              isArray = false;
              continue parseloop;

            case opensquare:
              if (stackPtr === maxStackPtr) tooDeep();
              stack[stackPtr++] = key;
              stack[stackPtr++] = container;
              container = [];
              key = 0;
              // isArray is already true
              continue;  // still in an array: no need to break array loop

            default:
              (container as any[])[(key as number)++] = word();
          }
        }

      } else {
        // object loop
        for (; ;) {
          do { ch = text.charCodeAt(at++) } while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab));

          if (ch === closebrace) {
            if (reviver !== undefined) revive(reviver, container);
            value = container;
            if (stackPtr === 0) break parse;

            container = stack[--stackPtr];
            key = stack[--stackPtr];
            isArray = typeof key === 'number';

            if (isArray === true) {
              (container as any)[(key as number)++] = value;
              continue parseloop;

            } else {
              (container as any)[key as string] = value;
              continue;  // still in an object: no need to break object loop
            }
          }

          if (key !== undefined) {
            if (ch !== comma) expected("',' or '}' after value");
            do { ch = text.charCodeAt(at++) } while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab));
          }

          if (ch !== quote) expected("'}' or double-quoted key");
          key = string();
          do { ch = text.charCodeAt(at++) } while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab));

          if (ch !== colon) expected("':' after key");
          do { ch = text.charCodeAt(at++) } while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab));

          switch (ch) {
            case quote:
              (container as Obj)[key] = string();
              continue;

            case openbrace:
              if (stackPtr === maxStackPtr) tooDeep();
              stack[stackPtr++] = key;
              stack[stackPtr++] = container;
              container = {};
              key = undefined;
              // isArray is already false
              continue;  // still in an object: no need to break object loop

            case opensquare:
              if (stackPtr === maxStackPtr) tooDeep();
              stack[stackPtr++] = key;
              stack[stackPtr++] = container;
              container = [];
              key = 0;
              isArray = true;
              continue parseloop;

            default:
              (container as Obj)[key] = word();
          }
        }
      }
    }
  }

  do { ch = text.charCodeAt(at++) } while (ch <= space && (ch === space || ch === newline || ch === cr || ch === tab));
  if (ch >= 0) err('Unexpected data after end of JSON input');

  if (reviver !== undefined) {
    value = { '': value };
    revive(reviver, value);
    value = value[''];
  }

  return value;
}
