
"use strict";

export class JSONParseError extends Error { }

const
  unfinished = Symbol("unfinished"),

  // these 'sticky' RegExps are used to parse (1) strings and (2) numbers, true/false and null
  stringChunkRegExp = /[^"\\\u0000-\u001f]*/y,
  wordRegExp = /-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,

  // this array is indexed by the char code of an escape character 
  // e.g. \n -> 'n'.charCodeAt() === 110, so escapes[110] === '\n'
  x = "",
  escapes = [x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, "\"", x, x, x, x, x, x, x, x, x, x, x, x, "/", x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, "\\", x, x, x, x, x, "\b", x, x, x, "\f", x, x, x, x, x, x, x, "\n", x, x, x, "\r", x, "\t"],

  // these arrays are indexed by the char code of a hex digit, used for \uXXXX escapes
  y = 65536,  // = 0xffff + 1: signals a bad character, since it's out of range
  hexLookup1 = new Uint32Array([y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 0, 4096, 8192, 12288, 16384, 20480, 24576, 28672, 32768, 36864, y, y, y, y, y, y, y, 40960, 45056, 49152, 53248, 57344, 61440, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 40960, 45056, 49152, 53248, 57344, 61440]),
  hexLookup2 = new Uint32Array([y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 0, 256, 512, 768, 1024, 1280, 1536, 1792, 2048, 2304, y, y, y, y, y, y, y, 2560, 2816, 3072, 3328, 3584, 3840, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 2560, 2816, 3072, 3328, 3584, 3840]),
  hexLookup3 = new Uint32Array([y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 0, 16, 32, 48, 64, 80, 96, 112, 128, 144, y, y, y, y, y, y, y, 160, 176, 192, 208, 224, 240, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 160, 176, 192, 208, 224, 240]),
  hexLookup4 = new Uint32Array([y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, y, y, y, y, y, y, y, 10, 11, 12, 13, 14, 15, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 10, 11, 12, 13, 14, 15]);


export function parse(text) {
  let state = 0;
  let value;

  const stateStack = [];
  const valueStack = [];
  let depth = 0;

  let parent;

  let at = 0;
  let ch;

  function error(m) {
    return new JSONParseError(m + "\nAt character " + at + " in JSON: " + text);
  };

  function chDesc(prefix) {
    return ch >= 0 ? "'" + (prefix || '') + String.fromCharCode(ch) + "'" : "end of input";
  }

  do {
    do { ch = text.charCodeAt(at++) } while (ch < 33 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));

    chswitch: switch (ch) {
      case 34 /* " */:
        if (value !== undefined && value !== unfinished) throw error("Unexpected quote");

        value = "";
        for (; ;) {
          stringChunkRegExp.lastIndex = at;  // find next chunk without \ or " or invalid chars
          stringChunkRegExp.test(text);

          const lastIndex = stringChunkRegExp.lastIndex;
          if (lastIndex > at) {
            value += text.slice(at, lastIndex);
            at = lastIndex;
          }

          ch = text.charCodeAt(at++);  // what comes after it?
          switch (ch) {
            case 34 /* " */:  // end of string
              break chswitch;

            case 92 /* \ */:  // backslash escape
              ch = text.charCodeAt(at++);
              if (ch === 117 /* u */) {  // Unicode \uXXXX escape
                const charCode =
                  hexLookup1[text.charCodeAt(at++)] + hexLookup2[text.charCodeAt(at++)] +
                  hexLookup3[text.charCodeAt(at++)] + hexLookup4[text.charCodeAt(at++)];

                if (charCode < 65536) {  // (NaN also fails this test)
                  value += String.fromCharCode(charCode);
                  continue;
                }
                throw error("Invalid \\uXXXX escape in string");
              }

              const esc = escapes[ch];  // single-character escape
              if (esc) {
                value += esc;
                continue;
              }
              throw error("Invalid escape sequence " + chDesc("\\") + " in string");
          }

          // something is wrong
          if (isNaN(ch)) throw error("Unterminated string");

          const invalidChDesc = ch === 10 ? "newline" : ch === 9 ? "tab" : "control character";
          const hexRep = ch.toString(16);
          const paddedHexRep = "0000".slice(hexRep.length) + hexRep;
          throw error("Invalid unescaped " + invalidChDesc + " (\\u" + paddedHexRep + ") in string");
        }

      case 44 /* , */:
        if (value === undefined || value === unfinished) throw error("Unexpected comma (expecting value)");

        if (state === 58 /* : */) {
          parent[valueStack[--depth]] = value;
          state = stateStack[depth];
          value = unfinished;
          break;
        }

        if (state === 91 /* [ */) {
          parent.push(value);
          value = unfinished;
          break;
        }

        throw error("Unexpected comma");

      case 58 /* : */:
        if (state !== 123 /* { */) throw error("Unexpected colon");
        if (typeof value !== 'string') throw error("Object key must be a string");

        stateStack[depth] = state;
        valueStack[depth++] = value;
        state = ch;
        value = unfinished;
        break;

      case 123 /* { */:
        if (value !== undefined && value !== unfinished) throw error("Unexpected opening brace");

        stateStack[depth] = state;
        valueStack[depth++] = parent;
        parent = {};
        value = undefined;
        state = ch;
        break;

      case 125 /* } */:
        if (value === unfinished) throw error("Unexpected closing brace after comma or colon");

        if (state === 58 /* : */) {
          parent[valueStack[--depth]] = value;
          state = stateStack[depth];
          value = undefined;
        }

        if (value !== undefined) throw error("Unexpected closing brace after object key");

        value = parent;
        parent = valueStack[--depth];
        state = stateStack[depth];
        break;

      case 91 /* [ */:
        if (value !== undefined && value !== unfinished) throw error("Unexpected opening square bracket");

        stateStack[depth] = state;
        valueStack[depth++] = parent;
        parent = [];
        value = undefined;
        state = ch;
        break;

      case 93 /* ] */:
        if (state !== 91 /* [ */) throw error("Unexpected closing square bracket");
        if (value === unfinished) throw error("Unexpected closing square bracket after comma");

        if (value !== undefined) parent.push(value);

        value = parent;
        parent = valueStack[--depth];
        state = stateStack[depth];
        break;

      default:
        if (value !== undefined && value !== unfinished) throw error("Unexpected value");

        const startAt = at - 1;  // the first digit/letter was already consumed, so go back 1
        wordRegExp.lastIndex = startAt;
        const matched = wordRegExp.test(text);
        if (!matched) throw error("Unexpected character or end of input");
        at = wordRegExp.lastIndex;

        if (ch < 102 /* f */) {  // has to be a number
          const str = text.slice(startAt, at);
          // val = numericReviverFn ? numericReviverFn(str) : +str;
          value = +str;

        } else {  // must be null/true/false
          value = ch === 110 /* n */ ? null : ch === 116 /* t */;
        }

    }
  } while (depth !== 0);

  do { ch = text.charCodeAt(at++) } while (ch < 33 && (ch === 32 || ch === 10 || ch === 13 || ch === 9));
  if (!isNaN(ch)) throw error("Unexpected trailing data after JSON value");

  return value;
}
