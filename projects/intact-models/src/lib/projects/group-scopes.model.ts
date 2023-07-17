import { OitemData, OitemDef } from 'joe-models';
import { t } from 'joe-types';
import { ObjectDef, Tobject, Objview, IViewElement, Setview } from 'joe-fx';

export interface GroupScopesData extends OitemData {
    scopes: string[];
}

export const GroupScopesDef: ObjectDef<GroupScopesData> = {
    type: 'object',
    title: 'groupscopes_type',
    extends: [OitemDef],
    properties: {
        scopes: t.array.of(t.string.id)
    },
    required: [...OitemDef.required, 'scopes'],
    index: { id: 'oid', sort: 'label' }
};
/**
 * { oid, label }
 */
export const GroupScopesType: Tobject<GroupScopesData> = t.object.as(GroupScopesDef);

// export const ItemTypeCollection: joe.Tarray = t.array.of( OitemType );
export class GroupScopesView extends Objview<GroupScopesData> implements GroupScopesData {
    declare oid: string;
    declare label: string;
    declare scopes: Setview<string>;
    constructor(entity?: any, parent?: IViewElement) {
        super(GroupScopesType, entity, parent);
    }
}
GroupScopesType.viewctor = GroupScopesView;
