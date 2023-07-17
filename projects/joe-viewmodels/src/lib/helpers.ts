import {JsonObj, AnyDef, isJsObject, asString, isFunction} from 'joe-fx';
import {Subscribable} from 'rxjs';

export function isPromise<T = any>(obj: any): obj is Promise<T> {
    // allow any Promise/A+ compliant thenable.
    // It's up to the caller to ensure that obj.then conforms to the spec
    return !!obj && typeof obj.then === 'function';
}

/**
 * Determine if the argument is a Subscribable
 */
export function isSubscribable(obj: any | Subscribable<any>): obj is Subscribable<any> {
    return !!obj && typeof obj.subscribe === 'function';
}

export function parseError(payload: unknown): string | undefined {
    if (!payload) {
        return undefined;
    }

    if (asString(payload)) {
        return payload.substring(0, 100);

    } else if (isJsObject(payload)) {
        if (payload.error) {
            return parseError(payload.error!);
        }
        if (payload.message) {
            return parseError(payload.message!);
        }
        if (payload.data) {
            return parseError(payload.data!);
        }
    }
    if (isFunction(payload)) {
        return parseError(payload());
    }
    return JSON.stringify(payload).substring(0, 100);
}
