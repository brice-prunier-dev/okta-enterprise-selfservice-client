import { ObjectDef, Tobject, Objview, IViewElement, isStringAssigned } from 'joe-fx';
import { S_External_MAIL, S_USERTYPE, S_LANG, S_LOCALE, LANG_KEYS, UserTypeKeys } from './types';
import { t } from 'joe-types';
import { UserProfileData } from './common';

/**
 * {
 *   login, firstName, lastName, email, locale,  preferredLanguage,
 *   accountId, legalEntityId, locationId, isInternal
 * }
 */
const ExternalUserProfileDef: ObjectDef<UserProfileData> = {
    type: 'object',
    title: 'external_user_profile_type',
    properties: {
        login: S_External_MAIL,
        firstName: t.string.name,
        lastName: t.string.name,
        email: S_External_MAIL,
        secondEmail: S_External_MAIL,
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
 *   login, firstName, lastName, email, locale,  preferredLanguage,
 *   accountId, legalEntityId, locationId, isInternal
 * }
 */
export let ExternalUserProfileType: Tobject<UserProfileData> =
    t.object.as<UserProfileData>(ExternalUserProfileDef);

// ────────────────────────────────────────────────────────────────────────────────
/**
 * {
 *   login, firstName, lastName, email, locale,  preferredLanguage,
 *   accountId, legalEntityId, locationId, isInternal,
 *   lang
 * }
 */
export class ExternalUserProfileView extends Objview<UserProfileData> implements UserProfileData {
    constructor(entity?: any, parent?: IViewElement) {
        super(ExternalUserProfileType, entity, parent);
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
ExternalUserProfileType.viewctor = ExternalUserProfileView;
