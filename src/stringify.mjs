"use strict";

const escapableTest = /["\\\u0000-\u001f]/;
const escapableReplace = /["\\\u0000-\u001f]/g;

let
  gap,
  indent,
  rep,
  repIsFunc,
  repIsArr,
  numRep;

const escapes = ['\\u0000', '\\u0001', '\\u0002', '\\u0003', '\\u0004', '\\u0005', '\\u0006', '\\u0007', '\\b', '\\t', '\\n', '\\u000b', '\\f', '\\r', '\\u000e', '\\u000f', '\\u0010', '\\u0011', '\\u0012', '\\u0013', '\\u0014', '\\u0015', '\\u0016', '\\u0017', '\\u0018', '\\u0019', '\\u001a', '\\u001b', '\\u001c', '\\u001d', '\\u001e', '\\u001f', ' ', ' ', '\\"', ' ', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '\\\\'];

function escapeReplace(s) {
  return escapes[s.codePointAt(0)];
}

function quote(s) {
  // test is much quicker than replace, so this saves time if most strings need no escaping
  return escapableTest.test(s) ?
    '"' + s.replace(escapableReplace, escapeReplace) + '"' :
    '"' + s + '"';
}

function strFuncRepNoIndent(key, holder) {  // produce a string from holder[key]
  let value = holder[key];
  let typeofValue = typeof value;
  if (value && typeofValue === "object" && typeof value.toJSON === "function") value = value.toJSON(key);

  value = rep.call(holder, key, value);
  typeofValue = typeof value;

  switch (typeofValue) {
    case "string":
      return quote(value);

    case "boolean":
      return String(value);

    case "object":
      if (!value) return "null";

      const partial = [];

      if (Array.isArray(value)) {
        const length = value.length;
        for (let i = 0; i < length; i++) partial[i] = strFuncRepNoIndent(i, value) || "null";
        const v = "[" + partial.join(",") + "]";
        return v;
      }

      let j = 0;
      const keys = Object.keys(value);
      const length = keys.length;
      for (let i = 0; i < length; i++) {
        const k = keys[i];
        const v = strFuncRepNoIndent(k, value);
        if (v) partial[j++] = quote(k) + ":" + v;
      }
      const v = "{" + partial.join(",") + "}";
      return v;

    case "number":
      return isFinite(value) ? String(value) : "null";

    default:
      if (numRep) return numRep(value);
  }
}

function strFuncRepIndent(key, holder) {  // produce a string from holder[key]
  let mind = gap;

  let value = holder[key];
  let typeofValue = typeof value;
  if (value && typeofValue === "object" && typeof value.toJSON === "function") value = value.toJSON(key);

  value = rep.call(holder, key, value);
  typeofValue = typeof value;

  switch (typeofValue) {
    case "string":
      return quote(value);

    case "boolean":
      return String(value);

    case "object":
      if (!value) return "null";

      gap += indent;
      const partial = [];

      if (Array.isArray(value)) {
        const length = value.length;
        for (let i = 0; i < length; i++) partial[i] = strFuncRepIndent(i, value) || "null";
        const v = length === 0 ? "[]" :
          "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]";

        gap = mind;
        return v;
      }

      let j = 0;
      const keys = Object.keys(value);
      const length = keys.length;
      for (let i = 0; i < length; i++) {
        const k = keys[i];
        const v = strFuncRepIndent(k, value);
        if (v) partial[j++] = quote(k) + ": " + v;
      }

      const v = j === 0 ? "{}" :
        "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}";

      gap = mind;
      return v;

    case "number":
      return isFinite(value) ? String(value) : "null";

    default:
      if (numRep) return numRep(value);
  }
}

function strArrRepNoIndent(key, holder) {  // produce a string from holder[key]
  let value = holder[key];
  let typeofValue = typeof value;
  if (value && typeofValue === "object" && typeof value.toJSON === "function") {
    value = value.toJSON(key);
    typeofValue = typeof value;
  }

  switch (typeofValue) {
    case "string":
      return quote(value);

    case "boolean":
      return String(value);

    case "object":
      if (!value) return "null";

      const partial = [];

      if (Array.isArray(value)) {
        const length = value.length;
        for (let i = 0; i < length; i++) partial[i] = strArrRepNoIndent(i, value) || "null";
        const v = "[" + partial.join(",") + "]";
        return v;
      }

      let j = 0;
      const length = rep.length;
      for (let i = 0; i < length; i++) {
        const k = rep[i];
        if (typeof k === "string") {
          const v = strArrRepNoIndent(k, value);
          if (v) partial[j++] = quote(k) + ":" + v;
        }
      }
      const v = "{" + partial.join(",") + "}";
      return v;

    case "number":
      return isFinite(value) ? String(value) : "null";

    default:
      if (numRep) return numRep(value);
  }
}

function strArrRepIndent(key, holder) {  // produce a string from holder[key]
  let mind = gap;

  let value = holder[key];
  let typeofValue = typeof value;
  if (value && typeofValue === "object" && typeof value.toJSON === "function") {
    value = value.toJSON(key);
    typeofValue = typeof value;
  }

  switch (typeofValue) {
    case "string":
      return quote(value);

    case "boolean":
      return String(value);

    case "object":
      if (!value) return "null";

      gap += indent;
      const partial = [];

      if (Array.isArray(value)) {
        const length = value.length;
        for (let i = 0; i < length; i++) partial[i] = strArrRepIndent(i, value) || "null";
        const v = length === 0 ? "[]" :
          "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]";

        gap = mind;
        return v;
      }

      let j = 0;
      const length = rep.length;
      for (let i = 0; i < length; i++) {
        const k = rep[i];
        if (typeof k === "string") {
          const v = strArrRepIndent(k, value);
          if (v) partial[j++] = quote(k) + ": " + v;
        }
      }

      const v = j === 0 ? "{}" :
        "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}";

      gap = mind;
      return v;

    case "number":
      return isFinite(value) ? String(value) : "null";

    default:
      if (numRep) return numRep(value);
  }
}

function strNoRepNoIndent(key, holder) {  // produce a string from holder[key]
  let value = holder[key];
  let typeofValue = typeof value;
  if (value && typeofValue === "object" && typeof value.toJSON === "function") {
    value = value.toJSON(key);
    typeofValue = typeof value;
  }

  switch (typeofValue) {
    case "string":
      return quote(value);

    case "boolean":
      return String(value);

    case "object":
      if (!value) return "null";

      const partial = [];

      if (Array.isArray(value)) {
        const length = value.length;
        for (let i = 0; i < length; i++) partial[i] = strNoRepNoIndent(i, value) || "null";
        const v = "[" + partial.join(",") + "]";
        return v;
      }

      let j = 0;
      const keys = Object.keys(value);
      const length = keys.length;
      for (let i = 0; i < length; i++) {
        const k = keys[i];
        const v = strNoRepNoIndent(k, value);
        if (v) partial[j++] = quote(k) + ":" + v;
      }
      const v = "{" + partial.join(",") + "}";
      return v;

    case "number":
      return isFinite(value) ? String(value) : "null";

    default:
      if (numRep) return numRep(value);
  }
}

function strNoRepIndent(key, holder) {  // produce a string from holder[key]
  let mind = gap;
  let value = holder[key];
  let typeofValue = typeof value;
  if (value && typeofValue === "object" && typeof value.toJSON === "function") {
    value = value.toJSON(key);
    typeofValue = typeof value;
  }

  switch (typeofValue) {
    case "string":
      return quote(value);

    case "boolean":
      return String(value);

    case "object":
      if (!value) return "null";

      gap += indent;
      const partial = [];

      if (Array.isArray(value)) {
        const length = value.length;
        for (let i = 0; i < length; i++) partial[i] = strNoRepIndent(i, value) || "null";
        const v = length === 0 ? "[]" :
          "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]";

        gap = mind;
        return v;
      }

      let j = 0;
      const keys = Object.keys(value);
      const length = keys.length;
      for (let i = 0; i < length; i++) {
        const k = keys[i];
        const v = strNoRepIndent(k, value);
        if (v) partial[j++] = quote(k) + ": " + v;
      }

      const v = j === 0 ? "{}" :
        "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}";

      gap = mind;
      return v;

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
  repIsFunc = typeof rep === "function";
  repIsArr = Array.isArray(rep);
  if (rep && !repIsFunc && !repIsArr) rep = undefined;

  numRep = numericReplacer;

  return (indent ?
    (rep ? (repIsArr ? strArrRepIndent : strFuncRepIndent) : strNoRepIndent) :
    (rep ? (repIsArr ? strArrRepNoIndent : strFuncRepNoIndent) : strNoRepNoIndent))("", { "": value });
};
