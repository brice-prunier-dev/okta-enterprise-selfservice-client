import { IViewElement, ObjectDef, Objview, Tobject } from 'joe-fx';
import { LabelData, LabelDef } from '../label';
import { t } from 'joe-types';
import { OidData, OidDef } from '../oid';
//
// ─── ITEM ───────────────────────────────────────────────────────────────────────
//

/**
 * { oid, label } interface for reference/description pair
 */
export interface OitemData extends OidData, LabelData {}

export const OitemDef: ObjectDef<OitemData> = {
    type: 'object',
    title: 'Item',
    extends: [OidDef, LabelDef],
    properties: {},
    required: [...OidDef.required, ...LabelDef.required],
    index: { id: 'oid', sort: ['$>label'] }
};
/**
 * { oid, label }
 */
export const OitemType: Tobject<OitemData> = t.object.as(OitemDef);

// export const ItemTypeCollection: joe.Tarray = t.array.of( OitemType );
export class OitemView extends Objview<OitemData> implements OitemData {
    declare public oid: string;
    declare public label: string;
    constructor(entity?: any, parent?: IViewElement) {
        super(OitemType, entity, parent);
    }
}
OitemType.viewctor = OitemView;

// tslint:disable-next-line: variable-name
export const NULL_ITEMDATA: OitemData = { oid: '', label: '' };
