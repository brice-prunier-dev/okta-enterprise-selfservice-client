import type { LabelData } from 'joe-models';
import { LabelDef } from 'joe-models';
import { t } from 'joe-types';
import { ObjectDef, Tobject, Objview, IViewElement, Setview, readPath } from 'joe-fx';
import { ResourceLinkDef, ResourceLinkData } from './common.model';
import { AppLinkData } from './app-lnk.model';

export interface GroupLinkData extends ResourceLinkData, LabelData {
    fixed: boolean | undefined;
    subs?: string[];
}

export const GroupLinkDef: ObjectDef<GroupLinkData> = {
    type: 'object',
    title: 'grouplink_type',
    extends: [ResourceLinkDef, LabelDef],
    properties: {
        fixed: t.bool._,
        subs: t.array.of(t.string.id)
    },
    required: [...ResourceLinkDef.required],
    index: { id: 'oid', sort: 'label' }
};
/**
 * { oid, label }
 */
export const GroupLinkType: Tobject<GroupLinkData> = t.object.as(GroupLinkDef);

// export const ItemTypeCollection: joe.Tarray = t.array.of( OitemType );
export class GroupLinkView extends Objview<GroupLinkData> implements GroupLinkData {
    declare oid: string;
    declare fixed: boolean | undefined;
    declare label: string;
    declare description: string;
    declare admins: Setview<string>;
    declare subs: Setview<string>;
    constructor(entity?: any, parent?: IViewElement) {
        super(GroupLinkType, entity, parent);
    }
    adminGroups(): ResourceLinkData[] {
        const result = [] as ResourceLinkData[];
        this.admins.forEach((id) => result.push(readPath(this, '$>groups>(' + id + ')')));
        return result;
    }

    apps(): AppLinkData[] {
        const oid = this.oid;
        const result = readPath(this, '$>apps') as AppLinkData[];
        return result.filter((a) => a.groups.includes(oid));
    }

    get isAudienceGroup(): boolean {
        return this.oid === GEM_GroupData.oid || this.oid === ENGIE_GroupData.oid;
    }
}
GroupLinkType.viewctor = GroupLinkView;

export const ENGIE_GroupData: GroupLinkData = {
    oid: 'b2e',
    fixed: true,
    label: 'ENGIE',
    description: 'Engie employees',
    admins: [],
    subs: []
};

export const GEM_GroupData: GroupLinkData = {
    oid: 'gem',
    fixed: true,
    label: 'GEM',
    description: 'GEM employees',
    admins: [],
    subs: []
};
