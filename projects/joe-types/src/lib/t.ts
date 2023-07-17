import {
    Tnumber,
    ObjectDef,
    Tobject,
    MapDef,
    Tmap,
    AnyDef,
    ArrayDef,
    Tarray,
    ObjectTypeFactory,
    MapTypeFactory,
    ArrayTypeFactory,
    Tbool,
    Tstring,
    StringDef,
    Tdate,
    DateDef
} from 'joe-fx';
import {
    DOUBLE,
    INT_0,
    UINT,
    UINT_0,
    DOUBLE_0,
    UDOUBLE,
    UDOUBLE_0,
    INT,
    UINT_STRICT_POSITIVE
} from './types/numbers';
import { BOOL_DEF, YESNO_DEF } from './types/booleans';

import {
    COLOR_DEF,
    COMMENT,
    DEFAULT,
    DOMAIN_DEF,
    EMAIL,
    GUID,
    HOST_DEF,
    ID,
    IP_DEF,
    LINES,
    NAME,
    PATH_DEF,
    PATH2_DEF,
    PATHANDQUERY_DEF,
    PATHTEMPLATE_DEF,
    S_DATETIME_EN,
    S_DATETIME_FR,
    S_DATE_EN,
    S_DATE_FR,
    S_DATETIME_ISO,
    S_DATE_ISO,
    S_DATETIME_ISO2,
    SMALLTEXT,
    TEXT,
    TOKEN,
    TOKEN2,
    URL_DEF,
    WORD,
    WORDS
} from './types/strings';

import { DATE, DATE_TODAY, DATETIME, DATETIME_NOW } from './types/dates';

/**
 * Jstore
 */
export const t = {
    none: {},
    bool: {
        _: new Tbool(BOOL_DEF),
        /** Mandatory boolean with "true" as defaultDef. */
        yesno: new Tbool(YESNO_DEF)
    },
    date: {
        /** Mandatory Date. */
        _: new Tdate(DATE),
        /** Mandatory Date with today as default. */
        today: new Tdate(DATE_TODAY)
    },
    datetime: {
        /** Mandatory DateTime. */
        _: new Tdate(DATETIME),
        /** Mandatory DateTime with now as default. */
        now: new Tdate(DATETIME_NOW),
        as: (options: DateDef): Tdate => {
            return new Tdate(options);
        }
    },
    number: {
        /** Mandatory integer. */
        int: new Tnumber(INT),
        int_0: new Tnumber(INT_0),
        /** Mandatory unsigned integer. */
        uint: new Tnumber(UINT),
        uint_0: new Tnumber(UINT_0),
        int_stric_positive: new Tnumber(UINT_STRICT_POSITIVE),
        /** Mandatory double. */
        double: new Tnumber(DOUBLE),
        double_0: new Tnumber(DOUBLE_0),
        /** Mandatory unsigned double. */
        udouble: new Tnumber(UDOUBLE),
        udouble_0: new Tnumber(UDOUBLE_0)
    },
    string: {
        /** String with no specific limit. A default constraint of 4000 char is applied anyway by the system. */
        _: new Tstring(DEFAULT),

        /** Text limited to 2000 char. */
        text: new Tstring(TEXT),

        /** Text limited to 1000 char. */
        smalltext: new Tstring(SMALLTEXT),

        /** Text limited to 500 char. */
        lines: new Tstring(LINES),

        /** Text limited to 250 char. */
        comment: new Tstring(COMMENT),

        /** String limited to 150 char. */
        words: new Tstring(WORDS),

        /** Only alpha numeric with - and _ no space - limited to 150 char. */
        token: new Tstring(TOKEN),

        /** Only alpha numeric with space - and _ - Token with spaces - limited to 150 char. */
        token2: new Tstring(TOKEN2),

        /** Only alpha numeric xxxxxx@domain.ext */
        email: new Tstring(EMAIL),

        /** String limited to 75 char. */
        name: new Tstring(NAME),

        /** Path: /Xxx/Yyy - limited to 250 char. */
        path: new Tstring(PATH_DEF),

        /** Path: Xxx/Yyy (No starting /) - limited to 250 char. */
        path2: new Tstring(PATH2_DEF),

        /** Path: Xxx/Yyy (No starting /) - limited to 250 char. */
        querypath: new Tstring(PATHANDQUERY_DEF),

        /** Any Path: /?Xxx/Yyy/?- limited to 250 char. */
        pathtemplate: new Tstring(PATHTEMPLATE_DEF),

        /** String limited to 35 char. */
        word: new Tstring(WORD),

        /** Token limited to 150 char. */
        id: new Tstring(ID),

        /** Guid: {8}-{4}-{4}-{4}-{12} alpha num. */
        guid: new Tstring(GUID),

        /** Color as #xxxxxx. */
        color: new Tstring(COLOR_DEF),
        /** IP as ##0.##0.##0.##0. */
        iprange: new Tstring(IP_DEF),
        /** http(s)://xxxx.xxx:???/??? */
        url: new Tstring(URL_DEF),
        /** http(s)://xxxx.xxx */
        httpdomain: new Tstring(DOMAIN_DEF),
        /** host: xxx.sss.com (no / nor leading http...) */
        host: new Tstring(HOST_DEF),
        /** English Datetime MM/DD/YYYY */
        datetime_en: new Tstring(S_DATETIME_EN),
        /** French Datetime DD/MM/YYYY HH:mm:ss */
        datetime_fr: new Tstring(S_DATETIME_FR),
        /** English Datetime MM/DD/YYYY */
        date_en: new Tstring(S_DATE_EN),
        /** French Datetime DD/MM/YYYY */
        date_fr: new Tstring(S_DATE_FR),
        /** Date Iso-8601: YYYY-MM-DDTHH:mm:ss */
        datetime_iso: new Tstring(S_DATETIME_ISO),
        /** Date Iso-8601: YYYY-MM-DD HH:mm:ssZ */
        datetime_iso2: new Tstring(S_DATETIME_ISO2),
        /** Date Iso-8601: YYYY-MM-DD */
        date_iso: new Tstring(S_DATE_ISO),

        /** enum as string */
        enums: (values: string[], title: string): Tstring => {
            const minlength = values.reduce(
                (cumul, curr) => (curr.length < cumul ? curr.length : cumul),
                1000
            );
            const maxlength = values.reduce(
                (cumul, curr) => (curr.length > cumul ? curr.length : cumul),
                0
            );
            return new Tstring({ type: 'string', title, minlength, maxlength, enum: values });
        },

        get: (property: string): any => {
            return (t.string as Record<string, any>)[property];
        },
        set: (property: string, value: any): any => {
            return ((t.string as Record<string, any>)[property] = value);
        },
        exists: (key: string): boolean => {
            return t.string.get(key) !== undefined;
        },

        as: (options: StringDef): Tstring => {
            let stringref = t.string.get(options.title);
            if (stringref === undefined) {
                stringref = t.string.set(options.title, new Tstring(options));
            }
            return stringref;
        }
    },
    array: {
        get: (property: string): any => {
            return (t.array as Record<string, any>)[property];
        },
        set: (property: string, value: any): any => {
            return ((t.array as Record<string, any>)[property] = value);
        },
        exists: (key: any): boolean => {
            return t.array.get(key) !== undefined;
        },
        /** Registered array type definition helper */
        create: (options: ArrayDef): Tarray => {
            const min_bound = options.minlength || 0;
            let top_bound = 'N';
            if (
                options.maxlength &&
                options.maxlength !== Number.MAX_VALUE &&
                options.maxlength !== Number.MAX_SAFE_INTEGER
            ) {
                top_bound = '' + options.maxlength;
            }
            const name = `${options.title}_Array_${min_bound}_${top_bound}`;
            let arraydef = t.array.get(name);
            if (arraydef === undefined) {
                arraydef = t.array.set(name, new Tarray(options));
            }
            return arraydef;
        },
        /** Registered list of items type helper */
        of: <T>(item: AnyDef, minlength?: number, maxlength?: number): Tarray<T> => {
            const min = minlength || 0;
            const max = maxlength || Number.MAX_SAFE_INTEGER;
            const top_bound = max === Number.MAX_SAFE_INTEGER ? 'N' : '' + max;
            const name = `${item.title}_Array_${min}_${top_bound}`;
            let arraydef = t.array.get(name);
            if (arraydef === undefined) {
                arraydef = t.array.set(
                    name,
                    new Tarray({
                        type: 'array',
                        title: name,
                        minlength: min,
                        maxlength: max,
                        items: item
                    })
                );
            }
            return arraydef;
        },
        /** Registered tuple array type helper */
        tuple: (name: string, elements: AnyDef[]): Tarray => {
            let arraydef = t.array.get(name);
            if (arraydef === undefined) {
                arraydef = t.array.set(
                    name,
                    new Tarray({
                        type: 'array',
                        title: name,
                        minlength: elements.length,
                        maxlength: elements.length,
                        items: elements
                    })
                );
            }
            return arraydef;
        }
    },
    map: {
        get: (property: string): any => {
            return (t.map as Record<string, any>)[property];
        },
        set: (property: string, value: any): any => {
            return ((t.map as Record<string, any>)[property] = value);
        },
        exists: (key: string): boolean => {
            return t.map.get(key) !== undefined;
        },
        create: (options: MapDef): Tmap => {
            const min_bound = options.minlength || 0;
            let top_bound = 'N';
            if (
                options.maxlength &&
                options.maxlength !== Number.MAX_VALUE &&
                options.maxlength !== Number.MAX_SAFE_INTEGER
            ) {
                top_bound = '' + options.maxlength;
            }
            const name = `${options.title}_Map_${min_bound}_${top_bound}`;
            let klistdef = t.map.get(name);
            if (klistdef === undefined) {
                klistdef = t.map.set(name, new Tmap(options));
            }
            return klistdef;
        },
        of: (
            item: AnyDef,
            minlength: number = 0,
            maxlength: number = Number.MAX_SAFE_INTEGER
        ): Tmap => {
            const top_bound = maxlength === Number.MAX_SAFE_INTEGER ? 'N' : '' + maxlength;
            const name = `${item.title}_Map_${minlength}_${top_bound}`;
            let klistdef = t.map.get(name);
            if (klistdef === undefined) {
                klistdef = t.map.set(
                    name,
                    new Tmap({
                        type: 'map',
                        title: name,
                        minlength,
                        maxlength,
                        items: item
                    })
                );
            }
            return klistdef;
        },

        tuple: (name: string, elements: AnyDef[]): Tmap => {
            let klistdef = t.map.get(name);
            if (klistdef === undefined) {
                klistdef = t.map.set(
                    name,
                    new Tmap({
                        type: 'map',
                        title: name,
                        minlength: elements.length,
                        maxlength: elements.length,
                        items: elements
                    })
                );
            }
            return klistdef;
        }
    },
    object: {
        get: (property: string): any => {
            return (t.object as Record<string, any>)[property];
        },
        set: (property: string, value: any): any => {
            return ((t.object as Record<string, any>)[property] = value);
        },
        exists: (key: string): boolean => {
            return t.object.get(key) !== undefined;
        },
        as: <T = any>(options: ObjectDef<T>, rename?: string): Tobject<T> => {
            const title = rename || options.title;
            let objectref = t.object.get(title);
            if (objectref === undefined) {
                objectref = t.object.set(title, new Tobject(options, rename));
            }
            return objectref;
        },
        named: (name: string): Tobject => {
            const objectref = t.object.get(name);
            if (objectref === undefined) {
                throw new Error('${name} is not a valid object class name !');
            }
            return objectref;
        }
    }
};

ObjectTypeFactory.Create = t.object.as;
MapTypeFactory.Create = t.map.create;
ArrayTypeFactory.Create = t.array.create;
