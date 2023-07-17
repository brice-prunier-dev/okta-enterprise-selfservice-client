import { IViewElement, ObjectDef, Objview, Tobject } from 'joe-fx';
import { t } from 'joe-types';

/**
 * {
 *   app, wiki, wiki2, swagger, backlog,  teams,
 * }
 */
export interface ApiLinksData {
    app: string | undefined;
    wiki: string | undefined;
    wiki2: string | undefined;
    swagger: string | undefined;
    backlog: string | undefined;
    teams: string | undefined;
}

// ────────────────────────────────────────────────────────────────────────────────
/**
 * {
 *   app, wiki, wiki2, swagger, backlog,  teams,
 * }
 */
export const ApiLinksDef: ObjectDef<ApiLinksData> = {
    type: 'object',
    title: 'ApiLinks',
    properties: {
        app: t.string.id,
        wiki: t.string.word,
        wiki2: t.string.url,
        swagger: t.string.url,
        backlog: t.string.url,
        teams: t.string.url
    },
    required: []
};

// ────────────────────────────────────────────────────────────────────────────────
/**
 * {
 *   app, wiki, wiki2, swagger, backlog,  teams,
 * }
 */
export const ApiLinksType: Tobject<ApiLinksData> = t.object.as<ApiLinksData>(ApiLinksDef);

// ────────────────────────────────────────────────────────────────────────────────
/**
 * {
 *   app, wiki, wiki2, swagger, backlog,  teams,
 * }
 */
export class ApiLinksView extends Objview<ApiLinksData> implements ApiLinksData {
    constructor(entity?: any, parent?: IViewElement) {
        super(ApiLinksType, entity, parent);
    }
    declare app: string | undefined;
    declare wiki: string | undefined;
    declare wiki2: string | undefined;
    declare swagger: string | undefined;
    declare backlog: string | undefined;
    declare teams: string | undefined;
}
ApiLinksType.viewctor = ApiLinksView;
