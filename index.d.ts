
export interface ParseOptions {
  maxDepth?: number;
}

/**
 * JSON parser that allows custom number parsing. The first two arguments match
 * `JSON.parse()`. The third and fourth are novel.
 * @param text A valid JSON string.
 * @param reviver A function that transforms the results. This function is
 * called for each member of the object. If a member contains nested objects,
 * the nested objects are transformed before the parent object is.
 * @param numberParser A function that parses numbers. Receives a key or array
 * index (if not at top level) and the string representation of the number. If
 * no function is provided, behaviour matches `JSON.parse()`.
 * @param options An optional object with a signle key: `maxDepth`. This sets
 * the maximum allowable depth of object nesting. By default, matching native
 * implementations, no explicit limit is imposed. This parameter thus defaults
 * to `Infinity`, so that maximum depth is limited only by available memory.
 */
export function parse(
  text: string,
  reviver?: (key: string, value: any) => any,
  numberParser?: (key: string | number | undefined, str: string) => any,
  maxDepth?: number | ParseOptions,
): any;

export interface StringifyOptions {
  maxDepth?: number;
  skipToJSON?: boolean;
}

/**
 * JSON stringifier that allows custom stringification. The first three
 * arguments match `JSON.stringify()`. The fourth and fifth are novel.
 * @param obj A JavaScript value, usually an object or array, to be converted.
 * @param replacer An array of object keys to be included in the output, or a
 * function that transforms the results.
 * @param indent Adds indentation, white space and line break characters to the
 * return-value JSON text to make it easier to read.
 * @param customSerializer A function that receives (key, value, typeof value)
 * for each value to be stringified. If the function returns no value, the 
 * original value is stringified as usual. If it returns a string, that string
 * is used directly as the serialized representation.
 * @param options An optional object with two keys. `maxDepth` is the maximum
 * allowable depth of object nesting. Native implementations are recursive and
 * limited by the call stack, which means the effective maximum depth may vary
 * (between 3,374 and 40,000 across different engines at the time of writing).
 * This implementation is not recursive, and the default value here is 50,000.
 * `skipToJSON` is a boolean which, when `true`, suppresses calling any
 * `toJSON()` methods on any objects being stringified.
 * */

export function stringify(
  obj: any,
  replacer?: (string | number)[] | ((key: string, value: any) => any) | null,
  indent?: string | number,
  customSerializer?: (key: string, value: any, typeofValue: string) => string | void,
  options?: number | StringifyOptions,
): string;
