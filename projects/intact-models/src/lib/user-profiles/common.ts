import type { UserTypeKeys } from './types';

/**
 * {
 *   login, firstName, lastName, email, userTypes
 * }
 */
export interface UserPayloadData {
    login: string;
    firstName: string;
    lastName: string;
    email: string;
    userType: UserTypeKeys;
    application?: string;
    groups?: string[];
}

/**
 * {
 *   login, firstName, lastName, email, userType, locale,  preferredLanguage,
 *   accountId, legalEntityId, locationId, isInternal
 * }
 */
export interface UserProfileData extends UserPayloadData {
    locale: string | undefined;
    preferredLanguage: string | undefined;
    accountId: string | undefined;
    legalEntityId: string | undefined;
    locationId: string | undefined;
    secondEmail: string;
}
