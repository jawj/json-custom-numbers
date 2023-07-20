"use strict";
export class JSONParseError extends Error {
}
const stateDescs = [
  "JSON value",
  "end of input",
  "first key in object",
  "key in object",
  "colon",
  "value in object",
  "comma or closing brace for object",
  "first value in array",
  "value in array",
  "comma or closing bracket for array"
], stringChunkRegExp = /[^"\\\u0000-\u001f]*/y, wordRegExp = /-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y, x = "", escapes = [x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, '"', x, x, x, x, x, x, x, x, x, x, x, x, "/", x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, "\\", x, x, x, x, x, "\b", x, x, x, "\f", x, x, x, x, x, x, x, "\n", x, x, x, "\r", x, "	"], noKey = "", noContainer = [], y = 65536, hexLookup1 = new Uint32Array([y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 0, 4096, 8192, 12288, 16384, 20480, 24576, 28672, 32768, 36864, y, y, y, y, y, y, y, 40960, 45056, 49152, 53248, 57344, 61440, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 40960, 45056, 49152, 53248, 57344, 61440]), hexLookup2 = new Uint32Array([y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 0, 256, 512, 768, 1024, 1280, 1536, 1792, 2048, 2304, y, y, y, y, y, y, y, 2560, 2816, 3072, 3328, 3584, 3840, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 2560, 2816, 3072, 3328, 3584, 3840]), hexLookup3 = new Uint32Array([y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 0, 16, 32, 48, 64, 80, 96, 112, 128, 144, y, y, y, y, y, y, y, 160, 176, 192, 208, 224, 240, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 160, 176, 192, 208, 224, 240]), hexLookup4 = new Uint32Array([y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, y, y, y, y, y, y, y, 10, 11, 12, 13, 14, 15, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 10, 11, 12, 13, 14, 15]);
let text, at, ch, state, depth, container, key, value = void 0;
function error(m) {
  return new JSONParseError(m + "\nAt character " + at + " in JSON: " + text);
}
function parseString() {
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
            const charCode = hexLookup1[text.charCodeAt(at++)] + hexLookup2[text.charCodeAt(at++)] + hexLookup3[text.charCodeAt(at++)] + hexLookup4[text.charCodeAt(at++)];
            if (charCode < 65536) {
              value += String.fromCharCode(charCode);
              continue;
            }
            throw error("Invalid \\uXXXX escape in string");
          }
          const esc = escapes[ch];
          if (esc) {
            value += esc;
            continue;
          }
          const chDesc = ch >= 0 ? "'\\" + String.fromCharCode(ch) + "'" : "end of input";
          throw error("Invalid escape sequence " + chDesc + " in string");
      }
      if (isNaN(ch))
        throw error("Unterminated string");
      const invalidChDesc = ch === 10 ? "newline" : ch === 9 ? "tab" : "control character";
      const hexRep = ch.toString(16);
      const paddedHexRep = "0000".slice(hexRep.length) + hexRep;
      throw error("Invalid unescaped " + invalidChDesc + " (\\u" + paddedHexRep + ") in string");
    }
}
function parseWord() {
  const startAt = at - 1;
  wordRegExp.lastIndex = startAt;
  const matched = wordRegExp.test(text);
  if (!matched)
    throw error("Unexpected '" + String.fromCharCode(ch) + "', expecting " + stateDescs[state]);
  at = wordRegExp.lastIndex;
  if (ch < 102) {
    const str = text.slice(startAt, at);
    value = +str;
  } else {
    value = ch === 110 ? null : ch === 116;
  }
}
function noop() {
}
function err() {
  throw new JSONParseError(`Unexpected '${String.fromCharCode(ch)}', expecting ${stateDescs[state]}`);
}
function end() {
  if (ch === 0)
    err();
  return true;
}
function quote_x_okey_firstokey() {
  parseString();
  key = value;
  state = 4;
}
function quote_x_ovalue() {
  parseString();
  state = 6;
}
function quote_x_avalue_firstavalue() {
  parseString();
  state = 9;
}
function quote_x_go() {
  parseString();
  state = 1;
}
function word_x_ovalue() {
  parseWord();
  state = 6;
}
function word_x_avalue_firstavalue() {
  parseWord();
  state = 9;
}
function word_x_go() {
  parseWord();
  state = 1;
}
function comma_x_ocomma() {
  container[key] = value;
  state = 3;
}
function comma_x_acomma() {
  container[container.length] = value;
  state = 8;
}
function colon_x_ocolon() {
  state = 5;
}
function openbrace_x_ovalue() {
  stateStack[depth] = 6;
  containerStack[depth] = container;
  keyStack[depth++] = key;
  container = {};
  state = 2;
}
function openbrace_x_avalue_firstavalue() {
  stateStack[depth] = 9;
  containerStack[depth] = container;
  keyStack[depth++] = noKey;
  container = {};
  state = 2;
}
function openbrace_x_go() {
  stateStack[depth] = 1;
  containerStack[depth] = noContainer;
  keyStack[depth++] = noKey;
  container = {};
  state = 2;
}
function closebrace_x_ocomma() {
  container[key] = value;
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
  stateStack[depth] = 6;
  containerStack[depth] = container;
  keyStack[depth++] = key;
  container = [];
  state = 7;
}
function opensquare_x_avalue_firstavalue() {
  stateStack[depth] = 9;
  containerStack[depth] = container;
  keyStack[depth++] = noKey;
  container = [];
  state = 7;
}
function opensquare_x_go() {
  stateStack[depth] = 1;
  containerStack[depth] = noContainer;
  keyStack[depth++] = noKey;
  container = [];
  state = 7;
}
function closesquare_x_acomma() {
  container[container.length] = value;
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
const tr = [err, err, err, err, err, err, err, err, err, noop, noop, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, err, quote_x_go, err, err, err, err, err, err, err, err, err, err, word_x_go, err, err, word_x_go, word_x_go, word_x_go, word_x_go, word_x_go, word_x_go, word_x_go, word_x_go, word_x_go, word_x_go, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, opensquare_x_go, err, err, err, err, err, err, err, err, err, err, word_x_go, err, err, err, err, err, err, err, word_x_go, err, err, err, err, err, word_x_go, err, err, err, err, err, err, openbrace_x_go, err, err, err, err, end, err, err, err, err, err, err, err, err, noop, noop, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, noop, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, err, quote_x_okey_firstokey, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, closebrace_x_firstokey, err, err, err, err, err, err, err, err, err, err, err, noop, noop, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, err, quote_x_okey_firstokey, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, noop, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, colon_x_ocolon, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, noop, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, err, quote_x_ovalue, err, err, err, err, err, err, err, err, err, err, word_x_ovalue, err, err, word_x_ovalue, word_x_ovalue, word_x_ovalue, word_x_ovalue, word_x_ovalue, word_x_ovalue, word_x_ovalue, word_x_ovalue, word_x_ovalue, word_x_ovalue, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, opensquare_x_ovalue, err, err, err, err, err, err, err, err, err, err, word_x_ovalue, err, err, err, err, err, err, err, word_x_ovalue, err, err, err, err, err, word_x_ovalue, err, err, err, err, err, err, openbrace_x_ovalue, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, noop, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, comma_x_ocomma, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, closebrace_x_ocomma, err, err, err, err, err, err, err, err, err, err, err, noop, noop, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, err, quote_x_avalue_firstavalue, err, err, err, err, err, err, err, err, err, err, word_x_avalue_firstavalue, err, err, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, opensquare_x_avalue_firstavalue, err, closesquare_x_firstavalue, err, err, err, err, err, err, err, err, word_x_avalue_firstavalue, err, err, err, err, err, err, err, word_x_avalue_firstavalue, err, err, err, err, err, word_x_avalue_firstavalue, err, err, err, err, err, err, openbrace_x_avalue_firstavalue, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, noop, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, err, quote_x_avalue_firstavalue, err, err, err, err, err, err, err, err, err, err, word_x_avalue_firstavalue, err, err, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, word_x_avalue_firstavalue, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, opensquare_x_avalue_firstavalue, err, err, err, err, err, err, err, err, err, err, word_x_avalue_firstavalue, err, err, err, err, err, err, err, word_x_avalue_firstavalue, err, err, err, err, err, word_x_avalue_firstavalue, err, err, err, err, err, err, openbrace_x_avalue_firstavalue, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, noop, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, noop, err, err, err, err, err, err, err, err, err, err, err, comma_x_acomma, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, closesquare_x_acomma, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err, err];
let containerStack, keyStack, stateStack;
export function parse(json) {
  text = json;
  at = 0;
  ch = 32;
  state = 0;
  depth = 0;
  container = noContainer;
  key = noKey;
  value = void 0;
  containerStack = [];
  keyStack = [];
  stateStack = [];
  do {
    ch = text.charCodeAt(at++);
  } while (!tr[ch | state << 7]());
  return value;
}
