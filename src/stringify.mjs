"use strict";

let gap, indent, rep, numRep;
const escapableTest = /["\\\u0000-\u001f]/;

// to avoid unneccessary conditionals inside loops, 6 different core functions
// are provided:
// (no indent, indent) x (no replacer, array replacer, function replacer)

function strFuncRepNoIndent(key, holder) {
  let value = holder[key];
  let typeofValue = typeof value;
  if (value && typeofValue === "object" && typeof value.toJSON === "function") value = value.toJSON(key);

  value = rep.call(holder, key, value);
  typeofValue = typeof value;

  switch (typeofValue) {
    case "string":
      return escapableTest.test(value) ? JSON.stringify(value) : '"' + value + '"';

    case "boolean":
      return value ? "true" : "false";

    case "object":
      if (!value) return "null";

      if (Array.isArray(value)) {
        let result = "[";
        const length = value.length;
        for (let i = 0; i < length; i++) {
          if (i !== 0) result += ",";
          result += strFuncRepNoIndent(i, value) || "null";
        }
        return result + "]";
      }

      let result = "{";
      const keys = Object.keys(value);
      const length = keys.length;
      for (let i = 0; i < length; i++) {
        const k = keys[i];
        const v = strFuncRepNoIndent(k, value);
        if (v) {
          if (i !== 0) result += ",";
          result += (escapableTest.test(k) ? JSON.stringify(k) : '"' + k + '"') + ":" + v;
        }
      }
      return result + "}";

    case "number":
      return isFinite(value) ? String(value) : "null";

    default:
      if (numRep) return numRep(value);
  }
}

function strFuncRepIndent(key, holder) {
  let mind = gap;

  let value = holder[key];
  let typeofValue = typeof value;
  if (value && typeofValue === "object" && typeof value.toJSON === "function") value = value.toJSON(key);

  value = rep.call(holder, key, value);
  typeofValue = typeof value;

  switch (typeofValue) {
    case "string":
      return escapableTest.test(value) ? JSON.stringify(value) : '"' + value + '"';

    case "boolean":
      return value ? "true" : "false";

    case "object":
      if (!value) return "null";

      gap += indent;

      if (Array.isArray(value)) {
        const length = value.length;
        if (length === 0) {
          gap = mind;
          return "[]";
        }
        let result = "[\n" + gap;
        for (let i = 0; i < length; i++) {
          if (i !== 0) result += ",\n" + gap;
          result += strFuncRepIndent(i, value) || "null";
        }
        result += "\n" + mind + "]";
        gap = mind;
        return result;
      }

      const keys = Object.keys(value);
      const length = keys.length;
      if (length === 0) {
        gap = mind;
        return "{}";
      }
      let result = "{\n" + gap;
      for (let i = 0; i < length; i++) {
        const k = keys[i];
        const v = strFuncRepIndent(k, value);
        if (v) {
          if (i !== 0) result += ",\n" + gap;
          result += (escapableTest.test(k) ? JSON.stringify(k) : '"' + k + '"') + ": " + v;
        }
      }
      result += "\n" + mind + "}"
      gap = mind;
      return result;

    case "number":
      return isFinite(value) ? String(value) : "null";

    default:
      if (numRep) return numRep(value);
  }
}

function strArrRepNoIndent(key, holder) {
  let value = holder[key];
  let typeofValue = typeof value;
  if (value && typeofValue === "object" && typeof value.toJSON === "function") {
    value = value.toJSON(key);
    typeofValue = typeof value;
  }

  switch (typeofValue) {
    case "string":
      return escapableTest.test(value) ? JSON.stringify(value) : '"' + value + '"';

    case "boolean":
      return value ? "true" : "false";

    case "object":
      if (!value) return "null";

      if (Array.isArray(value)) {
        let result = "[";
        const length = value.length;
        for (let i = 0; i < length; i++) {
          if (i !== 0) result += ",";
          result += strArrRepNoIndent(i, value) || "null";
        }
        return result + "]";
      }

      let result = "{";
      let resultKeys = false;
      const length = rep.length;
      for (let i = 0; i < length; i++) {
        const k = rep[i];
        const v = strArrRepNoIndent(k, value);
        if (v) {
          if (resultKeys) result += ",";
          else resultKeys = true;
          result += (escapableTest.test(k) ? JSON.stringify(k) : '"' + k + '"') + ":" + v;
        }
      }
      return result + "}";

    case "number":
      return isFinite(value) ? String(value) : "null";

    default:
      if (numRep) return numRep(value);
  }
}

function strArrRepIndent(key, holder) {
  let mind = gap;

  let value = holder[key];
  let typeofValue = typeof value;
  if (value && typeofValue === "object" && typeof value.toJSON === "function") {
    value = value.toJSON(key);
    typeofValue = typeof value;
  }

  switch (typeofValue) {
    case "string":
      return escapableTest.test(value) ? JSON.stringify(value) : '"' + value + '"';

    case "boolean":
      return value ? "true" : "false";

    case "object":
      if (!value) return "null";

      gap += indent;

      if (Array.isArray(value)) {
        const length = value.length;
        if (length === 0) {
          gap = mind;
          return "[]";
        }
        let result = "[\n" + gap;
        for (let i = 0; i < length; i++) {
          if (i !== 0) result += ",\n" + gap;
          result += strArrRepIndent(i, value) || "null";
        }
        result += "\n" + mind + "]";
        gap = mind;
        return result;
      }

      let result;
      const length = rep.length;
      for (let i = 0; i < length; i++) {
        const k = rep[i];
        const v = strArrRepIndent(k, value);
        if (v) {
          if (result) result += ",\n" + gap;
          else result = "{\n" + gap;
          result += (escapableTest.test(k) ? JSON.stringify(k) : '"' + k + '"') + ": " + v;
        }
      }
      if (result) result += "\n" + mind + "}";
      else result = "{}";
      gap = mind;
      return result;

    case "number":
      return isFinite(value) ? String(value) : "null";

    default:
      if (numRep) return numRep(value);
  }
}

function strNoRepNoIndent(key, holder) {
  let value = holder[key];
  let typeofValue = typeof value;
  if (value && typeofValue === "object" && typeof value.toJSON === "function") {
    value = value.toJSON(key);
    typeofValue = typeof value;
  }

  switch (typeofValue) {
    case "string":
      // note: stringifying is much slower than testing, so this helps if many strings don't need it
      return escapableTest.test(value) ? JSON.stringify(value) : '"' + value + '"';

    case "boolean":
      return value ? "true" : "false";

    case "object":
      if (!value) return "null";

      if (Array.isArray(value)) {
        let result = "[";
        const length = value.length;
        for (let i = 0; i < length; i++) {
          if (i !== 0) result += ",";
          result += strNoRepNoIndent(i, value) || "null";
        }
        return result + "]";
      }

      let result = "{";
      const keys = Object.keys(value);
      const length = keys.length;
      for (let i = 0; i < length; i++) {
        const k = keys[i];
        const v = strNoRepNoIndent(k, value);
        if (v) {
          if (i !== 0) result += ",";
          result += (escapableTest.test(k) ? JSON.stringify(k) : '"' + k + '"') + ":" + v;
        }
      }
      return result + "}";

    case "number":
      return isFinite(value) ? String(value) : "null";

    default:
      if (numRep) return numRep(value);
  }
}

function strNoRepIndent(key, holder) {
  let mind = gap;
  let value = holder[key];
  let typeofValue = typeof value;
  if (value && typeofValue === "object" && typeof value.toJSON === "function") {
    value = value.toJSON(key);
    typeofValue = typeof value;
  }

  switch (typeofValue) {
    case "string":
      return escapableTest.test(value) ? JSON.stringify(value) : '"' + value + '"';

    case "boolean":
      return value ? "true" : "false";

    case "object":
      if (!value) return "null";

      gap += indent;

      if (Array.isArray(value)) {
        const length = value.length;
        if (length === 0) {
          gap = mind;
          return "[]";
        }
        let result = "[\n" + gap;
        for (let i = 0; i < length; i++) {
          if (i !== 0) result += ",\n" + gap;
          result += strNoRepIndent(i, value) || "null";
        }
        result += "\n" + mind + "]";
        gap = mind;
        return result;
      }

      const keys = Object.keys(value);
      const length = keys.length;
      if (length === 0) {
        gap = mind;
        return "{}";
      }
      let result = "{\n" + gap;
      for (let i = 0; i < length; i++) {
        const k = keys[i];
        const v = strNoRepIndent(k, value);
        if (v) {
          if (i !== 0) result += ",\n" + gap;
          result += (escapableTest.test(k) ? JSON.stringify(k) : '"' + k + '"') + ": " + v;
        }
      }
      result += "\n" + mind + "}"
      gap = mind;
      return result;

    case "number":
      return isFinite(value) ? String(value) : "null";

    default:
      if (numRep) return numRep(value);
  }
}

export function stringify(value, replacer, space, numericReplacer) {
  gap = "";
  indent = "";

  const typeofSpace = typeof space;
  if (typeofSpace === "number") for (let i = 0; i < space; i++) indent += " ";
  else if (typeofSpace === "string") indent = space;

  rep = replacer;
  const repIsFunc = typeof rep === "function";
  const repIsArr = Array.isArray(rep);
  if (repIsArr) rep = rep.filter(x => typeof x === 'string');
  if (rep && !repIsFunc && !repIsArr) rep = undefined;

  numRep = numericReplacer;

  return (indent ?
    (rep ? (repIsArr ? strArrRepIndent : strFuncRepIndent) : strNoRepIndent) :
    (rep ? (repIsArr ? strArrRepNoIndent : strFuncRepNoIndent) : strNoRepNoIndent))("", { "": value });
};
