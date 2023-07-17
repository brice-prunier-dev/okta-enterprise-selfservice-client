import {JsonObj} from './types';
import { isAssigned, isBlank } from './types-tester';

export function asString(obj: any): obj is string {
    return typeof obj === 'string';
}

export function asBoolean(obj: any): obj is boolean {
    return typeof obj === 'boolean';
}

export function asNumber(obj: any): obj is number {
    return typeof obj === 'number';
}

export function isArray(obj: any): boolean {
    return Array.isArray(obj);
}

export function asArray<T>(obj: any): obj is T[] {
    return Array.isArray(obj) && obj.length > 0;
}

export function asFunction(obj: any): boolean {
    return typeof obj === 'function';
}

export function asDate(obj: any): obj is Date {
    return obj instanceof Date && !isNaN(obj.valueOf());
}

export function asObject(obj: any): obj is { [x: string | number | symbol]: any } {
    return obj !== null && typeof obj === 'object';
}
export function isBoolean(obj: any): boolean {
    return typeof obj === 'boolean';
}

export function isNumber(obj: any): boolean {
    return typeof obj === 'number';
}

export function isString(obj: any): obj is string {
    return typeof obj === 'string';
}

export function isScalar(obj: any): boolean {
    return typeof obj !== 'function' && typeof obj !== 'object' && !Array.isArray(obj);
}

export function isFunction(obj: any): obj is (...args: unknown[]) => unknown {
    return !isBlank(obj) && typeof obj === 'function';
}

export function isType(obj: any): boolean {
    return isFunction(obj);
}
export function isStringMap(obj: any): obj is {} {
    return typeof obj === 'object' && obj !== null;
}
const STRING_MAP_PROTO = Object.getPrototypeOf({});
export function isStrictStringMap(obj: any): boolean {
    return isStringMap(obj) && Object.getPrototypeOf(obj) === STRING_MAP_PROTO;
}
export function isPromise(obj: any): boolean {
    // allow any Promise/A+ compliant thenable.
    // It's up to the caller to ensure that obj.then conforms to the spec
    return isAssigned(obj) && isFunction(obj.then);
}
export function isDate(obj: any): obj is Date {
    return obj instanceof Date && !isNaN(obj.valueOf());
}
export function isJsObject(o: any): o is JsonObj {
    return o !== null && (typeof o === 'function' || typeof o === 'object');
}
export function isPrimitive(obj: any): boolean {
    return !isJsObject(obj);
}

export function asPromise<T>(func: () => T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        try {
            resolve(func());
        } catch (err) {
            reject(err);
        }
    });
}
type Constructor<T = any> = new (...args: any[]) => T;

export function removeAll<T>(list: T[], items: T[]) {
    for (const item of items) {
        const index = list.indexOf(item);
        if (index > -1) {
            list.splice(index, 1);
        }
    }
}
