/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive, state machine-based JSON parser that's
 * intended to precisely match native `JSON.parse` behaviour but also allow for
 * custom number parsing.
 */

"use strict";

export class JSONParseError extends Error { }

const
  /* <cut> -- sed will cut this section and esbuild will define constants as literals */

  // parser states
  go = 0,           // starting state
  ok = 1,           // final valid state
  firstokey = 2,    // ready for the first key of the object or the closing of an empty object
  okey = 3,         // ready for the next key of the object
  ocolon = 4,       // ready for the colon
  ovalue = 5,       // ready for the value half of a key/value pair
  ocomma = 6,       // ready for a comma or closing }
  firstavalue = 7,  // ready for the first value of an array or an empty array
  avalue = 8,       // ready for the next value of an array
  acomma = 9,       // ready for a comma or closing ]

  // useful char codes
  tab = 9,
  newline = 10,
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

  stateDescs = [  // array indices match the parser state values
    'JSON value',
    'end of input',
    "'}' or first key in object",
    'key in object',
    "':'",
    'value in object',
    "',' or '}' in object",
    "']' or first value in array",
    'value in array',
    "',' or ']' in array"
  ],

  // these 'sticky' RegExps are used to parse (1) strings and (2) numbers, true/false and null
  stringChunkRegExp = /[^"\\\u0000-\u001f]*/y,
  wordRegExp = /-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,

  // this array is indexed by the char code of an escape character 
  // e.g. \n -> 'n'.charCodeAt() === 110, so escapes[110] === '\n'
  escapes = '.................................."............./.............................................\\......\b....\f........\n....\r..\t'.split('.'),

  // these arrays are indexed by the char code of a hex digit, used for \uXXXX escapes
  badChar = 65536,  // = 0xffff + 1: signals a bad character, since it's out of range
  hexLookup: Uint32Array[] = [],

  depthErrMsg = 'Maximum nesting depth exceeded';

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
  if (typeof reviver !== 'function') reviver = undefined;  // ignore non-function revivers, like JSON.parse

  const
    stack: any[] = [],
    maxStackPtr = maxDepth * 3;  // 3 is the number of entries added to the stack per nested container

  let
    stackPtr = 0,   // the stack pointer
    at = 0,         // character index into text
    ch: number,     // current character code
    state = go,     // the state of the parser
    container,      // the current container object or array
    key,            // the current key
    value;          // the current value

  function error(m: string) {
    throw new JSONParseError(`${m}\nAt character ${at} in JSON: ${text}`);
  }

  parseloop: for (; ;) {
    // whitespace
    do { ch = text.charCodeAt(at++) } while (ch < 33 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));

    // next token
    switch (ch) {
      case comma:
        switch (state) {
          case ocomma:
            (container as Record<string, any>)[key!] = value;
            state = okey;
            continue;
          case acomma:
            container[key++] = value;
            state = avalue;
            continue;
          default:
            error(`Unexpected ',', expecting ${stateDescs[state]}`);
        }

      case quote:
        value = '';
        stringloop: for (; ;) {
          stringChunkRegExp.lastIndex = at;  // find next chunk without \ or " or invalid chars
          stringChunkRegExp.test(text);

          const lastIndex = stringChunkRegExp.lastIndex;
          if (lastIndex > at) {
            value += text.slice(at, lastIndex);
            at = lastIndex;
          }

          ch = text.charCodeAt(at++);  // what comes after it?
          switch (ch) {
            case quote:  // end of string
              break stringloop;

            case backslash:
              ch = text.charCodeAt(at++);
              if (ch === u) {  // Unicode \uXXXX escape
                const charCode =
                  hexLookup[3][text.charCodeAt(at++)] +
                  hexLookup[2][text.charCodeAt(at++)] +
                  hexLookup[1][text.charCodeAt(at++)] +
                  hexLookup[0][text.charCodeAt(at++)];

                if (charCode < badChar) {  // (NaN also fails this test)
                  value += String.fromCharCode(charCode);
                  continue;
                }
                error('Invalid \\uXXXX escape in string');
              }

              const esc = escapes[ch];  // single-character escape
              if (esc) {
                value += esc;
                continue;
              }
              error(`Invalid escape sequence in string: ${chDesc(ch, '\\')}`);
          }

          // something is wrong
          if (!(ch >= 0)) error('Unterminated string');
          error(`Invalid unescaped ${chDesc(ch)} in string`);
        }

        switch (state) {
          case okey:
          case firstokey:
            key = value;
            state = ocolon;
            continue;
          case ovalue:
            state = ocomma;
            continue;
          case avalue:
          case firstavalue:
            state = acomma;
            continue;
          case go:
            state = ok;
            continue;
          default:
            error(`Unexpected '"', expecting ${stateDescs[state]}`);
        }

      case colon:
        if (state !== ocolon) error(`Unexpected ':', expecting ${stateDescs[state]}`);
        state = ovalue;
        continue;

      case openbrace:
        stack[stackPtr++] = container;
        stack[stackPtr++] = key;
        container = {};

        if (stackPtr > maxStackPtr) error(depthErrMsg);

        switch (state) {
          case ovalue:
            stack[stackPtr++] = ocomma;
            state = firstokey;
            continue;
          case avalue:
          case firstavalue:
            stack[stackPtr++] = acomma;
            state = firstokey;
            continue;
          case go:
            stack[stackPtr++] = ok;
            state = firstokey;
            continue;
          default:
            error(`Unexpected '{', expecting ${stateDescs[state]}`);
        }

      case closebrace:
        switch (state) {
          case ocomma:
            (container as Record<string, any>)[key!] = value;
            if (reviver !== undefined) reviveContainer(reviver, container);  // reviving only applies to contained items, so is not needed in state firstokey
          // deliberate fallthrough
          case firstokey:
            value = container;
            state = stack[--stackPtr];
            key = stack[--stackPtr];
            container = stack[--stackPtr];
            continue;
          default:
            error(`Unexpected '}', expecting ${stateDescs[state]}`);
        }

      case opensquare:
        stack[stackPtr++] = container;
        stack[stackPtr++] = key;
        container = [];
        key = 0;

        if (stackPtr > maxStackPtr) error(depthErrMsg);

        switch (state) {
          case ovalue:
            stack[stackPtr++] = ocomma;
            state = firstavalue;
            continue;
          case avalue:
          case firstavalue:
            stack[stackPtr++] = acomma;
            state = firstavalue;
            continue;
          case go:
            stack[stackPtr++] = ok;
            state = firstavalue;
            continue;
          default:
            error(`Unexpected '[', expecting ${stateDescs[state]}`);
        }

      case closesquare:
        switch (state) {
          case acomma:
            container[key] = value;  // no need to increment key (= index) on last value
            if (reviver !== undefined) reviveContainer(reviver, container);  // reviving only applies to contained items, so is not needed in state firstavalue
          // deliberate fall-through
          case firstavalue:
            value = container;
            state = stack[--stackPtr];
            key = stack[--stackPtr];
            container = stack[--stackPtr];
            continue;
          default:
            error(`Unexpected ']', expecting ${stateDescs[state]}`);
        }

      default:  // numbers, true, false, null
        const startAt = at - 1;  // the first digit/letter was already consumed, so go back 1

        wordRegExp.lastIndex = startAt;
        const matched = wordRegExp.test(text);
        if (!matched) {
          if (!(ch >= 0)) break parseloop;  // end of input reached
          error(`Unexpected ${chDesc(ch)}, expecting ${stateDescs[state]}`);
        }

        at = wordRegExp.lastIndex;

        switch (ch) {
          case t:
            value = true;
            break;
          case f:
            value = false;
            break;
          case n:
            value = null;
            break;
          default:
            const str = text.slice(startAt, at);
            value = numberParser !== undefined ? numberParser(str) : +str;
        }

        switch (state) {
          case ovalue:
            state = ocomma;
            continue;
          case avalue:
          case firstavalue:
            state = acomma;
            continue;
          case go:
            state = ok;
            continue;
          default:
            error(`Unexpected '${value}', expecting ${stateDescs[state]}`);
        }
    }
  }

  if (state !== ok) error(`Unexpected end of input, expecting ${stateDescs[state]}`);

  if (reviver !== undefined) {
    value = { '': value };
    reviveContainer(reviver, value);
    value = value[''];
  }

  return value;
}
