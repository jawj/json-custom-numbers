const escapableTest = /["\\\u0000-\u001f]/;


function stringify(value: any) {
  let key;
  let json = '';

  let container: any = {'': value};
  let keys = [''] as string[] | undefined;
  let length = 1;
  let index = 0;
  
  let containerStack: (typeof container)[] = [];
  let indexStack: (typeof index)[] = [];
  let keysStack: (typeof keys)[] = [];
  let lengthStack: (typeof length)[] = [];
  let depth = 0;

  do {
    // console.log('depth', depth, ' index', index, ' length', length, ' value', value, ' container', container, ' json', json);

    if (keys) {
      key = keys[index++];
      value = container[key];
      if (depth > 0) json += (escapableTest.test(key) ? JSON.stringify(key) : '"' + key + '"') + ':';

    } else {
      value = container[index++];
    }

    let typeofValue = typeof value;
    if (value && typeofValue === 'object' && typeof value.toJSON === 'function') {
      value = value.toJSON(key);
      typeofValue = typeof value;
    }

    switch (typeofValue) {
      case 'string':
        json += escapableTest.test(value) ? JSON.stringify(value) : '"' + value + '"';
        break;

      case 'boolean':
        json += value === true ? 'true' : 'false';
        break;

      case 'number':
        json += isFinite(value) ? String(value) : 'null';
        break;

      case 'object':
      case 'undefined':
        if (!value) {
          json += 'null';
          break;
        }

        containerStack[depth] = container;
        indexStack[depth] = index;
        keysStack[depth] = keys;
        lengthStack[depth++] = length;
        container = value;
        index = 0;
        
        if (Array.isArray(value)) {
          json += '[';
          keys = undefined;
          length = value.length;
          break;
        }

        json += '{';
        keys = Object.keys(value);
        length = keys.length;
        break;
    }

    while (index === length && depth > 0) {  // i.e. beyond end
      json += keys ? '}' : ']';
      container = containerStack[--depth];
      index = indexStack[depth];
      keys = keysStack[depth];
      length = lengthStack[depth];
    }

    if (index > 0 && depth > 0) json += ',';

  } while (depth > 0);

  return json;
}

console.log(stringify({ x: [1, 2, 3], y: "goodbye", z: [{ a: true, b: false, c: null }] }));


