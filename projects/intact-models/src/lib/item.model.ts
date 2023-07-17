import { IViewElement, ObjectDef, Objview, Tobject } from 'joe-fx';
import { t } from 'joe-types';

/**
 * {
 *   name, description
 * }
 */
export interface ApiItemData {
    name: string;
    description: string;
}

// ────────────────────────────────────────────────────────────────────────────────
/**
 * {
 *   name, description
 * }
 */
export const ApiItemDef: ObjectDef<ApiItemData> = {
    type: 'object',
    title: 'ApiItem',
    properties: {
        name: t.string.name,
        description: t.string.comment
    },
    required: ['name', 'description'],
    index: { id: 'name', sort: 'name' }
};

// ────────────────────────────────────────────────────────────────────────────────
/**
 * {
 *   name, description
 * }
 */
export const ApiItemType: Tobject<ApiItemData> = t.object.as<ApiItemData>(ApiItemDef);

// ────────────────────────────────────────────────────────────────────────────────
/**
 * {
 *   name, description
 * }
 */
export class ApiItemView extends Objview<ApiItemData> implements ApiItemData {
    constructor(entity?: any, parent?: IViewElement) {
        super(ApiItemType, entity, parent);
    }
    declare name: string;
    declare description: string;
}
ApiItemType.viewctor = ApiItemView;
