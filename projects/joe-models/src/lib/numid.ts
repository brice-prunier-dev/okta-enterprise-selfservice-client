import { ObjectDef } from 'joe-fx';
import { t } from 'joe-types';

//
// ─── NUMID ────────────────────────────────────────────────────────────────────────
//

/**
 * { numid }
 */
export interface NumIdData {
    id: number;
}
/**
 * { numid }
 */
export const NumIdDef: ObjectDef<NumIdData> = {
    type: 'object',
    title: 'NumId',
    properties: {
        id: t.number.int_0
    },
    required: ['id'],
    index: { id: 'id' }
};

//
// ───---────────────────────────────────────────────────────────────────────────
//
