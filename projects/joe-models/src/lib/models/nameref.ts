import { IViewElement, ObjectDef, Objview, Tobject } from 'joe-fx';
import { NameData, NameDef } from '../name';
import { t } from 'joe-types';
import { IdData, IdDef } from '../id';
//
// ─── ITEM ───────────────────────────────────────────────────────────────────────
//

/**
 * { id, name } interface for reference/description pair
 */
export interface NameRefData extends IdData, NameData {}

export const NameRefDef: ObjectDef<NameRefData> = {
    type: 'object',
    title: 'NameRef',
    extends: [IdDef, NameDef],
    properties: {},
    required: [...IdDef.required, ...NameDef.required],
    index: { id: 'id', sort: ['$>name'] }
};
/**
 * { id, name }
 */
export const NameRefType: Tobject<NameRefData> = t.object.as(NameRefDef);

// export const NameRefTypeCollection: joe.Tarray = t.array.of( NameRefType );
export class NameRefView extends Objview<NameRefData> implements NameRefData {
    declare id: string;
    declare name: string;
    constructor(entity?: any, parent?: IViewElement) {
        super(NameRefType, entity, parent);
    }
}
NameRefType.viewctor = NameRefView;

// tslint:disable-next-line: variable-name
export const NULL_NAMEREFATA: NameRefData = { id: '', name: '' };
