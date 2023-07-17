import { ObjectDef } from 'joe-fx';
import { t } from 'joe-types';

//
// ─── STRID ────────────────────────────────────────────────────────────────────────
//

/**
 * { _rev }
 */
export interface PouchRevData {
    _rev?: string | undefined;
}
/**
 * { _rev }
 */
export const PouchRevDef: ObjectDef<PouchRevData> = {
    type: 'object',
    title: 'PouchRev',
    properties: {
        _rev: t.string.id
    },
    required: []
};
