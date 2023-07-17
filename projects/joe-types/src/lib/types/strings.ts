import { StringDef } from 'joe-fx';

/**
 *  '#HHHHHH'
 */
export const COLOR_DEF: StringDef = {
    type: 'string',
    title: 'S_COLOR',
    default: '#ffffff',
    minlength: 7,
    maxlength: 7,
    pattern: '/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)',
    patternModel: '#FFFFFF'
};

/**
 *  Month/Day/Year Hr:Mi:Sc
 */
export const S_DATETIME_EN: StringDef = {
    type: 'string',
    title: 'S_DATETIME_EN',
    pattern: '^([01][0-9]/[0-3][0-9]/[0-9]{4} [0-2][0-9]:[0-5][0-9]:[0-5][0-9])$',
    patternModel: 'English Datetime MM/DD/YYYY HH:mm:ss'
};

/**
 *  Day/Month/Year Hr:Mi:Sc
 */
export const S_DATETIME_FR: StringDef = {
    type: 'string',
    title: 'S_DATETIME_EN',
    pattern: '^([0-3][0-9]/[01][0-9]/[0-9]{4} [0-2][0-9]:[0-5][0-9]:[0-5][0-9])$',
    patternModel: 'French Datetime DD/MM/YYYY HH:mm:ss'
};

/**
 *  Month/Day/Year
 */
export const S_DATE_EN: StringDef = {
    type: 'string',
    title: 'S_DATE_EN',
    pattern: '^([01][0-9]/[0-3][0-9]/[0-9]{4})$',
    patternModel: 'English Datetime MM/DD/YYYY'
};

/**
 *  Day/Month/Year
 */
export const S_DATE_FR: StringDef = {
    type: 'string',
    title: 'S_DATE_EN',
    pattern: '^([0-3][0-9]/[01][0-9]/[0-9]{4})$',
    patternModel: 'French Datetime DD/MM/YYYY'
};

/**
 *  Date Iso-8601: YYYY-MM-DDTHH:mm:ss
 */
export const S_DATETIME_ISO: StringDef = {
    type: 'string',
    title: 'S_DATETIME_ISO',
    minlength: 19,
    maxlength: 34,
    pattern:
        '^([0-9]{4}-[01][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9](([+-][01][0-9]:[0-5][0-9])|(.[0-9]{0-7}))Z)' +
        '|([0-9]{4}-[01][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9])' +
        '|([0-9]{4}-[01][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]([+-][0-2][0-9]:[0-5][0-9]|Z))$',
    patternModel: 'Date Iso-8601: YYYY-MM-DDTHH:mm:ss'
};

/**
 *  Date Iso-8601: YYYY-MM-DD HH:mm:ss.999Z
 */
export const S_DATETIME_ISO2: StringDef = {
    type: 'string',
    title: 'S_DATETIME_ISO2',
    minlength: 19,
    maxlength: 34,
    pattern:
        '^([0-9]{4}-[01][0-9]-[0-3][0-9] [0-2][0-9]:[0-5][0-9]:[0-5][0-9].[0-9]+([+-][0-2][0-9]:[0-5][0-9]|Z))' +
        '|([0-9]{4}-[01][0-9]-[0-3][0-9] [0-2][0-9]:[0-5][0-9]:[0-5][0-9]([+-][0-2][0-9]:[0-5][0-9]|Z))' +
        '|([0-9]{4}-[01][0-9]-[0-3][0-9] [0-2][0-9]:[0-5][0-9]([+-][0-2][0-9]:[0-5][0-9]|Z))$',
    patternModel: 'Date Iso-8601: YYYY-MM-DD HH:mm:ssZ'
};

/**
 *  Date Iso-8601: YYYY-MM-DD
 */
export const S_DATE_ISO: StringDef = {
    type: 'string',
    title: 'S_DATE_ISO',
    minlength: 25,
    maxlength: 34,
    pattern: '^[0-9]{4}-[01][0-9]-[0-3][0-9]$',
    patternModel: 'Date Iso-8601: YYYY-MM-DD'
};

/**
 *  Length 4000
 */
export const DEFAULT: StringDef = {
    type: 'string',
    title: 'S_FREE',
    minlength: 0,
    maxlength: 4000
};

/**
 *  Length 150 AlphaNum - _ . ~
 */
export const ID: StringDef = {
    type: 'string',
    title: 'S_ID',
    minlength: 1,
    maxlength: 150,
    pattern: '^[A-Za-z0-9-_~;.]*$',
    patternModel: 'Token'
};

const ipRegExText =
    '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$';
export const IP_DEF: StringDef = {
    type: 'string',
    title: 'S_IP',
    minlength: 7,
    maxlength: 15,
    pattern: ipRegExText,
    patternModel: '##0.##0.##0.##0'
};

/**
 *  Length 500
 */
export const LINES: StringDef = {
    type: 'string',
    title: 'S_LINES',
    minlength: 0,
    maxlength: 500
};

/**
 *  Length 75
 */
export const NAME: StringDef = {
    type: 'string',
    title: 'S_NAME',
    minlength: 0,
    maxlength: 75
};

/**
 *  Length 150 AlphaNum - _ . ~
 */
export const TOKEN: StringDef = {
    type: 'string',
    title: 'S_TOKEN',
    pattern: '^[A-Za-z-0-9]+[A-Za-z-0-9-_:;.{}/]*$',
    patternModel: 'Only alpha numeric with - and _',
    maxlength: 150
};

/**
 *  Length 150 AlphaNum space - _ . ~
 */
export const TOKEN2: StringDef = {
    type: 'string',
    title: 'S_TOKEN2',
    pattern: '^[a-zA-Z0-9]+[a-zA-Z0-9-_:;.{}/ ]*$',
    patternModel: 'Only alpha numeric with space - and _',
    maxlength: 150
};

/**
 *  Length 250
 */
export const PATH_DEF: StringDef = {
    type: 'string',
    title: 'S_PATH',
    pattern: '^/[a-zA-Z0-9-_.~/]+[a-zA-Z0-9-_]$',
    patternModel: 'Path: /Xxx/Yyy',
    minlength: 0,
    maxlength: 250
};

/**
 *  Length 250
 */
export const PATH2_DEF: StringDef = {
    type: 'string',
    title: 'S_PATH2',
    pattern: '^(?!/)[a-zA-Z0-9-_.~/]*$',
    patternModel: 'Path without leading / : Xxx/Yyy ',
    minlength: 0,
    maxlength: 250
};
/**
 *  Length 250
 */
export const PATHANDQUERY_DEF: StringDef = {
    type: 'string',
    title: 'S_PATHANDQUERY',
    pattern: '^(?!/)[a-zA-Z0-9-_.~/?=&]*$',
    patternModel: 'No leading /',
    minlength: 0,
    maxlength: 250
};

/**
 *  Length 250
 */
export const PATHTEMPLATE_DEF: StringDef = {
    type: 'string',
    title: 'S_pathtemplate',
    pattern: '^[a-zA-Z0-9-_.?=~/{}]*$',
    patternModel: 'Path without leading / : Xxx/Yyy ',
    minlength: 0,
    maxlength: 250
};

/**
 *  Length 255
 */
export const COMMENT: StringDef = {
    type: 'string',
    title: 'S_COMMENT',
    minlength: 0,
    maxlength: 255
};

/**
 *  Length 1000
 */
export const SMALLTEXT: StringDef = {
    type: 'string',
    title: 'S_SMALLTEXT',
    minlength: 0,
    maxlength: 1000
};

/**
 *  Length 2000
 */
export const TEXT: StringDef = {
    type: 'string',
    title: 'S_TEXT',
    minlength: 0,
    maxlength: 2000
};

function _decimalToHex(n: number) {
    let hex = n.toString(16);

    while (hex.length < 2) {
        hex = '0' + hex;
    }
    return hex;
}

export function newGuid(dashFormat = true): string {
    const separator = dashFormat ? '-' : '';
    // RFC4122: The version 4 UUID is meant for generating UUIDs from truly-random or
    // pseudo-random numbers.
    // The algorithm is as follows:
    //     Set the two most significant bits (bits 6 and 7) of the
    //        clock_seq_hi_and_reserved to zero and one, respectively.
    //     Set the four most significant bits (bits 12 through 15) of the
    //        time_hi_and_version field to the 4-bit version number from
    //        Section 4.1.3. Version4
    //     Set all the other bits to randomly (or pseudo-randomly) chosen
    //     values.
    // UUID                   = time-low "-" time-mid "-"time-high-and-version "-"clock-seq-reserved and low(2hexOctet)"-" node
    // time-low               = 4hexOctet
    // time-mid               = 2hexOctet
    // time-high-and-version  = 2hexOctet
    // clock-seq-and-reserved = hexOctet:
    // clock-seq-low          = hexOctet
    // node                   = 6hexOctet
    // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // y could be 1000, 1001, 1010, 1011 since most significant two bits needs to be 10
    // y values are 8, 9, A, B
    // tslint:disable-next-line: no-string-literal
    const cryptoObj = window.crypto || (window as any)['msCrypto']; // for IE 11
    if (cryptoObj && cryptoObj.getRandomValues) {
        const buffer = new Uint8Array(16);
        cryptoObj.getRandomValues(buffer);
        // buffer[6] and buffer[7] represents the time_hi_and_version field.
        // We will set the four most significant bits( 4 through 7 ) of buffer[ 6 ]
        // to represent decimal number 4( UUID version number ).
        // tslint:disable-next-line: no-bitwise
        buffer[6] |= 0x40; // buffer[6] | 01000000 will set the 6 bit to 1.
        // tslint:disable-next-line: no-bitwise
        buffer[6] &= 0x4f; // buffer[6] & 01001111 will set the 4, 5, and 7 bit to 0 such that bits 4-7 == 0100 = "4".
        // buffer[8] represents the clock_seq_hi_and_reserved field. We will set
        // the two most significant bits( 6 and 7 ) of the clock_seq_hi_and_reserved to zero and one, respectively.
        // tslint:disable-next-line: no-bitwise
        buffer[8] |= 0x80; // buffer[8] | 10000000 will set the 7 bit to 1.
        // tslint:disable-next-line: no-bitwise
        buffer[8] &= 0xbf; // buffer[8] & 10111111 will set the 6 bit to 0.
        return (
            _decimalToHex(buffer[0]) +
            _decimalToHex(buffer[1]) +
            _decimalToHex(buffer[2]) +
            _decimalToHex(buffer[3]) +
            separator +
            _decimalToHex(buffer[4]) +
            _decimalToHex(buffer[5]) +
            separator +
            _decimalToHex(buffer[6]) +
            _decimalToHex(buffer[7]) +
            separator +
            _decimalToHex(buffer[8]) +
            _decimalToHex(buffer[9]) +
            separator +
            _decimalToHex(buffer[10]) +
            _decimalToHex(buffer[11]) +
            _decimalToHex(buffer[12]) +
            _decimalToHex(buffer[13]) +
            _decimalToHex(buffer[14]) +
            _decimalToHex(buffer[15])
        );
    } else {
        const guidHolder = dashFormat
            ? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
            : 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx';
        const guidSize = dashFormat ? 36 : 32;
        const hex = '0123456789abcdef';
        let r = 0;
        let guidResponse = '';
        for (let i = 0; i < guidSize; i++) {
            if (guidHolder[i] !== '-' && guidHolder[i] !== '4') {
                // each x and y needs to be random
                // tslint:disable-next-line: no-bitwise
                r = (Math.random() * 16) | 0;
            }
            if (guidHolder[i] === 'x') {
                guidResponse += hex[r];
            } else if (guidHolder[i] === 'y') {
                // clock-seq-and-reserved first hex is filtered and remaining hex values are random
                // tslint:disable-next-line: no-bitwise
                r &= 0x3; // bit and with 0011 to set pos 2 to zero ?0??
                // tslint:disable-next-line: no-bitwise
                r |= 0x8; // set pos 3 to 1 as 1???
                guidResponse += hex[r];
            } else {
                guidResponse += guidHolder[i];
            }
        }
        return guidResponse;
    }
}

export const GUID: StringDef = {
    type: 'string',
    title: 'S_GUID',
    pattern: '^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}$',
    patternModel: 'Guid: {8}-{4}-{4}-{4}-{12} alpha num.',
    default: () => newGuid()
};

/**
 *  http(s)://*
 */
export const URL_DEF: StringDef = {
    type: 'string',
    title: 'S_URL',
    pattern: '^(https?|wss?)://[^\\s]*$',
    patternModel: 'http(s)| ws(s)://xxxx:?'
};

/**
 *  http(s)://domain.com:000
 */
export const DOMAIN_DEF: StringDef = {
    type: 'string',
    title: 'S_DOMAIN',
    pattern: '^https?://[a-zA-Z_-][a-zA-Z0-9_-]+.[a-zA-Z0-9.]*[a-zA-Z0-9.:_-]*$',
    patternModel: 'http(s)://xxxx.xxx:???/???'
};

/**
 *  xxx-ff.com
 */
export const HOST_DEF: StringDef = {
    type: 'string',
    title: 'S_HOST',
    pattern: '^[a-zA-Z_-][a-zA-Z0-9_-]+.[a-zA-Z0-9.]*[a-zA-Z0-9.:-]*$',
    patternModel: 'host: xxx.sss.com (without leading / or http.s)'
};

/**
 *  Length 35
 */
export const WORD: StringDef = {
    type: 'string',
    title: 'S_WORD',
    minlength: 0,
    maxlength: 35
};

/**
 *  Length 150
 */
export const WORDS: StringDef = {
    type: 'string',
    title: 'S_WORDS',
    minlength: 0,
    maxlength: 150
};

/**
 *  email: xxx@xxx.xx
 */
export const EMAIL: StringDef = {
    type: 'string',
    title: 'S_EMAIL',
    pattern: '^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$',
    patternModel: 'email: xxx@xxx.xx'
};
