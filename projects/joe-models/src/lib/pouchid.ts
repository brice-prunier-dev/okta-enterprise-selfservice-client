import { ObjectDef } from 'joe-fx';
import { t } from 'joe-types';

//
// ─── STRID ────────────────────────────────────────────────────────────────────────
//

/**
 * { _id }
 */
export interface PouchIdData {
    _id: string;
}
/**
 * { _id }
 */
export const PouchIdDef: ObjectDef<PouchIdData> = {
    type: 'object',
    title: 'PouchId',
    properties: {
        _id: t.string.id
    },
    required: ['_id'],
    index: { id: '_id' }
};
