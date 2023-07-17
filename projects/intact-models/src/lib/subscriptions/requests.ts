import { t } from 'joe-types';
import { ObjectDef, Tobject } from 'joe-fx';
import { InternalUserProfileDef } from '../user-profiles/internal';
import { UserProfileData } from '../user-profiles/common';

/**
 * {
 *   date, user
 * }
 */
export interface SubscriptionRequestData {
    date: string;
    user: UserProfileData;
}

/**
 * {
 *   date, user
 * }
 */
export const SubscriptionRequestDef: ObjectDef<SubscriptionRequestData> = {
    type: 'object',
    title: 'subrequest_type',
    properties: {
        date: t.string.datetime_iso,
        user: InternalUserProfileDef
    },
    required: [ 'date', 'user' ],
    index: { id: 'date', sort: 'date' }
};
/**
 * {
 *   date, user
 * }
 */
export const SubscriptionRequestType: Tobject<SubscriptionRequestData> = t.object.as<SubscriptionRequestData>( SubscriptionRequestDef );


