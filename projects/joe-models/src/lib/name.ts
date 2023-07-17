import { Tobject, ObjectDef } from 'joe-fx';
import { t } from 'joe-types';

//
// ─── LABEL ───────────────────────────────────────────────────────────────────────
//

/**
 * { name }
 */
export interface NameData {
    name: string;
}

/**
 * { name }
 */
export const NameDef: Tobject<NameData> = t.object.as({
    type: 'object',
    title: 'Name',
    properties: {
        name: t.string.name
    },
    required: ['name']
});
