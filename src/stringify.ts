/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @licence MIT
 * 
 * This file implements a non-recursive JSON stringifier that's intended to
 * precisely match native `JSON.stringify` behaviour but also allow for custom
 * stringifying of numbers.
 */

"use strict";

const
  escapableTest = /["\\\u0000-\u001f]/,
  hasOwn = Object.prototype.hasOwnProperty;

export function stringify(
  value: any,
  replacer?: (string | number)[] | ((key: string, value: any) => any),
  space?: number | string,
  numRep?: (key: string, value: any, typeofValue: string) => string,
) {

  let repFunc: ((key: string, value: any) => any) | undefined;
  let repArray: (string | number)[] | undefined;
  if (replacer !== undefined) {
    if (typeof replacer === 'function') repFunc = replacer;
    else if (Array.isArray(replacer)) repArray = replacer;
  }

  if (space !== undefined) {
    // 10-char limit: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_space_parameter
    space = typeof space === 'string' ? space.slice(0, 10) :
      typeof space === 'number' ? '          '.slice(0, space) :
        undefined;
  }

  let
    key,

    container: any = { '': value },
    index = 0,
    keys = [''] as string[] | undefined,
    notFirstKeyValue = false,
    length = 1,

    stack: any = [],
    depth = 0,

    json = '',
    indent = '\n',
    appendStr;

  do {  // loop over the current container (object or array)

    if (index === length) {
      // we're at the end of a container: pop values from stack, emit closing symbol, skip to next iteration
      if (space !== undefined) {
        indent = stack[--depth];  // closing symbol is at previous level of indentation
        json += indent;
      }

      json += keys === undefined ? ']' : '}';  // (using the _old_ value of keys)

      length = stack[--depth];
      notFirstKeyValue = stack[--depth];
      keys = stack[--depth];
      index = stack[--depth];
      container = stack[--depth];

      continue;
    }

    // OK, so we're mid-container: deal with a new value
    let newKeys, newLength;

    if (keys === undefined) {
      key = String(index);
      value = container[index];

    } else {
      key = keys[index];
      value = container[key];
    }

    let typeofValue = typeof value;

    if (value && typeofValue === 'object' && typeof value.toJSON === 'function') {
      value = value.toJSON(key);
      typeofValue = typeof value;
    }

    if (repFunc !== undefined) {
      value = repFunc.call(container, key, value);
      typeofValue = typeof value;
    }

    if (numRep === undefined || (appendStr = numRep(key, value, typeofValue)) === undefined) {

      switch (typeofValue) {
        case 'string':
          appendStr = escapableTest.test(value) ? JSON.stringify(value) : '"' + value + '"';
          break;

        case 'number':
          appendStr = isFinite(value) ? String(value) : 'null';
          break;

        case 'boolean':
          appendStr = value === true ? 'true' : 'false';
          break;

        case 'object':
          if (value === null) {
            appendStr = 'null';
            break;
          }

          if (Array.isArray(value)) {
            const arrLength = value.length;
            if (arrLength === 0) appendStr = '[]';
            else {
              appendStr = '[';
              newKeys = undefined;
              newLength = arrLength;
            }
            break;
          }

          const objKeys = repArray === undefined ?
            Object.keys(value) :
            repArray.filter(k => hasOwn.call(value, k));

          const objLength = objKeys.length;
          if (objLength === 0) appendStr = '{}';
          else {
            appendStr = '{';
            newKeys = objKeys;
            newLength = objLength;
          }
          break;

        case 'bigint':
          throw new TypeError('Do not know how to serialize a BigInt');

        default:
          appendStr = undefined;
      }
    }

    // append comma, key and value (as appropriate)
    if (keys === undefined) {
      // we're in an array
      if (index > 0) json += ',';  // no values can be omitted via the replacer in an array, so this is safe

      if (space !== undefined) json += indent;
      json += appendStr === undefined ? 'null' : appendStr;

    } else {
      // we're in an object
      if (appendStr !== undefined) {
        if (notFirstKeyValue) json += ',';
        else notFirstKeyValue = true;

        if (depth > 0) {
          json += space === undefined ?
            (escapableTest.test(key) ? JSON.stringify(key) : '"' + key + '"') + ':' :
            indent + (escapableTest.test(key) ? JSON.stringify(key) : '"' + key + '"') + ': ';
        }
        json += appendStr;
      }
    }

    index++;

    // new value is simple: skip to next iteration
    if (newLength === undefined) continue;

    // new value is object or array: update stack and values
    stack[depth++] = container;
    stack[depth++] = index;
    stack[depth++] = keys;
    stack[depth++] = notFirstKeyValue;
    stack[depth++] = length;

    if (space !== undefined) {
      stack[depth++] = indent;
      indent += space;
    }

    container = value;
    index = 0;
    keys = newKeys;
    notFirstKeyValue = false;
    length = newLength;

  } while (depth !== 0);

  // JSON.stringify returns undefined when the replacer function replaces a simple value with undefined, hence:
  return json || undefined;
}
