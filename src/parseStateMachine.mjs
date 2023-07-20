"use strict";
export class JSONParseError extends Error {
}
const stateDescs = [
  "JSON value",
  "end of input",
  "first key in object",
  "key in object",
  "':'",
  "value in object",
  "',' or '}' in object",
  "first value in array",
  "value in array",
  "',' or ']' in array"
], stringChunkRegExp = /[^"\\\u0000-\u001f]*/y, wordRegExp = /-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y, x = "", escapes = [x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, '"', x, x, x, x, x, x, x, x, x, x, x, x, "/", x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, "\\", x, x, x, x, x, "\b", x, x, x, "\f", x, x, x, x, x, x, x, "\n", x, x, x, "\r", x, "	"], noKey = "", noContainer = [], y = 65536, hexLookup1 = new Uint32Array([y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 0, 4096, 8192, 12288, 16384, 20480, 24576, 28672, 32768, 36864, y, y, y, y, y, y, y, 40960, 45056, 49152, 53248, 57344, 61440, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 40960, 45056, 49152, 53248, 57344, 61440]), hexLookup2 = new Uint32Array([y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 0, 256, 512, 768, 1024, 1280, 1536, 1792, 2048, 2304, y, y, y, y, y, y, y, 2560, 2816, 3072, 3328, 3584, 3840, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 2560, 2816, 3072, 3328, 3584, 3840]), hexLookup3 = new Uint32Array([y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 0, 16, 32, 48, 64, 80, 96, 112, 128, 144, y, y, y, y, y, y, y, 160, 176, 192, 208, 224, 240, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 160, 176, 192, 208, 224, 240]), hexLookup4 = new Uint32Array([y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, y, y, y, y, y, y, y, 10, 11, 12, 13, 14, 15, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, y, 10, 11, 12, 13, 14, 15]);
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
export function parse(text) {
  const containerStack = [], keyStack = [], stateStack = [];
  let at = 0, ch, state = 0, depth = 0, container, key, value;
  function error(m) {
    return new JSONParseError(`${m}
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
              container[container.length] = value;
              state = 8;
              continue;
            default:
              throw error(`Unexpected ',', expecting ${stateDescs[state]}`);
          }
        case 58:
          switch (state) {
            case 4:
              state = 5;
              continue;
            default:
              throw error(`Unexpected ':', expecting ${stateDescs[state]}`);
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
                  throw error(`Invalid escape sequence in string: ${chDesc(ch, "\\")}`);
              }
              if (!(ch >= 0))
                throw error("Unterminated string");
              throw error(`Invalid unescaped ${chDesc(ch)} in string`);
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
              throw error(`Unexpected '"', expecting ${stateDescs[state]}`);
          }
        case 123:
          switch (state) {
            case 5:
              stateStack[depth] = 6;
              containerStack[depth] = container;
              keyStack[depth++] = key;
              container = {};
              state = 2;
              continue;
            case 8:
            case 7:
              stateStack[depth] = 9;
              containerStack[depth] = container;
              keyStack[depth++] = noKey;
              container = {};
              state = 2;
              continue;
            case 0:
              stateStack[depth] = 1;
              containerStack[depth] = noContainer;
              keyStack[depth++] = noKey;
              container = {};
              state = 2;
              continue;
            default:
              throw error(`Unexpected '{', expecting ${stateDescs[state]}`);
          }
        case 125:
          switch (state) {
            case 6:
              container[key] = value;
            case 2:
              value = container;
              container = containerStack[--depth];
              key = keyStack[depth];
              state = stateStack[depth];
              continue;
            default:
              throw error(`Unexpected '}', expecting ${stateDescs[state]}`);
          }
        case 91:
          switch (state) {
            case 5:
              stateStack[depth] = 6;
              containerStack[depth] = container;
              keyStack[depth++] = key;
              container = [];
              state = 7;
              continue;
            case 8:
            case 7:
              stateStack[depth] = 9;
              containerStack[depth] = container;
              keyStack[depth++] = noKey;
              container = [];
              state = 7;
              continue;
            case 0:
              stateStack[depth] = 1;
              containerStack[depth] = noContainer;
              keyStack[depth++] = noKey;
              container = [];
              state = 7;
              continue;
            default:
              throw error(`Unexpected '[', expecting ${stateDescs[state]}`);
          }
        case 93:
          switch (state) {
            case 9:
              container[container.length] = value;
            case 7:
              value = container;
              container = containerStack[--depth];
              key = keyStack[depth];
              state = stateStack[depth];
              continue;
            default:
              throw error(`Unexpected ']', expecting ${stateDescs[state]}`);
          }
        default:
          const startAt = at - 1;
          wordRegExp.lastIndex = startAt;
          const matched = wordRegExp.test(text);
          if (!matched) {
            if (!(ch >= 0))
              break parseloop;
            throw error(`Unexpected ${chDesc(ch)}, expecting ${stateDescs[state]}`);
          }
          at = wordRegExp.lastIndex;
          if (ch < 102) {
            const str = text.slice(startAt, at);
            value = +str;
          } else {
            value = ch === 110 ? null : ch === 116;
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
              throw error(`Unexpected '${value}', expecting ${stateDescs[state]}`);
          }
      }
    }
  if (state !== 1)
    throw error(`Unexpected end of input, expecting ${stateDescs[state]}`);
  return value;
}