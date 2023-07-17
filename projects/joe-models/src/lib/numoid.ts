import { ObjectDef } from 'joe-fx';
import { t } from 'joe-types';

//
// ─── OID ────────────────────────────────────────────────────────────────────────
//

/**
 * { oid }
 */
export interface NumOidData {
    oid: number;
}
/**
 * { oid }
 */
export const NumOidDef: ObjectDef<NumOidData> = {
    type: 'object',
    title: 'NumOid',
    properties: {
        oid: t.number.double
    },
    required: ['oid'],
    index: { id: 'oid' }
};

//
// ───---────────────────────────────────────────────────────────────────────────
//
