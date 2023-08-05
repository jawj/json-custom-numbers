const escapableTest = /["\\\u0000-\u001f]/, hasOwn = Object.prototype.hasOwnProperty;
export function stringify(value, replacer, space, numRep) {
  let repFunc;
  let repArray;
  if (replacer !== void 0) {
    if (typeof replacer === "function")
      repFunc = replacer;
    else if (Array.isArray(replacer))
      repArray = replacer;
  }
  if (space !== void 0) {
    space = // 10-char limit: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_space_parameter
    typeof space === "string" ? space.slice(0, 10) : typeof space === "number" ? "          ".slice(0, space) : void 0;
  }
  let key, container = { "": value }, index = 0, keys = [""], isFirstKeyValue = true, length = 1, stack = [], depth = 0, json = "", indent = "\n", appendStr;
  do {
    if (index === length) {
      if (space !== void 0) {
        indent = stack[--depth];
        json += indent;
      }
      json += keys === void 0 ? "]" : "}";
      length = stack[--depth];
      isFirstKeyValue = stack[--depth];
      keys = stack[--depth];
      index = stack[--depth];
      container = stack[--depth];
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
    if (numRep === void 0 || (appendStr = numRep(key, value, typeofValue)) === void 0) {
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
        if (isFirstKeyValue)
          isFirstKeyValue = false;
        else
          json += ",";
        if (depth > 0) {
          json += space === void 0 ? (escapableTest.test(key) ? JSON.stringify(key) : '"' + key + '"') + ":" : indent + (escapableTest.test(key) ? JSON.stringify(key) : '"' + key + '"') + ": ";
        }
        json += appendStr;
      }
    }
    index++;
    if (newLength === void 0)
      continue;
    stack[depth++] = container;
    stack[depth++] = index;
    stack[depth++] = keys;
    stack[depth++] = isFirstKeyValue;
    stack[depth++] = length;
    if (space !== void 0) {
      stack[depth++] = indent;
      indent += space;
    }
    container = value;
    index = 0;
    keys = newKeys;
    isFirstKeyValue = true;
    length = newLength;
  } while (depth !== 0);
  return json || void 0;
}
export function stringifyBasic(value) {
  let key;
  let container = { "": value };
  let index = 0;
  let keys = [""];
  let length = 1;
  let stack = [];
  let depth = 0;
  let json = "";
  let appendStr;
  do {
    if (index === length) {
      json += keys ? "}" : "]";
      length = stack[--depth];
      keys = stack[--depth];
      index = stack[--depth];
      container = stack[--depth];
      continue;
    }
    let newKeys, newLength;
    value = keys ? container[key = keys[index]] : container[index];
    let typeofValue = typeof value;
    if (value && typeofValue === "object" && typeof value.toJSON === "function") {
      value = value.toJSON(key);
      typeofValue = typeof value;
    }
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
        const objKeys = Object.keys(value);
        const objLength = objKeys.length;
        if (objLength === 0)
          appendStr = "{}";
        else {
          appendStr = "{";
          newKeys = objKeys;
          newLength = objLength;
        }
        break;
      default:
        appendStr = void 0;
    }
    if (keys) {
      if (appendStr !== void 0) {
        if (index > 0)
          json += ",";
        if (depth > 0)
          json += (escapableTest.test(key) ? JSON.stringify(key) : '"' + key + '"') + ":";
        json += appendStr;
      }
    } else {
      if (index > 0)
        json += ",";
      json += appendStr === void 0 ? "null" : appendStr;
    }
    index++;
    if (newLength === void 0)
      continue;
    stack[depth++] = container;
    stack[depth++] = index;
    stack[depth++] = keys;
    stack[depth++] = length;
    container = value;
    index = 0;
    keys = newKeys;
    length = newLength;
  } while (depth !== 0);
  return json;
}
