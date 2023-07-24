
const escapableTest = /["\\\u0000-\u001f]/;

function stringify(value: any) {
  let key;
  let json = '';

  let container: any = { '': value };
  let keys = [''] as string[] | undefined;
  let length = 1;
  let index = 0;

  let containerStack: (typeof container)[] = [];
  let indexStack: (typeof index)[] = [];
  let keysStack: (typeof keys)[] = [];
  let lengthStack: (typeof length)[] = [];
  let depth = 0;

  do {  // loop over the current container (object or array)
    let
      result,
      newKeys,
      newLength;

    if (index === length) {  // we've reached the end of the container
      result = keys ? '}' : ']';
      container = containerStack[--depth];
      index = indexStack[depth];
      keys = keysStack[depth];
      length = lengthStack[depth];

    } else {
      value = keys ?
        container[key = keys[index]] :
        container[index]

      let typeofValue = typeof value;
      if (value && typeofValue === 'object' && typeof value.toJSON === 'function') {
        value = value.toJSON(key);
        typeofValue = typeof value;
      }

      switch (typeofValue) {
        case 'string':
          result = escapableTest.test(value) ? JSON.stringify(value) : '"' + value + '"';
          break;

        case 'number':
          result = isFinite(value) ? String(value) : 'null';
          break;

        case 'boolean':
          result = value === true ? 'true' : 'false';
          break;

        case 'object':
          if (value === null) {
            result = 'null';
            break;
          }

          if (Array.isArray(value)) {
            const arrLength = value.length;
            if (arrLength === 0) result = '[]';
            else {
              result = '[';
              newKeys = undefined;
              newLength = arrLength;
            }
            break;
          }

          const objKeys = Object.keys(value);
          const objLength = objKeys.length;
          if (objLength === 0) result = '{}';
          else {
            result = '{';
            newKeys = objKeys;
            newLength = objLength;
          }
      }
    }

    if (keys) {  // we're mid-object
      if (result !== undefined) {
        if (index > 0) json += ',';
        if (depth > 0) json += (escapableTest.test(key) ? JSON.stringify(key) : '"' + key + '"') + ':';
        json += result;
      }

    } else {  // we're mid-array
      if (depth > 0 && index > 0) json += ',';
      json += result === undefined ? 'null' : result;
    }

    if (newLength === undefined) index++
    else {
      containerStack[depth] = container;
      indexStack[depth] = index;
      keysStack[depth] = keys;
      lengthStack[depth++] = length;

      container = value;
      length = newLength;
      keys = newKeys;
      index = 0;
    }

    console.log('depth', depth, ' index', index, ' length', length, ' key', key, ' value', value, ' result', result, ' json', json);

  } while (depth !== 0);

  return json;
}

console.log(stringify({ x: [1, 2, 3, undefined], y: "goodbye", z: [{ a: true, b: false, c: null, d: undefined }] }));


