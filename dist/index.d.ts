
/**
 * JSON parser that allows custom number parsing.
 * The first two arguments match `JSON.parse()`. The third is novel.
 * @param text A valid JSON string
 * @param reviver A function that transforms the results. This function is
 * called for each member of the object. If a member contains nested objects,
 * the nested objects are transformed before the parent object is.
 * @param numberReviver A function that parses numbers. Receives a string 
 * representation of the number. If no function is provided here, behaviour 
 * matches `JSON.parse()`.
 */
export function parse(
  text: string,
  reviver?: (key: string, value: any) => any,
  numberReviver?: (string: string) => any,
): any;
