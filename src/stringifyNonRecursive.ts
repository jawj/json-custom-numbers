
const escapableTest = /["\\\u0000-\u001f]/;

export function stringify(value: any) {
  let key;

  let container: any = { '': value };
  let index = 0;
  let keys = [''] as string[] | undefined;
  let length = 1;

  let stack: any = [];
  let depth = 0;

  let json = '';
  let appendStr;

  do { 
    // loop over the current container (object or array)
    
    if (index === length) {
      // we're at the end of a container: emit closing symbol, update values from stack, skip to next iteration
      json += keys ? '}' : ']';

      length = stack[--depth];
      keys = stack[--depth];
      index = stack[--depth];
      container = stack[--depth];
      
      continue;
    }

    // so we're mid-container: deal with a new value
    let newKeys, newLength;

    value = keys ?
      container[key = keys[index]] :
      container[index];

    let typeofValue = typeof value;
    if (value && typeofValue === 'object' && typeof value.toJSON === 'function') {
      value = value.toJSON(key);
      typeofValue = typeof value;
    }

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

        const objKeys = Object.keys(value);
        const objLength = objKeys.length;
        if (objLength === 0) appendStr = '{}';
        else {
          appendStr = '{';
          newKeys = objKeys;
          newLength = objLength;
        }
        break;

      default:
        appendStr = undefined;
    }

    // append comma, key and value (as appropriate)
    if (keys) {  
      // we're in an object
      if (appendStr !== undefined) {
        if (index > 0) json += ',';
        if (depth > 0) json += (escapableTest.test(key) ? JSON.stringify(key) : '"' + key + '"') + ':';
        json += appendStr;
      }

    } else {  
      // we're in an array
      if (index > 0) json += ',';
      json += appendStr === undefined ? 'null' : appendStr;
    }

    index++;

    // new value is simple: skip to next iteration
    if (newLength === undefined) continue;

    // new value is object or array: update stack and values
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
