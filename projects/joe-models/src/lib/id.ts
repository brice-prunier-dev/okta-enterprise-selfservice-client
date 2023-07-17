import { ObjectDef } from 'joe-fx';
import { t } from 'joe-types';

//
// ─── STRID ────────────────────────────────────────────────────────────────────────
//

/**
 * { id }
 */
export interface IdData {
    id: string;
}
/**
 * { id }
 */
export const IdDef: ObjectDef<IdData> = {
    type: 'object',
    title: 'Id',
    properties: {
        id: t.string.id
    },
    required: ['id'],
    index: { id: 'id' }
};
