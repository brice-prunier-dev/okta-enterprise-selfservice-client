import { ObjectDef } from 'joe-fx';
import { t } from 'joe-types';

//
// ─── OID ────────────────────────────────────────────────────────────────────────
//

/**
 * { oid }
 */
export interface OidData {
    oid: string;
}

export const OidDef: ObjectDef<OidData> = {
    type: 'object',
    title: 'Oid',
    properties: {
        oid: t.string.id
    },
    required: ['oid'],
    index: { id: 'oid' }
};

//
// ───---────────────────────────────────────────────────────────────────────────
//
