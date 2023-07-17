import { OidData, OidDef, DescriptionData, DescriptionDef } from 'joe-models';
import { Tstring, ObjectDef } from 'joe-fx';
import { t } from 'joe-types';

export const ADMINS_TYPEDEF = 'admins';
export enum PROJECTITEM_TYPE {
    api = 'api',
    application = 'app',
    group = 'grp',
    scope = 'scp',
    project = 'prj',
    externalApp = 'apx',
    externalScp = 'scx',
    newApi = 'pi+',
    newApp = 'ap+',
    newGroup = 'gr+',
    newScope = 'sc+'
}

export interface ReferenceChangesData {
    added: string[];
    removed: string[];
}

export interface ReferenceChangesMessageData {
    project: string;
    target: string;
    targetType: string;
    changeTarget?: string;
    changeTargetType?: string;
    changes: ReferenceChangesData;
}

export interface ReferenceChangesResponseMessageData
    extends ReferenceChangesMessageData {
    subscriptions: string[];
    errors: string[];
}

export interface AdministratedItemData {
    admins: string[];
}

export interface ResourceLinkData
    extends OidData,
        DescriptionData,
        AdministratedItemData {
    cmdbId?: string;
}

export interface ScopeLinkData extends ResourceLinkData {
    subsCount?: number;
}

export const ResourceLinkDef: ObjectDef<ResourceLinkData> = {
    type: 'object',
    title: 'resourcelink_type',
    extends: [OidDef, DescriptionDef],
    properties: {
        admins: t.array.of(t.string.id)
    },
    required: [...OidDef.required]
};

export const S_SCOPE_ID = new Tstring({
    type: 'string',
    title: 'S_SCOPE_ID',
    pattern: '^(https://|api.|data.)[A-Za-z-0-9]+[A-Za-z-0-9-_:;./]*$',
    patternModel: '( https:// | api. | data. )xxxx'
});