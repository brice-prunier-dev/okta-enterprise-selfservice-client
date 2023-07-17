import { IViewElement, ObjectDef, Objview, Setview, Tobject } from 'joe-fx';
import { OdefinitionData, OdefinitionType, OdefinitionView } from 'joe-models';
import { t } from 'joe-types';
import { ApiLinksData, ApiLinksType, ApiLinksView } from './api-links.model';
import { DefinitionDef, DefinitionData, DefinitionView } from './definition.model';

/**
 * {
 *   name, description,
 *   created_on, draft, projects[],apimId[], category, nature, commodities[], countries[],
 *   horizon, tags, links{}, businessContacts, productOwners, scopes[{}]
 * }
 */
export interface ApiInfoData extends DefinitionData {
    created_on: string | undefined;
    draft: boolean;
    projects: string[];
    category: string | undefined;
    nature: string | undefined;
    commodities: string[];
    countries: string[];
    horizon: string | undefined;
    tags: string[];
    links: ApiLinksData;
    businessContacts: string[];
    productOwners: string[];
    scopes: OdefinitionData[];
}

// ────────────────────────────────────────────────────────────────────────────────
/**
 * {
 *   name, description,
 *   created_on, draft, projects[],apimId[], category, nature, commodities[], countries[],
 *   horizon, tags, links{}, businessContacts, productOwners, scopes[{}]
 * }
 */
export const ApiInfoDef: ObjectDef<ApiInfoData> = {
    type: 'object',
    title: 'ApiInfo',
    extends: [DefinitionDef],
    properties: {
        created_on: t.string.date_iso,
        draft: t.bool._,
        projects: t.array.of(t.string.id),
        category: t.string.name,
        nature: t.string.name,
        commodities: t.array.of(t.string.name, 1),
        countries: t.array.of(t.string.name, 1),
        horizon: t.string.name,
        tags: t.array.of(t.string.id, 1),
        links: ApiLinksType,
        businessContacts: t.array.of(t.string.email, 1),
        productOwners: t.array.of(t.string.email, 1),
        scopes: t.array.of(OdefinitionType, 1)
    },
    required: [
        ...DefinitionDef.required,
        'projects',
        'links',
        'draft',
        'tags',
        'commodities',
        'countries',
        'scopes',
        'productOwners',
        'businessContacts'
    ]
};

// ────────────────────────────────────────────────────────────────────────────────
/**
 * {
 *   name, description,
 *   created_on, draft, projects[],apimId[], category, nature, commodities[], countries[],
 *   horizon, tags, links{}, businessContacts, productOwners, scopes[{}]
 * }
 */
export const ApiInfoType: Tobject<ApiInfoData> = t.object.as<ApiInfoData>(ApiInfoDef);

// ────────────────────────────────────────────────────────────────────────────────
/**
 * {
 *   name, description,
 *   created_on, ?draft, projects[],apimId[], category, nature, commodities[], countries[],
 *   horizon, tags, links{}, businessContacts, productOwners, scopes[{}]
 * }
 */
export class ApiInfoView extends Objview<ApiInfoData> implements ApiInfoData {
    constructor(entity?: any, parent?: IViewElement) {
        super(ApiInfoType, entity, parent);
    }
    declare created_on: string | undefined;
    declare draft: boolean;
    declare projects: Setview<string>;
    declare name: string;
    declare description: string;
    declare category: string | undefined;
    declare nature: string | undefined;
    declare commodities: Setview<string>;
    declare countries: Setview<string>;
    declare horizon: string | undefined;
    declare tags: Setview<string>;
    declare links: ApiLinksView;
    declare businessContacts: Setview<string>;
    declare productOwners: Setview<string>;
    declare scopes: Setview<OdefinitionView>;
}

ApiInfoType.viewctor = ApiInfoView;
