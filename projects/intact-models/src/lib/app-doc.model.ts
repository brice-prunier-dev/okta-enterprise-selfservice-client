import { ObjectDef, Tobject, Objview, IViewElement, Setview, JsonObj, Tstring } from 'joe-fx';
import { t } from 'joe-types';
import {
    APPDEF_TYPEDEF,
    APPLICATION_TYPE_VALUES,
    GRANT_TYPE_VALUES,
    APPLICATION_TYPE,
    GRANT_TYPE
} from './app.types';
import { SamlAppInfoData, SamlAppInfoType, SamlAppInfoView } from './apps/saml-app-info';

const t_s_APPLICATION_TYPE = t.string.id.extendAs('S_APPLICATION_type', {
    type: 'string',
    enum: APPLICATION_TYPE_VALUES
});

const t_s_GRANT_TYPE = t.string.words.extendAs('S_GRANT_type', {
    type: 'string',
    enum: GRANT_TYPE_VALUES
});

/**
 *  http(s)://*
 */
export const t_s_REDIRECT_URL = new Tstring({
    type: 'string',
    title: 'S_REDIRECT_URL',
    pattern: '^(https?://|com.|[0-9a-zA-Z]*:/)[^\\s"\']*$',
    patternModel: 'http(s)://xxxx(:9999) or com.xxx'
});

/**
 * {
 *  id, client_id, client_id_issued_at, client_name, client_uri, logo_uri,
 *  redirect_uris[], response_type[], grant_types[],
 *  application_type, token_endpoint_auth_method, description
 * }
 */
export interface SamlAppDocData extends AppDocData {
    saml_app_info: SamlAppInfoData | undefined;
}

/**
 * {
 *  id, client_id, client_id_issued_at, client_name, client_uri, logo_uri,
 *  redirect_uris[], response_type[], grant_types[],
 *  application_type, token_endpoint_auth_method, description
 * }
 */
export interface AppDocData {
    id: string;
    application_type: APPLICATION_TYPE;
    client_id: string;
    created?: string;
    client_name: string;
    client_uri?: string;
    client_secret?: string;
    initiate_login_uri?: string;
    grant_type: string;
    logo_uri?: string;
    redirect_uris?: string[];
    logout_uris?: string[];
    response_types: string[];
    token_endpoint_auth_method: string;
    description?: string;
}

export interface ProjectAppLinkData {
    project: string;
    description: string;
    admins: string[];
}

/**
 * {
 *  client_id, client_id_issued_at, client_name, client_uri, logo_uri,
 *  redirect_uris[], response_type[], grant_types[],
 *  application_type, token_endpoint_auth_method
 * }
 */
export const ServiceAppDocDef: ObjectDef = {
    type: 'object',
    title: 'servicedef',
    properties: {
        id: t.string.id,
        application_type: t_s_APPLICATION_TYPE,
        client_id: t.string.id,
        created: t.string.datetime_en,
        client_name: t.string.id.extendAs('S_ClientID', { type: 'string', maxlength: 39 }),
        client_uri: t.string.url,
        client_secret: t.string.name,
        logo_uri: t.string.url,
        grant_type: t_s_GRANT_TYPE,
        response_types: t.array.of(t.string.id, 1)
    },
    required: ['application_type', 'client_id', 'client_name', 'grant_type', 'response_types'],
    index: { id: 'client_id', sort: 'client_name' }
};
export const SamlAppDocDef: ObjectDef = {
    type: 'object',
    title: 'samlappdocdef',
    properties: {
        id: t.string.id,
        application_type: t_s_APPLICATION_TYPE,
        client_id: t.string.id,
        created: t.string.datetime_en,
        client_name: t.string.id,
        client_uri: t.string.url,
        client_secret: t.string.name,
        logo_uri: t.string.url,
        grant_type: t_s_GRANT_TYPE,
        response_types: t.array.of(t.string.id, 1),
        saml_app_info: SamlAppInfoType
    },
    required: ['application_type', 'client_id', 'client_name', 'saml_app_info'],
    index: { id: 'client_id', sort: 'client_name' }
};

export const DefaultAppDocDef: ObjectDef = {
    type: 'object',
    title: 'userappdef',
    properties: {
        id: t.string.id,
        application_type: t_s_APPLICATION_TYPE,
        client_id: t.string.id,
        created: t.string.datetime_en,
        client_name: t.string.id,
        client_uri: t.string.url,
        client_secret: t.string.name,
        initiate_login_uri: t.string.url,
        grant_type: t_s_GRANT_TYPE,
        logo_uri: t.string.url,
        redirect_uris: t.array.of(t_s_REDIRECT_URL, 1),
        logout_uris: t.array.of(t_s_REDIRECT_URL),
        response_types: t.array.of(t.string.id, 1),
        token_endpoint_auth_method: t.string.smalltext
    },
    required: [
        'application_type',
        'client_id',
        'client_name',
        'initiate_login_uri',
        'grant_type',
        'redirect_uris',
        'logout_uris',
        'response_types'
    ],
    index: { id: 'client_id', sort: 'client_name' }
};

/**
 * {
 *  client_id, client_id_issued_at, client_name, client_uri, logo_uri,
 *  redirect_uris[], response_type[], grant_types[],
 *  application_type, token_endpoint_auth_method
 * }
 */
export const ServiceAppDocType: Tobject<AppDocData> = t.object.as<AppDocData>(ServiceAppDocDef);
export const DefaultAppDocType: Tobject<AppDocData> = t.object.as<AppDocData>(DefaultAppDocDef);
export const SamlAppDocType: Tobject<SamlAppDocData> = t.object.as<SamlAppDocData>(SamlAppDocDef);

/**
 * {
 *  client_id, client_id_issued_at, client_name, client_uri, logo_uri,
 *  redirect_uris[], response_type[], grant_types[],
 *  application_type, token_endpoint_auth_method
 * }
 */
export class ServiceAppDocView
    extends Objview<AppDocData>
    implements AppDocData, ProjectAppLinkData
{
    constructor(entity?: any, parent?: IViewElement) {
        super(ServiceAppDocType, entity, parent);
    }
    declare id: string;
    declare application_type: APPLICATION_TYPE;
    declare client_id: string;
    declare created: string;
    declare client_name: string;
    declare client_uri: string | undefined;
    declare client_secret: string | undefined;
    declare grant_type: string;
    declare logo_uri: string | undefined;
    declare response_types: Setview<string>;
    declare token_endpoint_auth_method: string;

    declare project: string;
    declare description: string;
    declare admins: string[];

    asString(): string {
        return ' App: ' + this.client_name;
    }

    $json(): JsonObj {
        const obj = super.$json();
        if (!this.created) {
            // tslint:disable-next-line: no-string-literal
            obj['project'] = this.project;
            // tslint:disable-next-line: no-string-literal
            obj['description'] = this.description;
            // tslint:disable-next-line: no-string-literal
            obj['admins'] = this.admins;
        }
        return obj;
    }
}
ServiceAppDocType.viewctor = ServiceAppDocView;

export class SamlAppDocView
    extends Objview<SamlAppDocData>
    implements SamlAppDocData, ProjectAppLinkData
{
    constructor(entity?: any, parent?: IViewElement) {
        super(SamlAppDocType, entity, parent);
    }
    declare id: string;
    declare application_type: APPLICATION_TYPE;
    declare client_id: string;
    declare created: string;
    declare client_name: string;
    declare client_uri: string | undefined;
    declare client_secret: string | undefined;
    declare grant_type: string;
    declare logo_uri: string | undefined;
    declare response_types: Setview<string>;
    declare token_endpoint_auth_method: string;
    declare saml_app_info: SamlAppInfoView | undefined;

    declare project: string;
    declare description: string;
    declare admins: string[];
}
SamlAppDocType.viewctor = SamlAppDocView;

export class DefaultAppDocView
    extends Objview<AppDocData>
    implements AppDocData, ProjectAppLinkData
{
    constructor(entity?: any, parent?: IViewElement) {
        super(DefaultAppDocType, entity, parent);
    }
    declare id: string;
    declare application_type: APPLICATION_TYPE;
    declare client_id: string;
    declare created: string;
    declare client_name: string;
    declare client_uri: string | undefined;
    declare client_secret: string | undefined;
    declare grant_type: string;
    declare logo_uri: string | undefined;
    declare response_types: Setview<string>;
    declare token_endpoint_auth_method: string;

    declare initiate_login_uri: string | undefined;
    declare redirect_uris: Setview<string>;
    declare logout_uris: Setview<string>;
    get grant_types(): GRANT_TYPE[] {
        if (this.grant_type) {
            return this.grant_type.split(',').map((s) => s.trim()) as GRANT_TYPE[];
        }
        return [];
    }
    set grant_types(value: GRANT_TYPE[]) {
        if (value && value.length > 0) {
            this.grant_type = value.join(', ');
        } else {
            this.grant_type = '';
        }
    }

    asString(): string {
        return ' App: ' + this.client_name;
    }

    declare project: string;
    declare description: string;
    declare admins: string[];
    $json(): JsonObj {
        const obj = super.$json() as unknown as AppDocData & ProjectAppLinkData;
        obj.client_uri = obj.initiate_login_uri;
        if (!this.created) {
            obj.project = this.project;
            obj.description = this.description;
            obj.admins = this.admins;
        }
        return obj as unknown as JsonObj;
    }
}
DefaultAppDocType.viewctor = DefaultAppDocView;
