import { OidDef, LabelData, OidData, LabelDef, OitemData } from 'joe-models';
import { t } from 'joe-types';
import { ObjectDef, Tobject, Objview, IViewElement, Setview } from 'joe-fx';
import { S_GEM_ENVS } from './common.model';

/**
 * {
 *   oid, label,
 *   project, env
 * }
 */
export interface SwaggerLinkData extends OitemData {
    project: string;
    env: string;
}

/**
 * {
 *   oid, label,
 *   env, project,
 *   api
 * }
 */
export interface SwaggerApiData extends SwaggerLinkData {
    api: string;
}
/**
 * {
 *   oid, label,
 *   project, env
 * }
 */
export const SwaggerLinkDef: ObjectDef<SwaggerLinkData> = {
    type: 'object',
    title: 'SwaggerLink',
    extends: [OidDef, LabelDef],
    properties: {
        project: t.string.id,
        env: S_GEM_ENVS
    },
    required: [...OidDef.required, ...LabelDef.required, 'project', 'env']
};

/**
 * {
 *   oid, label,
 *   project, env
 * }
 */
export const SwaggerLinkType: Tobject<SwaggerLinkData> =
    t.object.as<SwaggerLinkData>(SwaggerLinkDef);

/**
 * {
 *   oid, label,
 *   project, env
 * }
 */
export class SwaggerLinkView extends Objview<SwaggerLinkData> implements SwaggerLinkData {
    constructor(entity?: any, parent?: IViewElement) {
        super(SwaggerLinkType, entity, parent);
    }
    declare oid: string;
    declare label: string;
    declare project: string;
    declare env: string;
}

SwaggerLinkType.viewctor = SwaggerLinkView;
