import { ObjectDef, Tarray, Tobject, Objview, IViewElement, JsonObj } from 'joe-fx';
import { t } from 'joe-types';
import { GroupProfileData, GroupProfileType, GroupProfileView } from './group-profile.model';

//
// ─── INFRA ──────────────────────────────────────────────────────────────────────
//

export const GROUP_TYPEDEF = 'group';
export const GROUP_STORE = 'groups';
export const GROUP_ID = '.>profile>name';
export const GROUP_REV = 'lastUpdated';
export const GROUP_ME_ID = '_me_';

/**
 * {
 *   id, created, lastUpdated, lastMembershipUpdated, profile
 * }
 */
export interface GroupDocData {
    created: string;
    lastUpdated: string;
    lastMembershipUpdated: string | undefined;
    profile: GroupProfileData;
}

/**
 * {
 *   id, created, lastUpdated, lastMembershipUpdated, profile
 * }
 */
export const GroupDocDef: ObjectDef = {
    type: 'object',
    title: GROUP_TYPEDEF,
    properties: {
        lastUpdated: t.string.datetime_iso,
        created: t.string.datetime_iso,
        lastMembershipUpdated: t.string.datetime_iso,
        profile: GroupProfileType
    },
    required: ['profile'],
    index: { id: GROUP_ID, sort: GROUP_ID }
};
/**
 * {
 *   id, created, lastUpdated, lastMembershipUpdated, profile
 * }
 */
export const GroupDocType: Tobject<GroupDocData> = t.object.as<GroupDocData>(GroupDocDef);
/**
 * [ {
 *   id, created, lastUpdated, lastMembershipUpdated, profile
 * } ]
 */
export const GroupDocTypeCollection: Tarray<GroupDocData> = t.array.of<GroupDocData>(GroupDocType);

export class GroupDocView extends Objview<GroupDocData> implements GroupDocData {
    constructor(entity?: any, parent?: IViewElement) {
        super(GroupDocType, entity, parent);
    }
    declare created: string;
    declare lastUpdated: string;
    declare lastMembershipUpdated: string | undefined;
    declare profile: GroupProfileView;

    public declare projectId: string | undefined;
    public declare applicationId: string | undefined;
    public declare adminGroups: string[];
    public json(): JsonObj {
        return {
            project: this.projectId || null,
            application: this.applicationId || null,
            name: this.profile.name,
            description: this.profile.description,
            admin_groups: this.adminGroups
        };
    }
}
GroupDocType.viewctor = GroupDocView;
