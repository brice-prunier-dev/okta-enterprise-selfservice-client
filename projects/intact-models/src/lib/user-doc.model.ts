import { Tobject, Objview, Setview, ObjectDef, isBlank } from 'joe-fx';
import { t, pascalCase } from 'joe-types';
import {
    UserProfileData,
    USER_TYPES_TEST,
    USER_TYPES_CUSTOMER,
    USER_TYPES_BOUNTY,
    IS_ACCOUNT,
    UserPayloadData,
    IS_INTERNAL_USER_TYPES,
    S_GAIA_LOGIN
} from './user-profiles';
import { XUserProfileType, UserProfileView } from './user-profile.types';

export type UserStatus = 'ACTIVE' | 'PROVISIONED' | 'SUSPENDED' | 'STAGED';

//
// ─── INFRA ──────────────────────────────────────────────────────────────────────
//

export const USER_TYPEDEF = 'user';
export const USERS_STORE = 'users';
export const AZURE_SOURCE = 'az';
export const USER_ID = '.>profile>login';
export const USER_REV = 'lastUpdated';
/**
 * {
 *   id, lastUpdated, status, created, activiated, statusChanged, lastLogin,
 *   passwordChanged, profile, groupIds
 * }
 */
export interface UserDocData {
    statusChanged?: string;
    lastUpdated?: string;
    status: UserStatus;
    created: string;
    activated: string;
    lastLogin: string;
    profile: UserProfileData;
    groupNames: string[];
    b2e?: boolean;
    _canBeAdded_?: boolean;
}

export interface AssignStatus {
    login: string;
    group: string;
    status: string;
    message: string;
}

/**
 * {
 *   id, lastUpdated, status, created, activiated, statusChanged, lastLogin,
 *   passwordChanged, profile, groupNames
 * }
 */
export const UserDocDef: ObjectDef = {
    type: 'object',
    title: USER_TYPEDEF,
    properties: {
        b2e: t.bool._,
        statusChanged: t.string.datetime_iso,
        lastUpdated: t.string.datetime_iso,
        status: t.string.word,
        created: t.string.datetime_iso,
        activated: t.string.datetime_iso,
        lastLogin: t.string.datetime_iso,
        profile: XUserProfileType,
        groupNames: t.array.of(t.string.id)
    },
    required: ['profile', 'groupNames'],
    index: { id: USER_ID, sort: ['.>profile>lastName', '.>profile>firstName'] }
};

/**
 * {
 *   id, lastUpdated, status, created, activiated, statusChanged, lastLogin,
 *   passwordChanged, profile, groupIds
 * }
 */
export const UserDocType: Tobject<UserDocData> = t.object.as(UserDocDef);

export class UserDocView extends Objview<UserDocData> implements UserDocData {
    public static IS_PROVISIONED(usr: UserDocData): boolean {
        return usr.status === 'PROVISIONED';
    }
    public static IS_STAGED(usr: UserDocData): boolean {
        return usr.status === 'STAGED';
    }
    public static IS_INACTIVE(usr: UserDocData): boolean {
        return UserDocView.IS_PROVISIONED(usr) || UserDocView.IS_STAGED(usr);
    }

    public static userLabel(user: UserDocData): string {
        return isBlank(user.profile.firstName) && isBlank(user.profile.lastName)
            ? isBlank(user.profile.login)
                ? '?'
                : user.profile.login
            : pascalCase(user.profile.firstName || '') +
                  ' ' +
                  pascalCase(user.profile.lastName || '');
    }
    constructor(entity: UserDocData) {
        super(UserDocType, entity, undefined);
    }
    declare b2e?: boolean;
    declare status: 'ACTIVE' | 'PROVISIONED' | 'SUSPENDED';
    declare created: string;
    declare statusChanged?: string;
    declare activated: string;
    declare lastLogin: string;
    declare lastUpdated: string;
    declare profile: UserProfileView;
    declare groupNames: Setview<string>;
    asPayloadData(): UserPayloadData {
        return IS_ACCOUNT(this.profile.userType, this.profile.login)
            ? {
                  login: this.profile.login.substring(0, this.profile.login.indexOf('@')),
                  firstName: this.profile.firstName,
                  lastName: this.profile.lastName,
                  email:
                      this.profile.userType === USER_TYPES_BOUNTY
                          ? this.profile.secondEmail
                          : this.profile.email,
                  userType:
                      this.profile.userType === USER_TYPES_BOUNTY
                          ? 'BountyAccount'
                          : this.profile.userType === USER_TYPES_TEST
                          ? 'TestAccount'
                          : 'ServiceAccount'
              }
            : {
                  login: this.profile.login,
                  firstName: this.profile.firstName,
                  lastName: this.profile.lastName,
                  email: this.profile.email,
                  userType: this.profile.userType === USER_TYPES_CUSTOMER ? 'Customer' : 'Internal'
              };
    }

    public get isAccount() {
        return IS_ACCOUNT(this.profile.userType, this.profile.login);
    }

    public get isActive() {
        return this.status == 'ACTIVE' || this.status == 'PROVISIONED';
    }

    public get isSuspended() {
        return this.status == 'SUSPENDED';
    }

    public get isExternal(): boolean {
        return this.profile.userType === USER_TYPES_CUSTOMER;
    }
    public get isInternal(): boolean {
        return IS_INTERNAL_USER_TYPES(this.profile.userType);
    }
}


export function IS_INTERNAL(profile: UserProfileData)
{
    return !S_GAIA_LOGIN.validate(profile.login).withError();
}
