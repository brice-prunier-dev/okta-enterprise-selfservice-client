import { asArray, asObject, IViewElement, ObjectDef, Objview, Tobject, PATH_NEXT } from 'joe-fx';
import { LabelData, LabelDef } from '../label';
import { t } from 'joe-types';
import { NumOidData, NumOidDef } from '../numoid';

//
// ─── NUMITEM ───────────────────────────────────────────────────────────────────────
//

/**
 * {
 *  oid,
 *  label
 * }
 */
export interface OnumItemData extends NumOidData, LabelData {}
export const OnumItemDef: ObjectDef<OnumItemData> = {
    type: 'object',
    title: 'NumItem',
    extends: [NumOidDef, LabelDef],
    properties: {},
    required: [...NumOidDef.required, ...LabelDef.required],
    index: { id: 'oid', sort: '->label' }
};
/**
 * {
 *  oid,
 *  label
 * }
 */
export const OnumItemType: Tobject<OnumItemData> = t.object.as<OnumItemData>(OnumItemDef);

/**
 * {
 *  oid,
 *  label
 * }
 */
export class OnumItemView extends Objview<OnumItemData> implements OnumItemData {
    public static treePath(item: Objview & OnumItemData, depth: number = 10): string {
        let current: any = item;
        let oid = '' + item.oid;
        let parent = item.$parent() as Objview & OnumItemData;
        while (parent !== current && depth > 0) {
            if (asArray(parent)) {
                depth--;
                current = parent;
                parent = current.$parent() as Objview & OnumItemData;
            } else if (asObject(parent) && parent.oid) {
                current = parent;
                oid = '' + parent.oid + PATH_NEXT + oid;
                parent = current.$parent() as Objview & OnumItemData;
            } else {
                return oid;
            }
        }
        return oid;
    }
    declare public oid: number;
    declare public label: string;
    constructor(entity?: any, parent?: IViewElement) {
        super(OnumItemType, entity, parent);
    }
}
OnumItemType.viewctor = OnumItemView;
