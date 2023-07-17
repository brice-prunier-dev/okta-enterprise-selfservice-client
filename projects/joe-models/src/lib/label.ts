import { Tobject, ObjectDef } from 'joe-fx';
import { t } from 'joe-types';

//
// ─── LABEL ───────────────────────────────────────────────────────────────────────
//

/**
 * { label }
 */
export interface LabelData {
    label: string;
}

/**
 * { label }
 */
export const LabelDef: Tobject<LabelData> = t.object.as({
    type: 'object',
    title: 'label_def',
    properties: {
        label: t.string.comment
    },
    required: ['label']
});

//
// ─── Description ───────────────────────────────────────────────────────────────────────
//

/**
 * { label, desc }
 */
export interface DescriptionData {
    description: string | undefined;
}
/**
 * { desc }
 */
export const DescriptionDef: ObjectDef<DescriptionData> = {
    type: 'object',
    title: 'Description',
    required: [],
    properties: {
        description: t.string.text
    }
};
