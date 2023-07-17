import { IViewElement, ObjectDef, Objview, Tobject } from 'joe-fx';
import { t } from 'joe-types';
import { OidData, OidDef } from '../oid';
import { DescriptionData, DescriptionDef } from '../label';
//
// ─── ITEM ───────────────────────────────────────────────────────────────────────
//

/**
 * { oid, description } interface for reference/description pair
 */
export interface OdefinitionData extends OidData {
    description: string;
}

export const OdefinitionDef: ObjectDef<OdefinitionData> = {
    type: 'object',
    title: 'Odefinition',
    extends: [OidDef, DescriptionDef],
    properties: {},
    required: [...OidDef.required, ...DescriptionDef.required],
    index: { id: 'oid', sort: ['$>description'] }
};
/**
 * { oid, description }
 */
export const OdefinitionType: Tobject<OdefinitionData> = t.object.as(OdefinitionDef);

// export const ItemTypeCollection: joe.Tarray = t.array.of( OitemType );
export class OdefinitionView extends Objview<OdefinitionData> implements OdefinitionData {
    declare oid: string;
    declare description: string;
    constructor(entity?: any, parent?: IViewElement) {
        super(OdefinitionType, entity, parent);
    }
}
OdefinitionType.viewctor = OdefinitionView;

// tslint:disable-next-line: variable-name
export const NULL_DESCITEMDATA: OdefinitionData = { oid: '', description: '' };
