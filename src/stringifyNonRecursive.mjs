const escapableTest = /["\\\u0000-\u001f]/;
export function stringify(value) {
  let key;
  let json = "";
  let container = { "": value };
  let keys = [""];
  let length = 1;
  let index = 0;
  let containerStack = [];
  let indexStack = [];
  let lengthStack = [];
  let keysStack = [];
  let depth = 0;
  let appendStr;
  do {
    if (index === length) {
      json += keys ? "}" : "]";
      container = containerStack[--depth];
      index = indexStack[depth];
      keys = keysStack[depth];
      length = lengthStack[depth];
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
    if (newLength === void 0) {
      index++;
      continue;
    }
    containerStack[depth] = container;
    indexStack[depth] = index + 1;
    keysStack[depth] = keys;
    lengthStack[depth++] = length;
    container = value;
    length = newLength;
    keys = newKeys;
    index = 0;
  } while (depth !== 0);
  return json;
}
