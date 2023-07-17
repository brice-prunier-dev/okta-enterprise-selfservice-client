import { ObjectDef } from 'joe-fx';
import { t } from 'joe-types';
import { DescriptionData, DescriptionDef } from '../label';
import { NameRefData, NameRefDef } from './nameref';

//
// ─── ITEM WITH DESC ───────────────────────────────────────────────────────────────────
//


/**
 * {
 *  id, name,
 *  desc
 * }
 */
export interface NameWithDescRefData extends NameRefData, DescriptionData {
}

export const NameWithDescRefDef: ObjectDef<NameWithDescRefData> = {
    type: 'object',
    title: 'NameWithDescRef',
    extends: [ t.object.as(NameRefDef), t.object.as(DescriptionDef) ],
    required: [ ...NameRefDef.required, ...DescriptionDef.required ],
    properties: {},
};
