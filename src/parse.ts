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

type Obj = Record<string, any>;

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
  badChar = 65536,  // = 0xffff + 1: signals a bad character, since it's out of range
  /* </cut> */

  stringChunkRegExp = /[^"\\\u0000-\u001f]*/y,
  wordRegExp = /-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,
  trailingWhitespaceRegExp = /[ \n\t\r]*$/y,

  // this array is indexed by the char code of an escape character 
  // e.g. \n -> 'n'.charCodeAt() === 110, so escapes[110] === '\n'
  escapes = '.................................."............./.............................................\\......\b....\f........\n....\r..\t'
    .split('.'),

  // these arrays are indexed by the char code of a hex digit, used for \uXXXX escapes
  hlArr = () => new Uint32Array(103),  // minifies smaller
  hl1 = hlArr(),
  hl2 = hlArr(),
  hl3 = hlArr(),
  hl4 = hlArr();

// set up hex lookup arrays
let i = 0;
for (; i < 48; i++) hl1[i] = hl2[i] = hl3[i] = hl4[i] = badChar;
for (; i < 58; i++) hl1[i] = (hl2[i] = (hl3[i] = (hl4[i] = i - 48) << 4) << 4) << 4;  // 0 - 9
for (; i < 65; i++) hl1[i] = hl2[i] = hl3[i] = hl4[i] = badChar;
for (; i < 71; i++) hl1[i] = (hl2[i] = (hl3[i] = (hl4[i] = i - 55) << 4) << 4) << 4;  // A - F
for (; i < 97; i++) hl1[i] = hl2[i] = hl3[i] = hl4[i] = badChar;
for (; i < 103; i++) hl1[i] = (hl2[i] = (hl3[i] = (hl4[i] = i - 87) << 4) << 4) << 4;  // a - f

// describe a character in an error message
function chDesc(ch: number, prefix = '') {
  if (!(ch >= 0)) return 'end of JSON input';
  if (ch > 31 && ch < 127) return `'${prefix}${String.fromCharCode(ch)}'`;
  if (ch === newline) return '\\n';
  if (ch === tab) return '\\t';
  const hexRep = ch.toString(16);
  const paddedHexRep = '0000'.slice(hexRep.length) + hexRep;
  return (ch > 31 ? `'${prefix}${String.fromCharCode(ch)}' or ` : '') + `\\u${paddedHexRep}`;
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

// extract a line of up to 80 chars and point to the error position
function errContext(text: string, at: number, isArray: boolean | undefined) {
  const
    containerType = isArray === true ? ' in array' : isArray === false ? ' in object' : '',
    textUpTo = text.slice(0, at),
    lineUpTo = textUpTo.match(/[^\n]{0,69}$/)![0],
    ellipsisLineUpTo = lineUpTo.length < textUpTo.length ? '...' + lineUpTo : lineUpTo,
    pos = at - (textUpTo.length - ellipsisLineUpTo.length),
    textAfter = text.slice(at),
    lineAfter = textAfter.match(/[^\n]{0,5}/)![0],
    lineAfterEllipsis = lineAfter.length < textAfter.length ? lineAfter + '...' : lineAfter,
    line = ellipsisLineUpTo + lineAfterEllipsis,
    pointer = ' '.repeat(pos < 1 ? 0 : pos - 1) + '^';

  return `${containerType}\nAt position ${at} in JSON:\n${line}\n${pointer}`;
}

export function parse(
  text: string,
  reviver?: (key: string, value: any) => any,
  numberParser?: (key: string | number | undefined, str: string) => any,
  maxDepth = Infinity,  // all native implementations fail with an out-of-memory error when depth is too large
) {
  if (typeof text !== 'string') text = String(text);  // force string
  if (typeof reviver !== 'function') reviver = undefined;  // ignore non-function revivers, like JSON.parse does

  let
    at = 0,                           // character index into text
    ch: number,                       // current character code
    container: Obj | any[],           // the current container
    isArray: boolean | undefined,     // container is: true -> array; false -> object; undefined -> none (at top level)
    key: string | number | undefined, // the current key; undefined -> at top-level or just started new object
    value: any;                       // the current value

  function err(m: string) {
    throw new SyntaxError(m + errContext(text, at, isArray));
  }

  function tooDeep() {
    err(`JSON structure too deeply nested (current max depth: ${maxDepth})`);
  }

  function expected(exp: string) {
    err(`Unexpected ${chDesc(ch)}, expecting ${exp}`);
  }

  function word() {
    const startAt = at - 1;  // the first digit/letter was already consumed, so go back 1
    wordRegExp.lastIndex = startAt;
    const matched = wordRegExp.test(text);
    if (matched !== true) expected('JSON value');
    at = wordRegExp.lastIndex;

    switch (ch) {
      case f: return false;
      case n: return null;
      case t: return true;
      default:
        const str = text.slice(startAt, at);
        return numberParser ? numberParser.call(container, key, str) : +str;
    }
  }

  function string() {  // note: it's on you to check that ch == '"'.charCodeAt() before you call this
    let str = '';
    stringloop: for (; ;) {
      stringChunkRegExp.lastIndex = at;  // find next chunk without \ or " or invalid chars
      stringChunkRegExp.test(text);
      const lastIndex = stringChunkRegExp.lastIndex;

      if (lastIndex > at) {
        str += text.slice(at, lastIndex);
        at = lastIndex;
      }

      ch = text.charCodeAt(at++);  // what comes after it?
      for (; ;) {
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
                break; //continue;
              }
              err(`Invalid \\uXXXX escape in string`);
            }

            const esc = escapes[ch];  // single-character escape
            if (esc !== '' && esc !== undefined) {
              str += esc;
              break; //continue;
            }
            err(`Invalid escape sequence: ${chDesc(ch, '\\')} in string`);

          default:
            // something is wrong
            if (!(ch >= 0)) err(`Unterminated string`);
            err(`Invalid unescaped ${chDesc(ch)} in string`);
        }

        ch = text.charCodeAt(at);  // no ++!
        if (ch !== backslash && ch !== quote && ch >= space) continue stringloop;

        // looping here accelerates repeated escapes
        at++;
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

    const stack: any[] = [];
    let stackPtr = 0;

    // - two entries are added to the stack per nested container
    // - because topmost container + key are not on the stack, real depth is stackPtr + 2
    // - therefore:
    const maxStackPtr = maxDepth + maxDepth - 2;

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

  trailingWhitespaceRegExp.lastIndex = at;
  if (trailingWhitespaceRegExp.test(text) === false) err('Unexpected data after end of JSON input');

  if (reviver !== undefined) {
    value = { '': value };
    revive(reviver, value);
    value = value[''];
  }

  return value;
}
