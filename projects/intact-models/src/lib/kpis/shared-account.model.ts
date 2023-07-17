import { ObjectDef, Tobject } from 'joe-fx';
import { t } from 'joe-types';



//
// ─── INFRA ──────────────────────────────────────────────────────────────────────
//

export const SHARED_ACCOUNT_TYPEDEF = 'sharedaccount';
/**
 * {
 *  id, lastUpdated?
 *  status, name, label
 * }
 */
export interface SharedAccountData {
    date: string;
    ipCount: number;
    login: string;
    clientId: string;
}

/**
 * {
 *  id, lastUpdated?
 *  status, name, label
 * }
 */
export const SharedAccountDef: ObjectDef<SharedAccountData> = {
    type: 'object',
    title: SHARED_ACCOUNT_TYPEDEF,
    properties: {
        date: t.string.date_iso,
        ipCount: t.number.int,
        login: t.string.email,
        clientId: t.string.name,
    },
    required: [ 'date', 'ipCount', 'login', 'clientId' ],
};

export const SharedAccountType = new Tobject(SharedAccountDef);
