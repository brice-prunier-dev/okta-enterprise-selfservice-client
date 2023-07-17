export function isEmptyObj(obj: any): boolean {
    return !!obj && typeof obj === 'object' && Object.getOwnPropertyNames(obj).length === 0;
}

export function isAssigned(obj: any): boolean {
    return !isBlank(obj);
}

export function isDataAssigned(obj: any): boolean {
    return (
        !!obj &&
        ((typeof obj === 'string' && obj.trim().length > 0) ||
            (Array.isArray(obj) && obj.length > 0) ||
            (typeof obj === 'object' &&
                Object.keys(obj).length > 0 &&
                Object.values(obj).some((v) => isDataAssigned(v))) ||
            typeof obj === 'number' ||
            typeof obj === 'boolean' ||
            (obj instanceof Date && !isNaN(obj.valueOf())))
    );
}

export function isBlank(obj: any): boolean {
    return obj === undefined || obj === null;
}

export function isObjAssigned(obj: any): boolean {
    return !isBlank(obj) && typeof obj === 'object' && Object.getOwnPropertyNames(obj).length > 0;
}

export function isArrayAssigned(obj: any): boolean {
    return Array.isArray(obj) && obj.length > 0;
}

export function isStringAssigned(obj: any): boolean {
    return typeof obj === 'string' && obj.trim().length > 0;
}

export function isStringBlank(obj: any): boolean {
    return isBlank(obj) || (typeof obj === 'string' && obj.trim().length === 0);
}

export function isSchema(obj: any): boolean {
    const v = obj?.type;
    return (
        v !== undefined &&
        v !== null &&
        [
            'object',
            'array',
            'map',
            'string',
            'integer',
            'number',
            'boolean',
            'date',
            'xobject'
        ].includes(v)
    );
}

export function isJoeType(obj: any): boolean {
    return isSchema(obj) && typeof obj.validate === 'function';
}

export function isEmptyString(obj: any): boolean {
    return typeof obj === 'string' && obj.trim().length === 0;
}

export function sameString(a: string | undefined, b: string | undefined): boolean {
    if (a === undefined && b === undefined) {
        return true;
    }
    if ((a === undefined && b !== undefined) || (a !== undefined && b === undefined)) {
        return false;
    }
    return typeof a === 'string' && typeof b === 'string'
        ? a.localeCompare(b, undefined, { sensitivity: 'base' }) === 0
        : a === b;
}

export function containsString(
    target: string | undefined,
    search: string,
    searchIsLowerCase = true
): boolean {
    if (target === undefined) {
        return false;
    }
    const lowerTarget = target.toLowerCase();
    const lowerSearch = searchIsLowerCase ? search : search.toLowerCase();
    return lowerTarget.includes(lowerSearch);
}

export function sameArrays(a1: any[] | undefined, a2: any[] | undefined): boolean {
    if (a1 === undefined && a2 === undefined) {
        return true;
    }
    if (a1 && a2 && a1.length === a2.length) {
        for (let i = 0; i < a1.length; i++) {
            if (a1[i] !== a2[i]) {
                return false;
            }
        }
        return true;
    }
    return false;
}

export function sameObject(o1: any, o2: any): boolean {
    if (o1 === o2 || (o1 === undefined && o2 === undefined)) {
        return true;
    }
    for (const p in o1) {
        if (o1[p] !== o2[p]) {
            return false;
        }
    }
    for (const p in o2) {
        if (o1[p] !== o2[p]) {
            return false;
        }
    }

    return true;
}

export function compare(a: any, b: any, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

export function compareObjProp(a: any, b: any, sort: string): number {
    let propname = sort;
    let isAsc = true;
    if (sort.endsWith('!')) {
        propname = sort.substring(0, sort.length - 1);
        isAsc = false;
    }
    return compare(a[propname], b[propname], isAsc);
}
export function compareObj(a: any, b: any, sort: string[]): number {
    switch (sort.length) {
        case 1: {
            return compareObjProp(a, b, sort[0]);
        }
        case 2: {
            const comp1 = compareObjProp(a, b, sort[0]);
            return comp1 !== 0 ? comp1 : compareObjProp(a, b, sort[1]);
        }
        case 3: {
            const comp1 = compareObjProp(a, b, sort[0]);
            const comp2 = compareObjProp(a, b, sort[1]);
            return comp1 !== 0 ? comp1 : comp2 !== 0 ? comp2 : compareObjProp(a, b, sort[2]);
        }
        case 4: {
            const comp1 = compareObjProp(a, b, sort[0]);
            const comp2 = compareObjProp(a, b, sort[1]);
            const comp3 = compareObjProp(a, b, sort[2]);
            return comp1 !== 0
                ? comp1
                : comp2 !== 0
                ? comp2
                : comp3 !== 0
                ? comp3
                : compareObjProp(a, b, sort[3]);
        }
        case 5: {
            const comp1 = compareObjProp(a, b, sort[0]);
            const comp2 = compareObjProp(a, b, sort[1]);
            const comp3 = compareObjProp(a, b, sort[2]);
            const comp4 = compareObjProp(a, b, sort[3]);
            return comp1 !== 0
                ? comp1
                : comp2 !== 0
                ? comp2
                : comp3 !== 0
                ? comp3
                : comp4 !== 0
                ? comp4
                : compareObjProp(a, b, sort[4]);
        }
        default:
            throw new Error('Invalid comparaison...');
    }
}
