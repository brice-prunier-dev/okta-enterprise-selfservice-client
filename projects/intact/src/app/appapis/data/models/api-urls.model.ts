import { IViewElement, ObjectDef, Objview, Tobject } from 'joe-fx';
import { t } from 'joe-types';

/**
 * {
 *   name, url
 * }
 */
export interface ApiUrlData {
    name: string;
    url: string;
}

// ────────────────────────────────────────────────────────────────────────────────
/**
 * {
 *   name, url
 * }
 */
export const ApiUrlDef: ObjectDef<ApiUrlData> = {
    type: 'object',
    title: 'ApiUrl',
    properties: {
        name: t.string.name,
        url: t.string.url
    },
    required: ['name', 'url'],
    index: { id: 'name', sort: 'name' }
};

// ────────────────────────────────────────────────────────────────────────────────
/**
 * {
 *   name, url
 * }
 */
export const ApiUrlType: Tobject<ApiUrlData> = t.object.as<ApiUrlData>(ApiUrlDef);

// ────────────────────────────────────────────────────────────────────────────────
/**
 * {
 *   name, url
 * }
 */
export class ApiUrlView extends Objview<ApiUrlData> implements ApiUrlData {
    constructor(entity?: any, parent?: IViewElement) {
        super(ApiUrlType, entity, parent);
    }
    declare name: string;
    declare url: string;
}
ApiUrlType.viewctor = ApiUrlView;
