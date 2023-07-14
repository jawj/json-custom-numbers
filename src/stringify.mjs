"use strict";

const escapableTest = /["\\\u0000-\u001f]/;
const escapableReplace = /["\\\u0000-\u001f]/g;
const hasOwnProp = Object.prototype.hasOwnProperty;

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

// this version supports indentation and the replacer function
function strComplete(key, holder) {  // produce a string from holder[key]
  let mind = gap;
  let value = holder[key];

  if (value && typeof value === "object" && typeof value.toJSON === "function") value = value.toJSON(key);
  if (repIsFunc) value = rep.call(holder, key, value);

  const typeofValue = typeof value;
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
        for (let i = 0; i < length; i++) partial[i] = strComplete(i, value) || "null";
        const v = length === 0 ? "[]" : gap ?
          "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" :
          "[" + partial.join(",") + "]";

        gap = mind;
        return v;
      }

      let j = 0;
      if (repIsArr) {  // if the replacer is an array, use it to select the members to be stringified
        const length = rep.length;
        for (let i = 0; i < length; i++) {
          const k = rep[i];
          if (typeof k === "string") {
            const v = strComplete(k, value);
            if (v) partial[j++] = quote(k) + (gap ? ": " : ":") + v;
          }
        }

      } else {  // otherwise, iterate through all the keys in the object
        for (const k in value) {
          if (hasOwnProp.call(value, k)) {
            const v = strComplete(k, value);
            if (v) partial[j++] = quote(k) + (gap ? ": " : ":") + v;
          }
        }
      }

      const v = j === 0 ? "{}" : gap ?
        "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" :
        "{" + partial.join(",") + "}";

      gap = mind;
      return v;

    case "number":
      return isFinite(value) ? String(value) : "null";

    default:
      if (numRep) return numRep(value);
  }
}

// this version is faster where there's no indentation and no replacer
function strQuick(key, holder) {  // produce a string from holder[key]
  let value = holder[key];
  if (value && typeof value === "object" && typeof value.toJSON === "function") value = value.toJSON(key);

  const typeofValue = typeof value;
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
        for (let i = 0; i < length; i++) partial[i] = strQuick(i, value) || "null";
        const v = "[" + partial.join(",") + "]";
        return v;
      }

      let j = 0;
      for (const k in value) {
        if (hasOwnProp.call(value, k)) {
          const v = strQuick(k, value);
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

export function stringify(value, replacer, space, numericReplacer) {
  gap = "";
  indent = "";

  if (typeof space === "number") for (let i = 0; i < space; i++) indent += " ";
  else if (typeof space === "string") indent = space;

  rep = replacer;
  repIsFunc = typeof rep === "function";
  repIsArr = Array.isArray(rep);
  if (rep && !repIsFunc && !repIsArr) throw new Error("Replacer must be function, array, or undefined");

  numRep = numericReplacer;

  return rep || indent ?
    strComplete("", { "": value }) :
    strQuick("", { "": value });
};
