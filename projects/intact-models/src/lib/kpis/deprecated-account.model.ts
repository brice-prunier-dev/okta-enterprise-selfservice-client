import { ObjectDef, Tobject } from 'joe-fx';
import { t } from 'joe-types';
import { GroupDocData, GroupDocDef } from '../group-doc.model';
import { UserDocData, UserDocDef } from '../user-doc.model';



//
// ─── INFRA ──────────────────────────────────────────────────────────────────────
//

export const DEPRECATED_ACCOUNT_TYPEDEF = 'deprecatedaccount';
/**
 * {
 *  id, lastUpdated?
 *  status, name, label
 * }
 */
export interface DeprecatedAccountData {
    account: UserDocData
    accountOwner?: UserDocData
    groups: GroupDocData[]
}

/**
 * {
 *  id, lastUpdated?
 *  status, name, label
 * }
 */
export const DeprecatedAccountDef: ObjectDef<DeprecatedAccountData> = {
    type: 'object',
    title: DEPRECATED_ACCOUNT_TYPEDEF,
    properties: {
        account: UserDocDef,
        accountOwner: UserDocDef,
        groups: t.array.of(GroupDocDef)
    },
    required: [ 'account', 'groups' ],
};

export const DeprecatedAccountType = new Tobject(DeprecatedAccountDef);
