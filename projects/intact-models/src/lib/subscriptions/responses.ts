import { t } from 'joe-types';
import { ObjectDef, Tobject } from 'joe-fx';
import { SubscriptionRequestDef, SubscriptionRequestData } from './requests';

export enum SubscriptionStatus {
    Active = 'active',
    Validated = 'validated',
    Rejected = 'rejected',
    Canceled = 'canceled'
}

const t_s_SUB_STATUS = t.string.id.extendAs('S_SUB_STATUS_type', {
    type: 'string',
    enum: [ 'active', 'validated', 'rejected', 'canceled' ]
} );

export enum SubscriptionAction {
    Validated = 'validated',
    Rejected = 'rejected',
    Canceled = 'canceled'
}
const t_s_SUB_ACTION = t.string.id.extendAs('S_SUB_ACTION_type', {
    type: 'string',
    enum: [ 'validated', 'rejected', 'canceled' ]
} );
/**
 * {
 *   date, user
 * }
 */
export interface SubscriptionResponseData extends SubscriptionRequestData {
    action: SubscriptionAction;
    comment: string;
}

/**
 * {
 *   date, user
 * }
 */
export const SubscriptionResponseDef: ObjectDef<SubscriptionResponseData> = {
    type: 'object',
    title: 'subrespond_type',
    extends: [ SubscriptionRequestDef ],
    properties: {
        action: t_s_SUB_ACTION,
        comment: t.string.smalltext
    },
    required: [ 'date', 'user' ],
    index: { id: 'date', sort: 'date' }
};
/**
 * {
 *   date, user
 * }
 */
export const SubscriptionResponseType: Tobject<SubscriptionResponseData> = t
    .object.as<SubscriptionResponseData>( SubscriptionResponseDef );


