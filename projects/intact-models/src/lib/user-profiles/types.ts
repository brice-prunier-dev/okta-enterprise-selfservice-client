import {isStringAssigned, Tstring} from 'joe-fx';

//
// ─── InfrSystem ─────────────────────────────────────────────────────────────────────
//
export const S_LOCALE = new Tstring({
    type: 'string',
    title: 'S_LOCALE',
    minlength: 2,
    maxlength: 5,
    pattern: '^[a-z]{2}$|[a-z]{2}[_][A-Z]{2}$',
    patternModel: 'Locale as xx or xx_XX'
});

export const S_LANG = new Tstring({
    type: 'string',
    title: 'S_LOCALE',
    minlength: 2,
    maxlength: 5,
    pattern: '^[a-z]{2}$|[a-z]{2}[-][a-z]{2}$',
    patternModel: 'Locale as xx or xx-xx'
});


export const S_GAIA = new Tstring({
    type: 'string',
    title: 'S_GAIA',
    pattern: '^([a-z]{2}[0-9]{4}|[a-z]{3}[0-9]{3}|[a-z]{4}[0-9]{2})(-o)?$',
    patternModel: 'GAIA ID: xx0000 or xxx000 or xxxx00'
});

export const S_GAIA_LOGIN = new Tstring(
    {
        type: 'string',
        title: 'S_GAIA_LOGIN',
        pattern: '^(([a-z]{2}[0-9]{4}|[a-z]{3}[0-9]{3}|[a-z]{4}[0-9]{2})(-o)?@(engie|myengie).com)'
            + '|([0-9a-z._-]+@gem.service.account.fr)'
            + '|([0-9a-z._-]+@gem.bounty.account.fr)'
            + '|([0-9a-z._-]+@gem.test.account.fr)$',
        patternModel: 'GAIA login: <gaia>@(my)engie.com'
    });

export const S_TEST_LOGIN = new Tstring({
    type: 'string',
    title: 'S_TEST_LOGIN',
    pattern: '^[0-9a-z._-]+@gem.test.account.fr$',
    patternModel: 'Test Account:  xxx@gem.test.account.fr'
});

export const S_SERVICE_LOGIN = new Tstring({
    type: 'string',
    title: 'S_SERVICE_LOGIN',
    pattern: '^[0-9a-z._-]+@gem.service.account.fr$',
    patternModel: 'Service Account: xxx@gem.service.account.fr'
});

export const S_BOUNTY_LOGIN = new Tstring({
    type: 'string',
    title: 'S_BOUNTY_LOGIN',
    pattern: '^[0-9a-z._-]+@gem.bounty.account.fr$',
    patternModel: 'Bounty Account: xxx@gem.bounty.account.fr'
});

export const S_ENGIE_MAIL = new Tstring({
    type: 'string',
    title: 'S_ENGIE_MAIL',
    pattern: '^[0-9a-z\.\'_-]+@((external.)?){1}([a-z]*\.{1})?(engie|grdf|storengy|elengy|myengie|external\.engie|external\.myengie)\.(com|fr)$',
    patternModel: 'ENGIE mail: t...@...engie.com or (subsidiary).com'
});

export const S_External_MAIL = new Tstring({
    type: 'string',
    title: 'S_EXTERNAL_MAIL',
    pattern: '^[0-9a-z\.\'_-]+@{1}[0-9a-z.-]*(?!@engie.com|@myengie.com|.engie.com|.myengie.com)$',
    patternModel: 'Extenal mail: no @...engie.com'
});


export const SERVICE_LOGING_DOMAIN = '@gem.service.account.fr';
export const TEST_LOGING_DOMAIN = '@gem.test.account.fr';
export const BOUNTY_LOGING_DOMAIN = '@gem.bounty.account.fr';

export const LANGS_FRENCH = 'fr';
export const LANGS_ENGLISH = 'en';

export const LANGS = [
    {id: LANGS_ENGLISH, label: 'English'},
    {id: LANGS_FRENCH, label: 'Français'}
];
export const LANG_KEYS = LANGS.map(item => item.id);

export const USER_TYPES_ADMINISTRATOR = 'A';
export const USER_TYPES_BOUNTY = 'B';
export const USER_TYPES_CUSTOMER = 'C';
export const USER_TYPES_CONTRACTOR = 'E';
export const USER_TYPES_FONCTIONAL = 'F';
export const USER_TYPES_INTERNAL = 'I';
export const USER_TYPES_TECHNICAL = 'T';
export const USER_TYPES_TEST = 'S';
export const USER_TYPES_SERVICE = 'V';
export const USER_TYPES_FAKE = 'Z';
export declare type USER_TYPES = readonly Readonly<{
    id: string;
    label: string;
}>[];
export const INTERNAL_USER_TYPES = [
    {id: USER_TYPES_ADMINISTRATOR, label: 'Internal Administrator'},
    {id: USER_TYPES_CONTRACTOR, label: 'Internal Contractor'},
    {id: USER_TYPES_FONCTIONAL, label: 'Internal Fonctional'},
    {id: USER_TYPES_INTERNAL, label: 'Internal'},
    {id: USER_TYPES_TECHNICAL, label: 'Internal Technical'},
];

export const EXTERNAL_USER_TYPES = [
    {id: USER_TYPES_CUSTOMER, label: 'Customer'},
];

export const ACCOUNT_USER_TYPES = [
    {id: USER_TYPES_TEST, label: 'Test'},
    {id: USER_TYPES_SERVICE, label: 'Service'},
    {id: USER_TYPES_BOUNTY, label: 'Bounty'},
    {id: USER_TYPES_FAKE, label: 'Fake user'}
] as const;

export const USER_TYPES_KEYS = [
    USER_TYPES_ADMINISTRATOR,
    USER_TYPES_CUSTOMER,
    USER_TYPES_CONTRACTOR,
    USER_TYPES_FONCTIONAL,
    USER_TYPES_INTERNAL,
    USER_TYPES_TECHNICAL,
    USER_TYPES_TEST,
    USER_TYPES_SERVICE,
    USER_TYPES_FAKE
] as const;

type OutputUserType = 'ServiceAccount' | 'TestAccount' | 'BountyAccount' | 'Customer'  | 'Internal'
export type UserTypeKeys = typeof USER_TYPES_KEYS[number] | typeof ACCOUNT_USER_TYPES[number]['id'] | OutputUserType;

export function IS_INTERNAL_USER_TYPES(input: string): boolean {
    switch (input) {
        case USER_TYPES_ADMINISTRATOR:
        case USER_TYPES_CONTRACTOR:
        case USER_TYPES_FONCTIONAL:
        case USER_TYPES_INTERNAL:
        case USER_TYPES_TECHNICAL:
            return true;
        default:
            return false;
    }
}

export function IS_ACCOUNT(usertype: string, username: string): boolean {
    if (isStringAssigned(usertype)) {
        switch (usertype) {
            case USER_TYPES_SERVICE:
            case USER_TYPES_TEST:
            case USER_TYPES_BOUNTY:
                return true;
            default:
                return false;
        }
    }
    if (isStringAssigned(username)) {
        return username.endsWith(TEST_LOGING_DOMAIN)
            || username.endsWith(BOUNTY_LOGING_DOMAIN)
            || username.endsWith(SERVICE_LOGING_DOMAIN);
    }
    return false;
}

export function userTypeLabel(input: string): string {
    switch (input) {
        case USER_TYPES_ADMINISTRATOR: return 'Internal Administrator';
        case USER_TYPES_CUSTOMER: return 'Customer';
        case USER_TYPES_CONTRACTOR: return 'Internal Contractor';
        case USER_TYPES_FONCTIONAL: return 'Internal Fonctional';
        case USER_TYPES_INTERNAL: return 'Internal';
        case USER_TYPES_TECHNICAL: return 'Internal Technical';
        case USER_TYPES_BOUNTY: return 'Bounty';
        case USER_TYPES_TEST: return 'Test';
        case USER_TYPES_SERVICE: return 'Service';
        case USER_TYPES_FAKE: return 'Fake user';
        default:
            return input;
    }
}

export const S_USERTYPE = new Tstring({
    type: 'string',
    title: 'S_USERTYPE',
    minlength: 1,
    maxlength: 1,
    enum: USER_TYPES_KEYS.slice(),
    default: 'S'
});
