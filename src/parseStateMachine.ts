"use strict";

export class JSONParseError extends Error { }

const
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

interface StackRecord {
  state: number;
  container: Record<string, any> | any[] | undefined;
  key: string | undefined;
}

export function parse(text: string) {
  let at = 0;       // character index into text
  let ch: number;   // current character code
  let state = go;   // the state of the parser
  const stack: StackRecord[] = []; // the stack, for controlling nesting -- state, container, key
  let depth = 0;    // the stack pointer
  let container;    // the current container object or array
  let key;          // the current key
  let value;        // the current value

  function error(m: string) {
    return new JSONParseError(m + "\nAt character " + at + " in JSON: " + text);
  };

  function chDesc(prefix: string) {
    return ch >= 0 ? "'" + (prefix || '') + String.fromCharCode(ch) + "'" : "end of input";
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
            (container as any[]).push(value);
            state = avalue;
            continue;
          default:
            throw error('Unexpected comma');
        }

      case colon:
        switch (state) {
          case ocolon:
            state = ovalue;
            continue;
          default:
            throw error('Unexpected colon');
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

            case backslash:  // backslash escape
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
              throw error("Invalid escape sequence " + chDesc("\\") + " in string");
          }

          // something is wrong
          if (isNaN(ch)) throw error('Unterminated string');

          const invalidChDesc = ch === newline ? "newline" : ch === tab ? "tab" : "control character";
          const hexRep = ch.toString(16);
          const paddedHexRep = "0000".slice(hexRep.length) + hexRep;
          throw error("Invalid unescaped " + invalidChDesc + " (\\u" + paddedHexRep + ") in string");
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
            throw error('Unexpected quote');
        }

      case openbrace:
        switch (state) {
          case ovalue:
            stack[depth++] = { state: ocomma, container, key };
            container = {};
            state = firstokey;
            continue;
          case avalue:
          case firstavalue:
            stack[depth++] = { state: acomma, container, key: undefined };
            container = {};
            state = firstokey;
            continue;
          case go:
            stack[depth++] = { state: ok, container: undefined, key: undefined };
            container = {};
            state = firstokey;
            continue;
          default:
            throw error('Unexpected opening brace');
        }

      case closebrace:
        switch (state) {
          case ocomma:
            (container as Record<string, any>)[key!] = value;
          // deliberate fallthrough
          case firstokey:
            const prev = stack[--depth];
            value = container;
            container = prev.container;
            key = prev.key;
            state = prev.state;
            continue;
          default:
            throw error('Unexpected closing brace');
        }

      case opensquare:
        switch (state) {
          case go:
            stack[depth++] = { state: ok, container: undefined, key: undefined };
            container = [];
            state = firstavalue;
            continue;
          case ovalue:
            stack[depth++] = { state: ocomma, container, key };
            container = [];
            state = firstavalue;
            continue;
          case firstavalue:
          case avalue:
            stack[depth++] = { state: acomma, container, key: undefined };
            container = [];
            state = firstavalue;
            continue;
          default:
            throw error('Unexpected opening square bracket');
        }

      case closesquare:
        switch (state) {
          case acomma:
            (container as any[]).push(value);
          // deliberate fall-through
          case firstavalue:
            const prev = stack[--depth];
            value = container;
            container = prev.container;
            key = prev.key;
            state = prev.state;
            continue;
          default:
            throw error('Unexpected closing square bracket');
        }

      default:  // numbers, true, false, null
        if (!(ch >= 0)) break parseloop;

        const startAt = at - 1;  // the first digit/letter was already consumed, so go back 1

        wordRegExp.lastIndex = startAt;
        const matched = wordRegExp.test(text);
        if (!matched) throw error('Unexpected character or end of input');

        at = wordRegExp.lastIndex;

        if (ch < f) {  // has to be a number
          const str = text.slice(startAt, at);
          // val = numericReviverFn ? numericReviverFn(str) : +str;
          value = +str;

        } else {  // must be null/true/false
          value = ch === n ? null : ch === t;
        }

        switch (state) {
          case ovalue:
            state = ocomma;
            continue;
          case firstavalue:
          case avalue:
            state = acomma;
            continue;
          case go:
            state = ok;
            continue;
          default:
            throw error('Unexpected value');
        }
    }
  }
  if (state !== ok) throw error('Unexpected end of input');
  return value;
}
