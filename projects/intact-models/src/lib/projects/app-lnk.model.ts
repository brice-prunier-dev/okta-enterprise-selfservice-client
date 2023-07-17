import { LabelData, LabelDef, OitemData } from 'joe-models';
import { t } from 'joe-types';
import {
    ObjectDef,
    Tobject,
    Objview,
    IViewElement,
    Setview,
    readPath,
    isStringAssigned
} from 'joe-fx';
import { ResourceLinkData, ResourceLinkDef } from './common.model';
import { GroupLinkData, ENGIE_GroupData, GEM_GroupData } from './group-lnk.model';
import { SubscriptionDocData } from '../sub-doc.model';
import moment from 'moment';

export interface AppLinkData extends ResourceLinkData, LabelData {
    inactive: boolean;
    swagger?: boolean;
    audience: string;
    type: string;
    cmdbId?: string;
    groups: string[];
    scopes: string[];
    subs: string[];
    apis: string[];
    usage: string
}

export const AppLinkDef: ObjectDef<AppLinkData> = {
    type: 'object',
    title: 'applink_type',
    extends: [ResourceLinkDef, LabelDef],
    properties: {
        inactive: t.bool._,
        swagger: t.bool._,
        audience: t.string.id,
        type: t.string.id,
        cmdbId: t.string.id,
        groups: t.array.of(t.string.id),
        scopes: t.array.of(t.string.id),
        subs: t.array.of(t.string.id),
        apis: t.array.of(t.string.id),
        usage: t.string.date_iso,
    },
    required: [
        ...ResourceLinkDef.required,
        ...LabelDef.required,
        'groups',
        'scopes',
        'subs',
        'audience',
        'usage',
    ],
    index: { id: 'oid', sort: '->label' }
};
/**
 * { oid, label }
 */
export const AppLinkType: Tobject<AppLinkData> = t.object.as<AppLinkData>(AppLinkDef);

// export const ItemTypeCollection: joe.Tarray = t.array.of( OitemType );
export class AppLinkView extends Objview<AppLinkData> implements AppLinkData {
    declare oid: string;
    declare audience: string;
    declare label: string;
    declare description: string;
    declare type: string;
    declare cmdbId?: string;
    declare inactive: boolean;
    declare swagger?: boolean;
    declare groups: Setview<string>;
    declare admins: Setview<string>;
    declare scopes: Setview<string>;
    declare subs: Setview<string>;
    declare apis: Setview<string>;
    declare subsDocs: SubscriptionDocData[];
    declare usage:string;
    constructor(entity?: any, parent?: IViewElement) {
        super(AppLinkType, entity, parent);
    }
    adminGroups(): ResourceLinkData[] {
        const result = [] as ResourceLinkData[];
        for (const id of this.admins) {
            result.push(readPath(this, '$>groups>(' + id + ')'));
        }
        return result;
    }
    groupGroups(): GroupLinkData[] {
        const result = [] as GroupLinkData[];
        for (const id of this.groups) {
            result.push(readPath(this, '$>groups>(' + id + ')'));
        }
        return result;
    }
    cmdbData(): OitemData {
        const cmdbs = (this.$parent().$parent().cmdbs as OitemData[]) || [];
        const cmdbId = this.cmdbId;
        return cmdbs.length === 1
            ? cmdbs[0]
            : isStringAssigned(cmdbId)
            ? cmdbs.find((v) => v.oid === cmdbId)!
            : { oid: '0', label: 'N/A' };
    }
    audienceLabel(): string {
        switch (this.audience) {
            case 'prj':
                return 'Project';
            case 'all':
                return 'Everyone';
            case 'B2E':
            case 'b2e':
                return ENGIE_GroupData.description!;
            case 'GEM':
            case 'gem':
                return GEM_GroupData.description!;
            default:
                return this.audience;
        }
    }
    hasAudience(): boolean {
        return this.audience !== 'prj';
    }


    isUsed(): boolean {
        const publicProject: boolean = this.$parent().$parent().public ?? false
        const date = moment(this.usage)

        const maxNonUsed = publicProject === false ? 3 : 6


        return date.add(6 , 'month') > moment();
    }

}
AppLinkType.viewctor = AppLinkView;
