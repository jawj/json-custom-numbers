
/**
 * JSON parser that allows custom number parsing. The first two arguments match
 * `JSON.parse()`. The third and fourth are novel.
 * @param text A valid JSON string.
 * @param reviver A function that transforms the results. This function is
 * called for each member of the object. If a member contains nested objects,
 * the nested objects are transformed before the parent object is.
 * @param numberParser A function that parses numbers. Receives a string 
 * representation of the number. If no function is provided, behaviour matches
 * `JSON.parse()`.
 * @param maxDepth Maximum allowable depth of object nesting. By default,
 * matching native implementations, no explicit limit is imposed. This
 * parameter thus defaults to `Infinity`, so that depth is limited only by
 * available memory.
 */
export function parse(
  text: string,
  reviver?: (key: string, value: any) => any,
  numberParser?: (string: string) => any,
  maxDepth?: number,
): any;

/**
 * JSON stringifier that allows custom stringification. The first three
 * arguments match `JSON.stringify()`. The fourth and fifth are novel.
 * @param obj A JavaScript value, usually an object or array, to be converted.
 * @param replacer An array of object keys to be included in the output, or a
 * function that transforms the results.
 * @param indent Adds indentation, white space and line break characters to the
 * return-value JSON text to make it easier to read.
 * @param customSerializer A function that receives each (key, value, typeof
 * value) to be stringified. If the function returns no value, the original
 * value is stringified as usual. If it returns a string, that string is used
 * directly as the serialized representation.
 * @param maxDepth Maximum allowable depth of object nesting. Native
 * implementations are recursive and limited by the call stack, which means the
 * effective maximum depth may vary (between 3,374 and 40,000 across different
 * engines at the time of writing). This implementation is not recursive, and
 * the default value here is 50,000.
 * */

export function stringify(
  obj: any,
  replacer?: string[] | ((key: string, value: any) => any),
  indent?: string | number,
  customSerializer?: (key: string, value: any, typeofValue: string) => string | void,
  maxDepth?: number,
): string;
