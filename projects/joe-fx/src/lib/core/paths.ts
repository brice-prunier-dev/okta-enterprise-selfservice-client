import {isArray, isFunction, isJsObject, isNumber} from './types-helper';
import {MetadataHelper} from './types-info';
import {OType} from './types';
import {isBlank, isStringAssigned} from './types-tester';
import {PathIndicator} from './enums';
import {
    DOUBLEQUOTE,
    KEYVALUEPAIR_SEPARATOR,
    KEYVALUE_SEPARATOR,
    NUMERIC_PREFIX,
    PATH_LOCAL,
    PATH_NEXT,
    PATH_PARENT,
    PATH_ROOT,
    QUOTE
} from './constants';

//
// ─── HREF ───────────────────────────────────────────────────────────────────────
//

/**
 * { key: PathRole, part: any}}
 */
interface KeyedPart {
    key: PathIndicator;
    part: any;
    text: string;
}

/**
 * Encode a  value that is an index selector in a joe paths
 * that method target numeric value to disting value that can either be
 * - an index position of an array : intance>array>[1]
 * from numeric value that can be
 * - an index value of a collection: instance>list>(#18)
 * @param 'Xxx' or 12 or 1.23
 * @returns Xxx or #12 or ##1.23
 */
function _encodeOneSelector(value: string | number): string {
    return isNumber(value)
        ? Number.isInteger(value)
            ? NUMERIC_PREFIX + value
            : NUMERIC_PREFIX + NUMERIC_PREFIX + value
        : (value as string);
}
/**
 * take a path value an return its real value
 * @param stringValue string | number  as Xxx or #12 or ##1.23
 * @returns Xxx or 12 or 1.23
 */
export function decodeOneSelector(stringValue: string): string | number {
    return stringValue[0] === NUMERIC_PREFIX
        ? stringValue[1] === NUMERIC_PREFIX
            ? Number.parseFloat(stringValue.substring(2))
            : Number.parseInt(stringValue.substring(1))
        : stringValue;
}

/**
 * Is it a valid string parameter ?
 * Should be surround by " or '.
 * @param text input text.
 */
function isTextString(text: string): boolean {
    return isStringAssigned(text)
        ? (text.startsWith(QUOTE) && text.endsWith(QUOTE)) ||
        (text.startsWith(DOUBLEQUOTE) && text.endsWith(DOUBLEQUOTE))
        : false;
}
/**
 * Is it an array parameter ?
 * Should be surround by [ ].
 * @param text input text.
 */
export function isTextArray(text: string): boolean {
    return text.startsWith('[') && text.endsWith(']');
}
/**
 * Is it an object parameter ?
 * Should be surround by { }.
 * @param text input text.
 */
export function isTextObject(text: string): boolean {
    return isStringAssigned(text) && text.startsWith('{') && text.endsWith('}');
}
/**
 * Is it a call parameter ?
 * Should be surround by ( ).
 * @param text input text.
 */
function isTextCall(text: string): boolean {
    return text.startsWith('(') && text.endsWith(')');
}
/**
 * Turn an int into a array selector : [N].
 * @param index input value.
 */
export function toArraySelector(index: number | string): string {
    return `[${index}]`;
}

/**
 * Turn an int into a array selector : [N].
 * @param index input value.
 */
export function toIndexSelector(index: number | string): string {
    return `(${index})`;
}
/**
 * Remove surrounding brackets or curly braces.
 * [ text ] or { text } / text
 * @param text input text.
 */
export function extractContent(text: string): string {
    const from = 1;
    const to = text.length - 1;
    return text.substring(from, to).trim();
}

/**
 * Take one or several selector values as input.s and return a selector statement
 * @param 'Xxx' or 12 or ['Xxx', 1.23]
 * @returns Xxx or #12 or Xxx,##1.23
 */
export function encodeSelector(value: string | number | (string | number)[]): string {
    return Array.isArray(value)
        ? value.map((s) => _encodeOneSelector(s)).join(KEYVALUEPAIR_SEPARATOR)
        : _encodeOneSelector(value);
}
/**
 * Take a selector statement as input and return one or several values that matches the statement
 * @param string as "Xxx" or "Xxx,#12" or "Xxx,##1.23"
 * @returns Xxx or  [Xxx, 12] or [Xxx, 1.23]
 */
export function decodeSelector(stringValue: string): string | number | (string | number)[] {
    if (isTextCall(stringValue)) {
        stringValue = extractContent(stringValue);
    }

    const values = stringValue.split(KEYVALUEPAIR_SEPARATOR).map((s) => decodeOneSelector(s.trim()));
    return values.length === 1 ? values[0] : values;
}

export function encodeSimpleObj(value: any): string {
    return Object.keys(value)
        .map((s) => '' + s + KEYVALUE_SEPARATOR + _encodeOneSelector(value[s] as string | number))
        .join(KEYVALUEPAIR_SEPARATOR);
}

export function decodeSimpleObj(pathPart: string): object {
    if (isTextObject(pathPart)) {
        pathPart = extractContent(pathPart);
    }
    if (isBlank(pathPart)) {
        return {};
    }
    return pathPart
        .split(KEYVALUEPAIR_SEPARATOR)
        .map((s) => {
            const tmp = s.split(KEYVALUE_SEPARATOR);
            return [tmp[0].trim(), decodeOneSelector(tmp[1].trim())];
        })
        .reduce((r, v) => {
            r[v[0]] = v[1];
            return r;
        }, {} as any);
}

/**
 * Return the a string value as a JSON obj.
 * {prop:"val"} / {"prop":"val"}
 * {prop:#2} / {"prop":2}
 * @param stmt input string.
 */
// function toJsonText(stmt: string): string {
//     // let jsonText = stmt.replace( /\s/g, '' );
//     let jsonText = stmt
//         .replace(/\s*/g, '')
//         .replace(/{/, '{"')
//         .replace(/}/, '"}')
//         .replace(/\[/, '["')
//         .replace(/\]/, '"]')
//         .replace(/:/, '":"')
//         .replace(/,/, '","')
//         .replace(/"#true"/g, 'true')

//         .replace(/"#false"/g, 'false');
//     const jsonText1 = jsonText;
//     const jsonText2 = '';
//     const matches = jsonText.match(/("#\d*\.?\d*")/g);
//     if (matches != null) {
//         for (const n in matches) {
//             if (matches.hasOwnProperty(n)) {
//                 jsonText = jsonText.replace(n, n.substring(2, n.length - 1));
//             }
//         }
//     }
//     return jsonText1 + jsonText2;
// }
/**
 * Return a string value as a JSON obj.
 * {"prop":val} or {"prop":"val"} /  { prop: val }
 * @param text input string.
 */
// export function toObject(text: string): any {
//     text = toJsonText(text);
//     return JSON.parse(text);
// }
/**
 * Turn path part into qualified definition { key: enum qualification, part: value }
 * @param part input part definition
 */
function _qualifyPart(part: string): KeyedPart {
    let result: KeyedPart;
    if (part === PATH_ROOT) {
        result = {key: PathIndicator.Root, part, text: part};
    } else if (part === PATH_PARENT) {
        result = {key: PathIndicator.ToParent, part, text: part};
    } else if (part === PATH_LOCAL) {
        result = {key: PathIndicator.Local, part, text: part};
    } else if (isTextArray(part)) {
        result = {
            key: PathIndicator.ArrayIndex,
            part: Number.parseInt(extractContent(part)),
            text: part
        };
    } else if (isTextCall(part)) {
        result = {
            key: PathIndicator.ArrayIdSelector,
            part: decodeSelector(part),
            text: part
        };
    } else if (isTextObject(part)) {
        result = {
            key: PathIndicator.ArrayObjectSelector,
            part: decodeSimpleObj(part),
            text: part
        };
    } else {
        result = {key: PathIndicator.Property, part, text: part};
    }
    return result;
}
/**
 * Join part with PATH_NEXT when more then 1.
 * @param source array of string part
 */
export function toPath(source: string[]): string {
    switch (source.length) {
        case 0:
            return PATH_LOCAL;
        case 1:
            return source[0];
        default:
            return source[0].endsWith(source[1]) ? source[0] : source[0] + PATH_NEXT + source[1];
    }
}

/**
 * Test an object against arrayselector.
 * @param instance object to test
 * @param selector key definition: {"id":"Xxx""} or {"@>id":"Xxx"}
 */
export function isMatchingSelector(instance: any, selector: any): boolean {
    let matching = false;
    for (const key in selector) {
        if (selector.hasOwnProperty(key)) {
            if (key.startsWith(PATH_LOCAL)) {
                const val = readPath(instance, key);
                matching = val === selector[key];
            } else if (instance.hasOwnProperty(key)) {
                matching = instance[key] === selector[key];
            }
            if (!matching) {
                return false;
            }
        }
    }
    return matching;
}

function _isStartingWithParentese(value: string): boolean {
    return isStringAssigned(value) && value.startsWith('(') && !value.endsWith(')');
}
function _isEndingWithParentese(value: string): boolean {
    return isStringAssigned(value) && value.endsWith(')') && !value.startsWith('(');
}

export function splitPath(path: string): string[] {
    const pathParts = [];
    let inParentese = false;
    let parenteseCount = 0;
    let currentPart = '';
    const parts = path.split(new RegExp(PATH_NEXT, 'g'));
    for (const part of parts) {
        if (!inParentese && _isStartingWithParentese(part)) {
            currentPart = part;
            inParentese = true;
        } else if (inParentese && _isEndingWithParentese(part) && parenteseCount === 0) {
            currentPart += PATH_NEXT + part;
            pathParts.push(currentPart);
            currentPart = '';
            inParentese = false;
        } else if (inParentese) {
            currentPart += PATH_NEXT + part;
            if (_isStartingWithParentese(part)) {
                parenteseCount++;
            } else if (_isEndingWithParentese(part)) {
                parenteseCount--;
            }
        } else {
            pathParts.push(part);
        }
    }
    return pathParts;
}
export function parsePart(path: string): KeyedPart[] {
    const parts = splitPath(path);
    const keyparts = parts.map((s) => _qualifyPart(s));
    return keyparts;
}

function _pathNeedPrepare(pathParts: KeyedPart[]): boolean {
    const predicate = (p: KeyedPart): boolean =>
        p.key === PathIndicator.ArrayIdSelector ||
        p.key === PathIndicator.ArrayObjectSelector ||
        p.key === PathIndicator.ToParent;
    return pathParts.findIndex(predicate) > -1;
}

function _read(current: any, pathParts: KeyedPart[]): any {
    let result = current;
    if (_pathNeedPrepare(pathParts) && MetadataHelper.isNotPrepared(current)) {
        throw new Error('target should be prepared');
    }
    for (let index = 0; index < pathParts.length; index++) {
        const segmentPart = pathParts[index];
        switch (segmentPart.key) {
            case PathIndicator.Property:
            case PathIndicator.ArrayIndex:
                result = isFunction(result.get)
                    ? result.get(segmentPart.part)
                    : result[segmentPart.part];
                break;

            case PathIndicator.ToParent:
                result = result.parent();
                break;

            case PathIndicator.ArrayIdSelector:
                const array = result as any[];
                const selector = segmentPart.part;
                result = undefined;
                if (array.length > 0) {
                    const dataInfo = MetadataHelper.getTypeInfoWithCheck(array[0]);
                    if (!dataInfo) {
                        const path = pathParts.map((p) => p.part).join(PATH_NEXT);
                        throw new Error(`${path} is not prepared `);
                    }

                    const otype = dataInfo.type as OType;
                    const idObj = otype.buildIndexObjFromSelectorValue(decodeSelector(selector));

                    for (const item of array) {
                        if (isMatchingSelector(item, idObj)) {
                            result = item;
                            break;
                        }
                    }
                }
                break;
            case PathIndicator.ArrayObjectSelector:
                const array2 = result as any[];
                const idObj = segmentPart.part;
                result = undefined;
                if (array2.length > 0 && idObj) {
                    for (const item of array2) {
                        if (isMatchingSelector(item, idObj)) {
                            result = item;
                            break;
                        }
                    }
                }
                break;

            case PathIndicator.Local:
                result = current;
                break;
            case PathIndicator.Root:
                result = isFunction(result.$root)
                    ? result.$root()
                    : MetadataHelper.getTypeInfo(result).root().obj;
                break;

            default:
                result = result;
                break;
        }
        if (result === undefined) {
            return undefined;
        }
    }
    return result;
}

function _write(current: any, pathParts: KeyedPart[], value: any): void {
    let result = current;
    if (_pathNeedPrepare(pathParts) && MetadataHelper.isNotPrepared(current)) {
        throw new Error('target should be prepared');
    }
    for (let index = 0; index < pathParts.length; index++) {
        const segmentPart = pathParts[index];
        switch (segmentPart.key) {
            case PathIndicator.Property:
            case PathIndicator.ArrayIndex:
                if (index === pathParts.length - 1) {
                    isFunction(result.set) ? result.set(value) : (result[segmentPart.part] = value);
                }
                result = isFunction(result.get)
                    ? result.get(segmentPart.part)
                    : result[segmentPart.part];

                break;

            case PathIndicator.ToParent:
                result = result.parent();
                break;

            case PathIndicator.ArrayObjectSelector:
                const array = result as any[];
                const selector = segmentPart.part;
                if (array.length > 0) {
                    const dataInfo = MetadataHelper.getTypeInfoWithCheck(array[0]);
                    let idObj;
                    if (dataInfo) {
                        const otype = dataInfo.type as OType;
                        idObj = otype.buildIndexObjFromSelectorValue(selector);
                    } else {
                        const path = pathParts.map((p) => p.part).join(PATH_NEXT);
                        throw new Error(`${path} is not prepared `);
                    }
                    for (let idx = 0; idx < array.length; idx++) {
                        const element = array[idx];
                        if (isMatchingSelector(element, idObj)) {
                            result = element;
                            break;
                        }
                    }
                } else {
                    return undefined;
                }
                break;

            case PathIndicator.Local:
                result = current;
                break;
            case PathIndicator.Root:
                result = isFunction(result.$root)
                    ? result.$root()
                    : MetadataHelper.getTypeInfo(result).root().obj;
                break;

            default:
                result = result;
                break;
        }
        if (result === undefined) {
            return undefined;
        }
    }
}

export function readPath(current: any, pathStmt: string, forgetLast: number = 0): any {
    if (current === undefined || (isArray(current) && current.length == 0)) {
        return undefined;
    }

    let pathParts: KeyedPart[] = parsePart(pathStmt);
    if (forgetLast) {
        pathParts = pathParts.slice(0, pathParts.length - forgetLast);
    }
    const result = _read(current, pathParts);
    return result;
}

export function writePath(current: any, pathStmt: string, value: any) {
    const pathParts: KeyedPart[] = parsePart(pathStmt);
    const result = _write(current, pathParts, value);
}

export function asRelativePathWithSelector(path: string): [string, string] {
    const pathParts: KeyedPart[] = parsePart(path);
    const isRoot = pathParts.length === 1;
    const relativePath = isRoot
        ? pathParts[0].text
        : pathParts
            .slice(0, pathParts.length - 1)
            .map((p) => p.text)
            .join(PATH_NEXT);
    const selector = isRoot ? '' : pathParts[pathParts.length - 1].text;
    return [relativePath, selector];
}

export function getParentProperty(pathStmt: string): string {
    if (pathStmt === undefined) {
        return PATH_ROOT;
    }
    const pathParts: KeyedPart[] = parsePart(pathStmt);
    return pathParts.length > 1 ? pathParts[pathParts.length - 1].part : PATH_ROOT;
}

export function isPath(path: string): boolean {
    return (
        (path || '').startsWith(PATH_ROOT) ||
        path.startsWith(PATH_NEXT) ||
        path.startsWith(PATH_LOCAL) ||
        path.startsWith(PATH_PARENT)
    );
}

export function normalizePath(path: string): string {
    return isPath(path)
        ? path.startsWith(PATH_NEXT)
            ? PATH_LOCAL + path
            : path
        : PATH_LOCAL + PATH_NEXT + path;
}
