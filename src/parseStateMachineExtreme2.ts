"use strict";

export class JSONParseError extends Error { }

const
  /* <cut> -- esbuild will cut this section and define constants as literals */
  // parser states
  go = 0,           // starting state
  ok = 1,           // final, accepting state
  firstokey = 2,    // ready for the first key of the object or the closing of an empty object
  okey = 3,         // ready for the next key of the object
  ocolon = 4,       // ready for the colon
  ovalue = 5,       // ready for the value half of a key/value pair
  ocomma = 6,       // ready for a comma or closing }
  firstavalue = 7,  // ready for the first value of an array or an empty array
  avalue = 8,       // ready for the next value of an array
  acomma = 9,       // ready for a comma or closing ]

  // char codes
  tab = 9,
  newline = 10,
  cr = 13,
  space = 32,
  quote = 34,
  comma = 44,
  minus = 45,
  d0 = 48,
  d9 = 57,
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

  stateDescs = [
    'JSON value',
    'end of input',
    'first key in object',
    'key in object',
    'colon',
    'value in object',
    'comma or closing brace for object',
    'first value in array',
    'value in array',
    'comma or closing bracket for array'
  ],

  // these 'sticky' RegExps are used to parse (1) strings and (2) numbers, true/false and null
  stringChunkRegExp = /[^"\\\u0000-\u001f]*/y,
  wordRegExp = /-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,

  // this array is indexed by the char code of an escape character 
  // e.g. \n -> 'n'.charCodeAt() === 110, so escapes[110] === '\n'
  x = "",
  escapes = [x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, "\"", x, x, x, x, x, x, x, x, x, x, x, x, "/", x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, "\\", x, x, x, x, x, "\b", x, x, x, "\f", x, x, x, x, x, x, x, "\n", x, x, x, "\r", x, "\t"],

  noKey = '',
  noContainer: any[] = [],

  // these arrays are indexed by the char code of a hex digit, used for \uXXXX escapes
  y = 65536,  // = 0xffff + 1: signals a bad character, since it's out of range
  hexLookup1 = new Uint32Array([y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 0, 4096, 8192, 12288, 16384, 20480, 24576, 28672, 32768, 36864, y, y, y, y, y, y, y, 40960, 45056, 49152, 53248, 57344, 61440, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 40960, 45056, 49152, 53248, 57344, 61440]),
  hexLookup2 = new Uint32Array([y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 0, 256, 512, 768, 1024, 1280, 1536, 1792, 2048, 2304, y, y, y, y, y, y, y, 2560, 2816, 3072, 3328, 3584, 3840, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 2560, 2816, 3072, 3328, 3584, 3840]),
  hexLookup3 = new Uint32Array([y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 0, 16, 32, 48, 64, 80, 96, 112, 128, 144, y, y, y, y, y, y, y, 160, 176, 192, 208, 224, 240, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 160, 176, 192, 208, 224, 240]),
  hexLookup4 = new Uint32Array([y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, y, y, y, y, y, y, y, 10, 11, 12, 13, 14, 15, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 10, 11, 12, 13, 14, 15]);

type Container = any[] | Record<string, any>;

let
  text: string,
  at: number,       // character index into text
  ch: number,       // current character code
  state: number,    // the state of the parser
  depth: number,    // the stack pointer
  container: Container,  // the current container object or array
  key: string,      // the current key
  value: any = undefined;        // the current value

function error(m: string) {
  return new JSONParseError(m + "\nAt character " + at + " in JSON: " + text);
}

function parseString() {
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
            hexLookup1[text.charCodeAt(at++)] + hexLookup2[text.charCodeAt(at++)] +
            hexLookup3[text.charCodeAt(at++)] + hexLookup4[text.charCodeAt(at++)];

          if (charCode < 65536) {  // (NaN also fails this test)
            value += String.fromCharCode(charCode);
            continue;
          }
          throw error('Invalid \\uXXXX escape in string');
        }

        const esc = escapes[ch];  // single-character escape
        if (esc) {
          value += esc;
          continue;
        }
        const chDesc = ch >= 0 ? "'\\" + String.fromCharCode(ch) + "'" : 'end of input';
        throw error('Invalid escape sequence ' + chDesc + ' in string');
    }

    // something is wrong
    if (isNaN(ch)) throw error('Unterminated string');

    const invalidChDesc = ch === newline ? 'newline' : ch === tab ? 'tab' : 'control character';
    const hexRep = ch.toString(16);
    const paddedHexRep = '0000'.slice(hexRep.length) + hexRep;
    throw error('Invalid unescaped ' + invalidChDesc + ' (\\u' + paddedHexRep + ') in string');
  }
}

function parseWord() {
  const startAt = at - 1;  // the first digit/letter was already consumed, so go back 1

  wordRegExp.lastIndex = startAt;
  const matched = wordRegExp.test(text);
  if (!matched) throw error("Unexpected '" + String.fromCharCode(ch) + "', expecting " + stateDescs[state]);

  at = wordRegExp.lastIndex;

  if (ch < f) {  // has to be a number
    const str = text.slice(startAt, at);
    // val = numericReviverFn ? numericReviverFn(str) : +str;
    value = +str;

  } else {  // must be null/true/false
    value = ch === n ? null : ch === t;
  }
}

// transition functions

function noop() { }
function err() {
  throw new JSONParseError(`Unexpected '${String.fromCharCode(ch)}', expecting ${stateDescs[state]}`);
}
function end() {
  if (ch === 0) err();
  return true;
}
function quote_x_okey_firstokey() {
  parseString();
  key = value;
  state = ocolon;
}
function quote_x_ovalue() {
  parseString();
  state = ocomma;
}
function quote_x_avalue_firstavalue() {
  parseString();
  state = acomma;
}
function quote_x_go() {
  parseString();
  state = ok;
}
function word_x_ovalue() {
  parseWord();
  state = ocomma;
}
function word_x_avalue_firstavalue() {
  parseWord();
  state = acomma;
}
function word_x_go() {
  parseWord();
  state = ok;
}
function comma_x_ocomma() {
  (container as Record<string, any>)[key!] = value;
  state = okey;
}
function comma_x_acomma() {
  (container as any[])[container.length] = value;
  state = avalue;
}
function colon_x_ocolon() {
  state = ovalue;
}
function openbrace_x_ovalue() {
  stateStack[depth] = ocomma;
  containerStack[depth] = container;
  keyStack[depth++] = key;
  container = {};
  state = firstokey;
}
function openbrace_x_avalue_firstavalue() {
  stateStack[depth] = acomma;
  containerStack[depth] = container;
  keyStack[depth++] = noKey;
  container = {};
  state = firstokey;
}
function openbrace_x_go() {
  stateStack[depth] = ok;
  containerStack[depth] = noContainer;
  keyStack[depth++] = noKey;
  container = {};
  state = firstokey;
}
function closebrace_x_ocomma() {
  (container as Record<string, any>)[key!] = value;
  value = container;
  container = containerStack[--depth];
  key = keyStack[depth];
  state = stateStack[depth];
}
function closebrace_x_firstokey() {
  value = container;
  container = containerStack[--depth];
  key = keyStack[depth];
  state = stateStack[depth];
}
function opensquare_x_ovalue() {
  stateStack[depth] = ocomma;
  containerStack[depth] = container;
  keyStack[depth++] = key;
  container = [];
  state = firstavalue;
}
function opensquare_x_avalue_firstavalue() {
  stateStack[depth] = acomma;
  containerStack[depth] = container;
  keyStack[depth++] = noKey;
  container = [];
  state = firstavalue;
}
function opensquare_x_go() {
  stateStack[depth] = ok;
  containerStack[depth] = noContainer;
  keyStack[depth++] = noKey;
  container = [];
  state = firstavalue;
}
function closesquare_x_acomma() {
  (container as any)[container.length] = value;
  value = container;
  container = containerStack[--depth];
  key = keyStack[depth];
  state = stateStack[depth];
}
function closesquare_x_firstavalue() {
  value = container;
  container = containerStack[--depth];
  key = keyStack[depth];
  state = stateStack[depth];
}

const tr: (() => void | boolean)[] = [err, err, err, err, err, err, err, err, err, noop, noop, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, err, quote_x_go, err, err, err, err, err, err, err, err, err, err, word_x_go, err, err, word_x_go, word_x_go, word_x_go, word_x_go, word_x_go, word_x_go, word_x_go, word_x_go, word_x_go, word_x_go, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, opensquare_x_go, err, err, err, err, err, err, err, err, err, err, word_x_go, err, err, err, err, err, err, err, word_x_go, err, err, err, err, err, word_x_go, err, err, err, err, err, err, openbrace_x_go, err, err, err, err, end, err, err, err, err, err, err, err, err, noop, noop, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, noop, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, err, quote_x_okey_firstokey, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, closebrace_x_firstokey, err, err, err, err, err, err, err, err, err, err, err, noop, noop, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, err, quote_x_okey_firstokey, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, noop, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, colon_x_ocolon, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, noop, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, err, quote_x_ovalue, err, err, err, err, err, err, err, err, err, err, word_x_ovalue, err, err, word_x_ovalue, word_x_ovalue, word_x_ovalue, word_x_ovalue, word_x_ovalue, word_x_ovalue, word_x_ovalue, word_x_ovalue, word_x_ovalue, word_x_ovalue, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, opensquare_x_ovalue, err, err, err, err, err, err, err, err, err, err, word_x_ovalue, err, err, err, err, err, err, err, word_x_ovalue, err, err, err, err, err, word_x_ovalue, err, err, err, err, err, err, openbrace_x_ovalue, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, noop, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, comma_x_ocomma, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, closebrace_x_ocomma, err, err, err, err, err, err, err, err, err, err, err, noop, noop, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, err, quote_x_avalue_firstavalue, err, err, err, err, err, err, err, err, err, err, word_x_avalue_firstavalue, err, err, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, opensquare_x_avalue_firstavalue, err, closesquare_x_firstavalue, err, err, err, err, err, err, err, err, word_x_avalue_firstavalue, err, err, err, err, err, err, err, word_x_avalue_firstavalue, err, err, err, err, err, word_x_avalue_firstavalue, err, err, err, err, err, err, openbrace_x_avalue_firstavalue, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, noop, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, err, quote_x_avalue_firstavalue, err, err, err, err, err, err, err, err, err, err, word_x_avalue_firstavalue, err, err, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, opensquare_x_avalue_firstavalue, err, err, err, err, err, err, err, err, err, err, word_x_avalue_firstavalue, err, err, err, err, err, err, err, word_x_avalue_firstavalue, err, err, err, err, err, word_x_avalue_firstavalue, err, err, err, err, err, err, openbrace_x_avalue_firstavalue, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, noop, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, comma_x_acomma, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, closesquare_x_acomma, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err];

let
  containerStack: Container[],
  keyStack: string[],
  stateStack: number[];

export function parse(json: string) {
  text = json;
  at = 0;       // character index into text
  ch = 32;   // current character code
  state = go;   // the state of the parser
  depth = 0;    // the stack pointer
  container = noContainer;    // the current container object or array
  key = noKey;          // the current key
  value = undefined;        // the current value

  containerStack = [];
  keyStack = [];
  stateStack = [];

  do { ch = text.charCodeAt(at++); } while (!tr[ch | state << 7]());
  return value;
}
