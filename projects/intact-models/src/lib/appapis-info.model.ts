import { t } from 'joe-types';
import { IViewElement, ObjectDef, Objview, Tobject, Setview } from 'joe-fx';
import { IdData, IdDef } from 'joe-models';
import { ApiInfoData, ApiInfoType, ApiInfoView } from './apis';

//
// ─── INFRA ──────────────────────────────────────────────────────────────────────
//

export const APPAPIS_TYPEDEF = 'AppApisInfo';
export const APPAPIS_STORE = 'appapis';
export const APPAPIS_ID = 'id';
export const APPAPIS_REV = 'id';

/**
 * {
 *   id,
 *   subscribers{},swaggeruis[{}],
 *   info{}, backends[{}] }
 */
export interface AppApisInfoData extends IdData {
    info: ApiInfoData;
    appScopes: string[];
}

/**
 * {
 *   id, type
 *   subscribers{},swaggeruis[{}],
 *   info{}, backends[{}] }
 */
export const AppApisInfoDef: ObjectDef<AppApisInfoData> = {
    type: 'object',
    title: APPAPIS_TYPEDEF,
    extends: [IdDef],
    properties: {
        info: ApiInfoType,
        appScopes: t.array.of(t.string.token)
    },
    required: [...IdDef.required, 'info', 'appScopes'],
    index: { id: 'id' }
};

/**
 * {
 *   id, type
 *   subscribers{},swaggeruis[{}],
 *   info{}, backends[{}] }
 */
export const AppApisInfoType: Tobject<AppApisInfoData> =
    t.object.as<AppApisInfoData>(AppApisInfoDef);

/**
 * {
 *   id, type
 *   subscribers{},swaggeruis[{}],
 *   info{}, backends[{}] }
 */
export class AppApisInfoView extends Objview<AppApisInfoData> implements AppApisInfoData {
    static default = new AppApisInfoView({ id: '_' });
    constructor(entity?: any, parent?: IViewElement) {
        super(AppApisInfoType, entity, parent);
    }
    declare id: string;
    declare info: ApiInfoView;
    declare appScopes: Setview<string>;
}
AppApisInfoType.viewctor = AppApisInfoView;
