import { JsonObj, OType } from 'joe-fx';
import { Tobject, Txobject, XObjectDef } from 'joe-fx';
import {IS_INTERNAL} from './user-doc.model';
import {
    USER_TYPES_TEST,
    USER_TYPES_SERVICE,
    UserProfileData,
    TestUserProfileType,
    ServiceUserProfileType,
    InternalUserProfileType,
    ExternalUserProfileType,
    ExternalUserProfileView,
    InternalUserProfileView,
    TestUserProfileView,
    ServiceUserProfileView,
    USER_TYPES_BOUNTY,
    BountyUserProfileType
} from './user-profiles';

// ────────────────────────────────────────────────────────────────────────────────

const XUserProfileDef: XObjectDef<UserProfileData> = {
    type: 'xobject',
    title: 'user_profile_type',
    extends: [
        TestUserProfileType as OType<UserProfileData>,
        TestUserProfileType as OType<UserProfileData>,
        InternalUserProfileType as OType<UserProfileData>,
        ExternalUserProfileType as OType<UserProfileData>
    ],
    getType(profile: UserProfileData): OType<UserProfileData> {
        const profileUserType = profile?.userType;
        if (profileUserType) {
            switch (profileUserType) {
                case USER_TYPES_TEST:
                    return TestUserProfileType as OType<UserProfileData>;
                case USER_TYPES_SERVICE:
                    return ServiceUserProfileType as OType<UserProfileData>;
                case USER_TYPES_BOUNTY:
                    return BountyUserProfileType as OType<UserProfileData>;
            }
        }
        if (IS_INTERNAL(profile )) {
            return InternalUserProfileType as OType<UserProfileData>;
        }
        else {
            return ExternalUserProfileType as OType<UserProfileData>;
        }
        // throw new Error(
        //     profileUserType
        //         ? 'No user valid type ("' + profileUserType + '")!'
        //         : 'No isInternal property!'
        // );
    },

    getIndexObjFromValue(value: any): JsonObj {
        return { login: value.login };
    }
};

export const XUserProfileType = new Txobject(XUserProfileDef);

export type UserProfileView =
    | ExternalUserProfileView
    | InternalUserProfileView
    | TestUserProfileView
    | ServiceUserProfileView;
