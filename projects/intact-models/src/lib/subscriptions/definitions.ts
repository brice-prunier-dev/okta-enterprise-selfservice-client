import type { OidData, LabelData, DescriptionData } from 'joe-models';
import { OidDef, LabelDef, DescriptionDef } from 'joe-models';
import { t } from 'joe-types';
import { ObjectDef, Tobject } from 'joe-fx';


/**
 * {
 *   oid, label, description, admins?
 * }
 */
export interface ItemDefData extends OidData, LabelData, DescriptionData {
    admins?: string[];
}

/**
 * {
 *   oid, label, description, admins?
 * }
 */
export const ItemDefDef: ObjectDef<ItemDefData> = {
    type: 'object',
    title: 'itemdef_type',
    extends: [ OidDef, LabelDef, DescriptionDef ],
    properties: {
        admins: t.array.of( t.string.id ),
    },
    required: [ ...OidDef.required, ...LabelDef.required, ...DescriptionDef.required ],
    index: { id: 'oid', sort: 'label' }
};
/**
 * {
 *   oid, label, description, admins?
 * }
 */
export const ItemDefType: Tobject<ItemDefData> = t.object.as<ItemDefData>( ItemDefDef );


