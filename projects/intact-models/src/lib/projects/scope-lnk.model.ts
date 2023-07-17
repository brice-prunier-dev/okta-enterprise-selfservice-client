import { t } from 'joe-types';
import { ObjectDef, Tobject, Objview, IViewElement, Setview, isArrayAssigned } from 'joe-fx';
import { ResourceLinkDef, ResourceLinkData, S_SCOPE_ID } from './common.model';
import { SubscriptionDocData } from '../sub-doc.model';

export const SCOPE_PREFIX = 'api.';
export const DATA_PREFIX = 'data.';
export const HTTPS_PREFIX = 'https://';

export const ScopeLinkDef: ObjectDef<ResourceLinkData> = {
    type: 'object',
    title: 'scopelink_type',
    extends: [ResourceLinkDef],
    properties: {
        oid: S_SCOPE_ID
    },
    required: [...ResourceLinkDef.required],
    index: { id: 'oid', sort: ['.>oid'] }
};
/**
 * { oid, label }
 */
export const ScopeLinkType: Tobject<ResourceLinkData> = t.object.as(ScopeLinkDef);

// export const ItemTypeCollection: joe.Tarray = t.array.of( OitemType );
export class ScopeLinkView extends Objview<ResourceLinkData> implements ResourceLinkData {
    declare oid: string;
    declare description: string;
    declare admins: Setview<string>;
    constructor(entity?: any, parent?: IViewElement) {
        super(ScopeLinkType, entity, parent);
    }
    get withSubs(): boolean {
        return this.subsCount > 0;
    }
    get subsCount(): number {
        return this.subsDocs ? this.subsDocs.length : this.$src.obj.subsCount || 0;
    }

    declare subsDocs: SubscriptionDocData[] | undefined;

    removeSub(sub: SubscriptionDocData) {
        if (this.subsDocs !== undefined) {
            const index = this.subsDocs.findIndex((s) => s.id === sub.id);
            if (index > -1) {
                this.subsDocs.splice(index, 1);
            }
        } else if (this.$src.obj.subsCount) {
            this.$src.obj.subsCount = this.$src.obj.subsCount - 1;
        }
    }
    addSub(sub: SubscriptionDocData) {
        if (this.subsDocs === undefined) {
            this.$src.obj.subsCount = (this.$src.obj.subsCount || 0) + 1;
        } else if (this.$src.obj.subsCount) {
            this.subsDocs.push(sub);
        }
    }
}
ScopeLinkType.viewctor = ScopeLinkView;

export const NULL_ScopeLinkData: ResourceLinkData = { oid: '', description: '', admins: [] };
