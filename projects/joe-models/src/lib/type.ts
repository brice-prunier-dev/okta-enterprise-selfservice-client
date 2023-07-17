import { ObjectDef } from 'joe-fx';
import { t } from 'joe-types';

//
// ─── TYPE ───────────────────────────────────────────────────────────────────────
//

/**
 * {
 *  kind
 * }
 */
export interface TypeData {
    type: string;
}
/**
 * {
 *  kind
 * }
 */
export const TypeDef: ObjectDef<TypeData> = {
    type: 'object',
    title: 'Type',
    properties: {
        type: t.string.name
    },
    required: ['type']
};

//
// ───---────────────────────────────────────────────────────────────────────────
//
