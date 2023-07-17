import { t } from 'joe-types';
import { IViewElement, ObjectDef, Objview, Tobject, Setview } from 'joe-fx';
import { IdData, IdDef } from 'joe-models';
import { SwaggerLinkData, SwaggerLinkType, SwaggerLinkView } from './models';
import { ApiInfoData, ApiInfoType, ApiInfoView } from 'intact-models';

//
// ─── INFRA ──────────────────────────────────────────────────────────────────────
//

export const APIS_TYPEDEF = 'ApiDoc';
export const APIS_STORE = 'apis';
export const APIS_ID = 'id';
export const APIS_REV = 'id';

/**
 * {
 *   id,
 *   subscribers{},swaggeruis[{}],
 *   info{}, backends[{}] }
 */
export interface ApiDocData extends IdData {
    info: ApiInfoData;
    swaggeruis: SwaggerLinkData[];
}

/**
 * {
 *   id, type
 *   subscribers{},swaggeruis[{}],
 *   info{}, backends[{}] }
 */
export const ApiDocDef: ObjectDef<ApiDocData> = {
    type: 'object',
    title: APIS_TYPEDEF,
    extends: [IdDef],
    properties: {
        info: ApiInfoType,
        swaggeruis: t.array.of(SwaggerLinkType)
    },
    required: [...IdDef.required, 'info', 'swaggeruis'],
    index: { id: 'id' }
};

/**
 * {
 *   id, type
 *   subscribers{},swaggeruis[{}],
 *   info{}, backends[{}] }
 */
export const ApiDocType: Tobject<ApiDocData> = t.object.as<ApiDocData>(ApiDocDef);

/**
 * {
 *   id, type
 *   subscribers{},swaggeruis[{}],
 *   info{}, backends[{}] }
 */
export class ApiDocView extends Objview<ApiDocData> implements ApiDocData {
    static default = new ApiDocView({ id: '_' });
    constructor(entity?: any, parent?: IViewElement) {
        super(ApiDocType, entity, parent);
    }
    declare id: string;
    declare info: ApiInfoView;
    declare swaggeruis: Setview<SwaggerLinkView>;
}
ApiDocType.viewctor = ApiDocView;
