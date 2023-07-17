import { IViewElement, ObjectDef, Objview, Tarray, Tobject } from 'joe-fx';
import { t } from 'joe-types';
//
// ─── InfrSystem ─────────────────────────────────────────────────────────────────────
//
export let GroupProfileName = 'group_profile_T';

export interface GroupProfileData {
    name: string;
    description: string;
}

export interface GroupPayloadData extends GroupProfileData {
    project: string;
    application: string;
    admins: string[];
}

/**
 * {
 *   name, description
 * }
 */
const GroupProfileDef: ObjectDef<GroupProfileData> = {
    type: 'object',
    title: GroupProfileName,
    properties: {
        name: t.string.name,
        description: t.string.comment
    },
    required: ['name', 'description'],
    index: { id: 'name', sort: ['.>name'] }
};
/**
 * {
 *   name, description
 * }
 */
export let GroupProfileType: Tobject<GroupProfileData> =
    t.object.as<GroupProfileData>(GroupProfileDef);

/**
 * {
 *   name, description
 * }
 */

export class GroupProfileView extends Objview<GroupProfileData> implements GroupProfileData {
    constructor(entity?: any, parent?: IViewElement) {
        super(GroupProfileType, entity, parent);
    }
    declare public name: string;
    declare public description: string;
}
GroupProfileType.viewctor = GroupProfileView;

export let GroupProfileTypeCollection: Tarray = t.array.of(GroupProfileType);

// ────────────────────────────────────────────────────────────────────────────────
