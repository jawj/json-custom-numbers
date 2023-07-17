/*
  2023-07-17 / George MacKerron (mackerron.com)
  Based on https://github.com/douglascrockford/JSON-js/blob/03157639c7a7cddd2e9f032537f346f1a87c0f6d/json2.js
  Public Domain
  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
*/

"use strict";

let gap, indent, rep, numRep;
const escapableTest = /["\\\u0000-\u001f]/;
const bigIntErrMsg = "Do not know how to serialize a BigInt";

// to avoid unneccessary conditionals inside loops, 6 different core functions
// are provided:
// (no indent, indent) x (no replacer, array replacer, function replacer)

function str_funcRep_noIndent(key, holder) {
  let value = holder[key];
  let typeofValue = typeof value;
  if (value && typeofValue === "object" && typeof value.toJSON === "function") value = value.toJSON(key);

  value = rep.call(holder, key, value);
  typeofValue = typeof value;

  let custom;
  if (numRep && (custom = numRep(value, typeofValue)) !== undefined) return custom;

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
          result += str_funcRep_noIndent(i, value) || "null";
        }
        return result + "]";
      }

      let result = "{";
      const keys = Object.keys(value);
      const length = keys.length;
      for (let i = 0; i < length; i++) {
        const k = keys[i];
        const v = str_funcRep_noIndent(k, value);
        if (v) {
          if (i !== 0) result += ",";
          result += (escapableTest.test(k) ? JSON.stringify(k) : '"' + k + '"') + ":" + v;
        }
      }
      return result + "}";

    case "number":
      return isFinite(value) ? String(value) : "null";

    case "bigint":
      throw new TypeError(bigIntErrMsg);
  }
}

function str_funcRep_withIndent(key, holder) {
  let mind = gap;

  let value = holder[key];
  let typeofValue = typeof value;
  if (value && typeofValue === "object" && typeof value.toJSON === "function") value = value.toJSON(key);

  value = rep.call(holder, key, value);
  typeofValue = typeof value;

  let custom;
  if (numRep && (custom = numRep(value, typeofValue)) !== undefined) return custom;

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
          result += str_funcRep_withIndent(i, value) || "null";
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
        const v = str_funcRep_withIndent(k, value);
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

    case "bigint":
      throw new TypeError(bigIntErrMsg);
  }
}

function str_arrRep_noIndent(key, holder) {
  let value = holder[key];
  let typeofValue = typeof value;
  if (value && typeofValue === "object" && typeof value.toJSON === "function") {
    value = value.toJSON(key);
    typeofValue = typeof value;
  }

  let custom;
  if (numRep && (custom = numRep(value, typeofValue)) !== undefined) return custom;

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
          result += str_arrRep_noIndent(i, value) || "null";
        }
        return result + "]";
      }

      let result = "{";
      let resultKeys = false;
      const length = rep.length;
      for (let i = 0; i < length; i++) {
        const k = rep[i];
        const v = str_arrRep_noIndent(k, value);
        if (v) {
          if (resultKeys) result += ",";
          else resultKeys = true;
          result += (escapableTest.test(k) ? JSON.stringify(k) : '"' + k + '"') + ":" + v;
        }
      }
      return result + "}";

    case "number":
      return isFinite(value) ? String(value) : "null";

    case "bigint":
      throw new TypeError(bigIntErrMsg);
  }
}

function str_arrRep_withIndent(key, holder) {
  let mind = gap;

  let value = holder[key];
  let typeofValue = typeof value;
  if (value && typeofValue === "object" && typeof value.toJSON === "function") {
    value = value.toJSON(key);
    typeofValue = typeof value;
  }

  let custom;
  if (numRep && (custom = numRep(value, typeofValue)) !== undefined) return custom;

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
          result += str_arrRep_withIndent(i, value) || "null";
        }
        result += "\n" + mind + "]";
        gap = mind;
        return result;
      }

      let result;
      const length = rep.length;
      for (let i = 0; i < length; i++) {
        const k = rep[i];
        const v = str_arrRep_withIndent(k, value);
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

    case "bigint":
      throw new TypeError(bigIntErrMsg);
  }
}

function str_noRep_noIndent(key, holder) {
  let value = holder[key];
  let typeofValue = typeof value;
  if (value && typeofValue === "object" && typeof value.toJSON === "function") {
    value = value.toJSON(key);
    typeofValue = typeof value;
  }

  let custom;
  if (numRep && (custom = numRep(value, typeofValue)) !== undefined) return custom;

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
          result += str_noRep_noIndent(i, value) || "null";
        }
        return result + "]";
      }

      let result = "{";
      const keys = Object.keys(value);
      const length = keys.length;
      for (let i = 0; i < length; i++) {
        const k = keys[i];
        const v = str_noRep_noIndent(k, value);
        if (v) {
          if (i !== 0) result += ",";
          result += (escapableTest.test(k) ? JSON.stringify(k) : '"' + k + '"') + ":" + v;
        }
      }
      return result + "}";

    case "number":
      return isFinite(value) ? String(value) : "null";

    case "bigint":
      throw new TypeError(bigIntErrMsg);
  }
}

function str_noRep_withIndent(key, holder) {
  let mind = gap;
  let value = holder[key];
  let typeofValue = typeof value;
  if (value && typeofValue === "object" && typeof value.toJSON === "function") {
    value = value.toJSON(key);
    typeofValue = typeof value;
  }

  let custom;
  if (numRep && (custom = numRep(value, typeofValue)) !== undefined) return custom;

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
          result += str_noRep_withIndent(i, value) || "null";
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
        const v = str_noRep_withIndent(k, value);
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

    case "bigint":
      throw new TypeError(bigIntErrMsg);
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
    (rep ? (repIsArr ? str_arrRep_withIndent : str_funcRep_withIndent) : str_noRep_withIndent) :
    (rep ? (repIsArr ? str_arrRep_noIndent : str_funcRep_noIndent) : str_noRep_noIndent))("", { "": value });
};
