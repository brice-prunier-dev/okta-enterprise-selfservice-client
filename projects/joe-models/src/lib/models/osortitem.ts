import { IViewElement, Objview, Tarray, Tobject, ObjectDef } from 'joe-fx';
import { OitemData, OitemType } from './oitem';
import { t } from 'joe-types';

//
// ─── SORTITEM ──────────────────────────────────────────────────────────────────
//

/**
 * { _rev, oid, label, seq }
 */
export interface OsortItemData extends OitemData {
    _rev?: string | undefined;
    seq: number;
    color?: string | undefined;
}

export const OsortItemDef: ObjectDef<OsortItemData> = {
    type: 'object',
    title: 'SortItem',
    extends: [OitemType],
    properties: {
        seq: t.number.uint,
        color: t.string.color
    },
    required: ['seq', ...OitemType.required],
    index: { id: 'oid', sort: ['.>seq, ', '.>label'] }
};

/**
 * { id, _rev, label, seq }
 */
export const OsortItemType: Tobject<OsortItemData> = t.object.as<OsortItemData>(OsortItemDef);

/**
 * { oid, _rev, label, seq }
 */
export const OsortOitemTypeCollection: Tarray = t.array.of<OsortItemData>(OsortItemType);
export class OsortItemView extends Objview<OsortItemData> implements OsortItemData {
    declare public oid: string;
    declare public label: string;
    declare public color?: string | undefined;
    declare public seq: number;
    constructor(entity?: any, parent?: IViewElement) {
        super(OsortItemType, entity, parent);
    }
}
OsortItemType.viewctor = OsortItemView;
