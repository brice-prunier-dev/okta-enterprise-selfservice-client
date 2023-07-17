import { ObjectDef, Tobject, isStringAssigned, Objview, IViewElement } from 'joe-fx';
import { S_USERTYPE, S_LANG, S_LOCALE, S_ENGIE_MAIL, S_SERVICE_LOGIN, LANG_KEYS, UserTypeKeys } from './types';
import { t } from 'joe-types';
import { UserProfileData } from './common';

const ServiceUserProfileDef: ObjectDef<UserProfileData> = {
    type: 'object',
    title: 'service_user_profile_type',
    properties: {
        login: S_SERVICE_LOGIN,
        firstName: t.string.name,
        lastName: t.string.name,
        email: S_ENGIE_MAIL,
        secondEmail: t.string.email,
        userType: S_USERTYPE,
        locale: S_LOCALE,
        preferredLanguage: S_LANG,
        accountId: t.string.word,
        legalEntityId: t.string.word,
        locationId: t.string.word
    },
    required: ['login', 'firstName', 'lastName', 'email', 'userType'],
    index: { id: 'login', sort: ['.>lastName', '.>firstName'] }
};

// ────────────────────────────────────────────────────────────────────────────────
/**
 * {
 *   login, firstName, lastName, email, locale,  mobilePhone,  secondEmail
 * }
 */
export let ServiceUserProfileType: Tobject<UserProfileData> =
    t.object.as<UserProfileData>(ServiceUserProfileDef);

// ────────────────────────────────────────────────────────────────────────────────
/**
 * {
 *   login, firstName, lastName, email, locale,  preferredLanguage,
 *   accountId, legalEntityId, locationId, isInternal
 * }
 */
export class ServiceUserProfileView extends Objview<UserProfileData> implements UserProfileData {
    constructor(entity?: any, parent?: IViewElement) {
        super(ServiceUserProfileType, entity, parent);
    }
    declare login: string;
    declare firstName: string;
    declare lastName: string;
    declare email: string;
    declare secondEmail: string;
    declare userType: UserTypeKeys;
    declare locale: string | undefined;
    declare preferredLanguage: string | undefined;
    declare accountId: string | undefined;
    declare legalEntityId: string | undefined;
    declare locationId: string | undefined;
    declare isInternal: boolean;
    get lang(): string | undefined {
        return isStringAssigned(this.locale)
            ? this.locale?.substring(0, 2)
            : isStringAssigned(this.preferredLanguage)
            ? this.preferredLanguage?.substring(0, 2)
            : undefined;
    }
    set lang(input: string | undefined) {
        if (input && input.length === 2) {
            const key = input.toLowerCase();
            if (LANG_KEYS.includes(key)) {
                this.locale = `${key}_${key.toUpperCase()}`;
                this.preferredLanguage = `${key}-${key}`;
            }
        }
    }
}
ServiceUserProfileType.viewctor = ServiceUserProfileView;
