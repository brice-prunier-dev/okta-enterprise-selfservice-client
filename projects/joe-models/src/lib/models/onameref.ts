import { IViewElement, ObjectDef, Objview, Tobject } from 'joe-fx';
import { t } from 'joe-types';
import { NameData, NameDef } from '../name';
import { OidData, OidDef } from '../oid';

//
// ─── ITEM ───────────────────────────────────────────────────────────────────────
//

/**
 * { id, name } interface for reference/description pair
 */
export interface OnameRefData extends OidData, NameData {}

export const OnameRefDef: ObjectDef<OnameRefData> = {
    type: 'object',
    title: 'OnameRef',
    extends: [OidDef, NameDef],
    properties: {},
    required: [...OidDef.required, ...NameDef.required],
    index: { id: 'oid', sort: ['$>name'] }
};
/**
 * { id, name }
 */
export const OnameRefType: Tobject<OnameRefData> = t.object.as(OnameRefDef);

// export const OnameRefTypeCollection: joe.Tarray = t.array.of( OnameRefType );
export class OnameRefView extends Objview<OnameRefData> implements OnameRefData {
    declare public oid: string;
    declare public name: string;
    constructor(entity?: any, parent?: IViewElement) {
        super(OnameRefType, entity, parent);
    }
}
OnameRefType.viewctor = OnameRefView;
