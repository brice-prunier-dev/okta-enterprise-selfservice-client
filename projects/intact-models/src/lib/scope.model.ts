import { ObjectDef, Tobject } from 'joe-fx';
import { t } from 'joe-types';

export const SCOPE_TYPEDEF = 'scope';
export const SCOPE_STORE = 'scopes';
export const SCOPE_ID = 'name';
export const SCOPE_REV = 'name';
export const SCOPES_OPENID = ['openid', 'email', 'address', 'phone', 'profile', 'offline_access'];
export interface ScopeDocData {
    name: string;
    description: string;
    metadataPublish?: string;
    default?: boolean;
}

// export interface ScopePayloadData extends ScopeDocData {
//     project: string;
//     application: string;
//     admins: string[];
// }

/**
 * {
 *   name, description, lastUpmetadataPublishdated, default
 * }
 */
export const ScopeDocDef: ObjectDef<ScopeDocData> = {
    type: 'object',
    title: SCOPE_TYPEDEF,
    properties: {
        name: t.string.words,
        description: t.string.comment,
        metadataPublish: t.string.smalltext,
        default: t.bool._
    },
    required: ['name'],
    index: { id: ['name'], sort: ['.>name'] }
};
export const ScopeDocType: Tobject<ScopeDocData> = t.object.as(ScopeDocDef);
/**
 * [ {
 *   id, created, lastUpdated, lastMembershipUpdated, profile
 * } ]
 */
//export const ScopeDocTypeCollection: Tarray = t.array.of( ScopeDocType );

// export class ScopeDocView extends Objview<ScopeDocData> implements ScopeDocData {
//     constructor( entity?: any, parent?: IViewElement ) {
//         super( ScopeDocType, entity, parent );
//     }
//     name: string;
//     description: string;
//     metadataPublish: string;
//     default: boolean;
//     asJson(): ScopeDocData {
//         return {
//             name: this.name,
//             description: this.description,
//             metadataPublish: this.metadataPublish,
//             default: this.default,
//         };
//     }
//     public projectId: string;
//     public applicationId: string;
//     public adminGroups: string[];
//     public json(): object {
//         return {
//             project: this.projectId,
//             application: this.applicationId,
//             name: this.name,
//             description: this.description,
//             admin_groups: this.adminGroups
//         }
//     }
// }
// ScopeDocType.viewctor = ScopeDocView;
