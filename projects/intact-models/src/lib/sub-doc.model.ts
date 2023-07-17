import { SubscriptionResponseData, SubscriptionResponseDef } from './subscriptions/responses';
import { ProjectItemData, ProjectItemDef } from './subscriptions/projectitem';
import { SubscriptionRequestData, SubscriptionRequestDef } from './subscriptions/requests';
import { ObjectDef, Tobject } from 'joe-fx';
import { t } from 'joe-types';
import type { IdData } from 'joe-models';
import { IdDef } from 'joe-models';

export const SUBS_TYPEDEF = 'subscription';
export const SUBS_STORE = 'subscriptions';
export const SUBS_ID = '.>profile>name';
export const SUBS_REV = '.>request>[0]>date';

export interface ClaimData {
    key: string | undefined;
}

export interface SubscriptionDocData extends IdData {
    env: string;
    status: string;
    requests: SubscriptionRequestData[];
    responses: SubscriptionResponseData[];
    what: ProjectItemData;
    target: ProjectItemData;
    claim?: ClaimData;
}

/**
 * {
 *   id, env, status, requests, responses, what, target,
 * }
 */
export const SubscriptionDocDef: ObjectDef<SubscriptionDocData> = {
    type: 'object',
    title: SUBS_TYPEDEF,
    extends: [IdDef],
    properties: {
        env: t.string.id,
        status: t.string.id,
        requests: t.array.of<SubscriptionRequestData>(SubscriptionRequestDef),
        responses: t.array.of<SubscriptionResponseData>(SubscriptionResponseDef),
        what: ProjectItemDef,
        target: ProjectItemDef
    },
    required: [...IdDef.required, 'env', 'status', 'requests', 'responses', 'what', 'target']
};

/**
 * {
 *   id, lastUpdated, status, created, activiated, statusChanged, lastLogin,
 *   passwordChanged, profile, groupIds
 * }
 */
export const SubscriptionDocType: Tobject<SubscriptionDocData> =
    t.object.as<SubscriptionDocData>(SubscriptionDocDef);
