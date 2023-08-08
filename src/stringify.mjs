"use strict";
/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive JSON stringifier that's intended to
 * precisely match native `JSON.stringify` behaviour but also allow for custom
 * stringifying of numbers.
 */
const escapableTest = /["\\\u0000-\u001f]/, hasOwn = Object.prototype.hasOwnProperty;
export function stringify(value, replacer, space, customSerializer, maxDepth = 5e4) {
  let repFunc;
  let repArray;
  if (replacer !== void 0) {
    if (typeof replacer === "function")
      repFunc = replacer;
    else if (Array.isArray(replacer))
      repArray = replacer.map((x) => String(x));
  }
  if (space !== void 0) {
    space = typeof space === "string" ? space.slice(0, 10) : typeof space === "number" ? "          ".slice(0, space) : void 0;
  }
  const maxStackPtr = maxDepth * (space === void 0 ? 5 : 6);
  let key, container = { "": value }, index = 0, keys = [""], subsequentKeyValue = false, length = 1, stack = [], stackPtr = 0, json = "", indent = "\n", appendStr, seen = /* @__PURE__ */ new Set([]);
  do {
    if (index === length) {
      seen.delete(container);
      if (space !== void 0) {
        indent = stack[--stackPtr];
        json += indent;
      }
      json += keys === void 0 ? "]" : "}";
      length = stack[--stackPtr];
      subsequentKeyValue = stack[--stackPtr];
      keys = stack[--stackPtr];
      index = stack[--stackPtr];
      container = stack[--stackPtr];
      continue;
    }
    let newKeys, newLength;
    if (keys === void 0) {
      key = String(index);
      value = container[index];
    } else {
      key = keys[index];
      value = container[key];
    }
    let typeofValue = typeof value;
    if (value && typeofValue === "object" && typeof value.toJSON === "function") {
      value = value.toJSON(key);
      typeofValue = typeof value;
    }
    if (repFunc !== void 0) {
      value = repFunc.call(container, key, value);
      typeofValue = typeof value;
    }
    if (customSerializer === void 0 || (appendStr = customSerializer(key, value, typeofValue)) === void 0) {
      switch (typeofValue) {
        case "string":
          appendStr = escapableTest.test(value) ? JSON.stringify(value) : '"' + value + '"';
          break;
        case "number":
          appendStr = isFinite(value) ? String(value) : "null";
          break;
        case "boolean":
          appendStr = value === true ? "true" : "false";
          break;
        case "object":
          if (value === null) {
            appendStr = "null";
            break;
          }
          if (Array.isArray(value)) {
            const arrLength = value.length;
            if (arrLength === 0)
              appendStr = "[]";
            else {
              appendStr = "[";
              newKeys = void 0;
              newLength = arrLength;
            }
            break;
          }
          const objKeys = repArray === void 0 ? Object.keys(value) : repArray.filter((k) => hasOwn.call(value, k));
          const objLength = objKeys.length;
          if (objLength === 0)
            appendStr = "{}";
          else {
            appendStr = "{";
            newKeys = objKeys;
            newLength = objLength;
          }
          break;
        case "bigint":
          throw new TypeError("Do not know how to serialize a BigInt");
        default:
          appendStr = void 0;
      }
    }
    if (keys === void 0) {
      if (index > 0)
        json += ",";
      if (space !== void 0)
        json += indent;
      json += appendStr === void 0 ? "null" : appendStr;
    } else {
      if (appendStr !== void 0) {
        if (subsequentKeyValue)
          json += ",";
        else
          subsequentKeyValue = true;
        if (stackPtr > 0) {
          json += space === void 0 ? (escapableTest.test(key) ? JSON.stringify(key) : '"' + key + '"') + ":" : indent + (escapableTest.test(key) ? JSON.stringify(key) : '"' + key + '"') + ": ";
        }
        json += appendStr;
      }
    }
    index++;
    if (newLength === void 0)
      continue;
    stack[stackPtr++] = container;
    stack[stackPtr++] = index;
    stack[stackPtr++] = keys;
    stack[stackPtr++] = subsequentKeyValue;
    stack[stackPtr++] = length;
    if (space !== void 0) {
      stack[stackPtr++] = indent;
      indent += space;
    }
    container = value;
    index = 0;
    keys = newKeys;
    subsequentKeyValue = false;
    length = newLength;
    if (stackPtr > maxStackPtr)
      throw new RangeError(`Maximum nesting depth exceeded (current maximum is ${maxDepth})`);
    if (seen.has(container))
      throw new TypeError("Cannot stringify circular structure");
    seen.add(container);
  } while (stackPtr !== 0);
  return json || void 0;
}
