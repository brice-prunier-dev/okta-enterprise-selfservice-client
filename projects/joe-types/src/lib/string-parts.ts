import { isStringAssigned } from 'joe-fx';

// ────────────────────────────────────────────────────────────────────────────────

export const DASH = '-';

// ────────────────────────────────────────────────────────────────────────────────

export enum PartsEnum {
    last = -1,
    first = 0,
    second = 1,
    third = 2,
    fourth = 3,
    fifth = 4
}

/**
 *  Read a token part as xxx-yyyy-zz
 * @param token string value to process.
 * @param part part to read as PartsEnum.
 * @param sep default separator = '-'.
 * @return requested token part.
 */
export function readPart(token: string, part: PartsEnum, sep: string = DASH): string | undefined {
    const parts = token.split(sep);
    switch (part) {
        case PartsEnum.first:
            return parts[0];
        case PartsEnum.second:
            return parts.length > 1 ? parts[1] : undefined;
        case PartsEnum.third:
            return parts.length > 2 ? parts[2] : undefined;
        case PartsEnum.fourth:
            return parts.length > 3 ? parts[3] : undefined;
        case PartsEnum.fifth:
            return parts.length > 4 ? parts[4] : undefined;
        default:
            return parts[parts.length - 1];
    }
}
/**
 *  Replace a token part as xxx-yyyy-zz
 * @param token string value to process.
 * @param part part to replace as PartsEnum.
 * @param by new value.
 * @param sep default separator = '-'.
 * @return requested token part.
 */
export function replacePart(
    token: string,
    part: PartsEnum,
    by: string,
    sep: string = DASH
): string {
    const parts = token.split(sep);
    switch (part) {
        case PartsEnum.first:
            parts[0] = by;
            break;
        case PartsEnum.second:
            if (parts.length > 1) {
                parts[1] = by;
            } else if (parts.length === 1) {
                return token + sep + part;
            }
            break;
        case PartsEnum.third:
            if (parts.length > 2) {
                parts[2] = by;
            } else if (parts.length === 2) {
                return token + sep + part;
            }
            break;
        case PartsEnum.fourth:
            if (parts.length > 3) {
                parts[3] = by;
            } else if (parts.length === 3) {
                return token + sep + part;
            }
            break;
        case PartsEnum.fifth:
            if (parts.length > 4) {
                parts[4] = by;
            } else if (parts.length === 4) {
                return token + sep + part;
            }
            break;
        default:
            parts[parts.length - 1] = by;
            break;
    }
    return parts.join(sep);
}
/**
 *  Append a part to a token as xxx-yyyy-zz
 * @param token string value to process.
 * @param part part to append.
 * @param sep default separator = '-'.
 * @return result token.
 */

export function appendPart(token: string, part: string, sep: string = DASH): string {
    return token + sep + part;
}
/**
 *  Prefix a token as xxx-yyyy-zz
 * @param token string value to process.
 * @param prefix prefix.
 * @param sep '-' as default separator.
 * @return result token.
 */
export function prefixPart(token: string, prefix: string, sep: string = DASH): string {
    return prefix + sep + token;
}
/**
 *  Delete a part from a token as xxx-yyyy-zz
 * @param token string value to process.
 * @param part part to delete as PartsEnum.
 * @param sep default separator = '-'.
 * @return result token.
 */
export function deletePart(token: string, part: PartsEnum, sep: string = DASH): string | undefined {
    const parts = token.split(sep);
    const result = [];
    for (let index = 0; index < parts.length; index++) {
        switch (part) {
            case PartsEnum.first:
                if (index !== 0) {
                    result.push(parts[index]);
                }
                break;
            case PartsEnum.second:
                if (index !== 1) {
                    result.push(parts[index]);
                }
                break;
            case PartsEnum.third:
                if (index !== 2) {
                    result.push(parts[index]);
                }
                break;
            case PartsEnum.fourth:
                if (index !== 3) {
                    result.push(parts[index]);
                }
                break;
            case PartsEnum.fifth:
                if (index !== 4) {
                    result.push(parts[index]);
                }
                break;
            default:
                if (index !== parts.length - 1) {
                    result.push(parts[index]);
                }
                break;
        }
    }
    return result.length === 0 ? undefined : result.join(sep);
}
/**
 *  Remove n starting part from a token as xxx-yyyy-zz
 * @param token string value to process.
 * @param partCount starting part count to delete.
 * @param sep default separator = '-'.
 * @return result token.
 */
export function slicePart(
    token: string,
    partCount: number,
    sep: string = DASH
): string | undefined {
    if (token) {
        const parts = token.split(sep).slice(0, partCount);
        const reducer = (accumulator: string, currentValue: string, currenIdx: number) =>
            currenIdx === 0 ? currentValue : accumulator + '-' + currentValue;
        return parts.reduce(reducer);
    }
    return undefined;
}

export function pascalCase(word?: string | undefined): string {
    if (isStringAssigned(word)) {
        const parts = word!.split(/-|_/);
        return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    } else {
        return '';
    }
}

const SLUG_KEYS = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    '-',
    '_',
    '.'
];

export function isSlugKey(key: string): boolean {
    return SLUG_KEYS.includes(key);
}

export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+\$/, ''); // Trim - from end of text
}

export function namify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '_') // Replace spaces with _
        .replace(/[^\w\_]+/g, '') // Remove all non-word chars
        .replace(/\_\_+/g, '_') // Replace multiple _ with single _
        .replace(/^_+/, '') // Trim _ from start of text
        .replace(/_+\$/, ''); // Trim _ from end of text
}
