import { RelationDefData, t } from 'joe-types';
import {
    ObjectDef,
    Tobject,
    Tarray,
    Objview,
    IViewElement,
    Setview,
    Tstring,
    RuntimeMessage
} from 'joe-fx';
import {
    AppLinkData,
    AppLinkType,
    AppLinkView,
    PositionData,
    PositionType,
    PositionView,
    ResourceLinkData,
    ScopeLinkType,
    ScopeLinkView,
    AdministratedItemData
} from './projects';
import { IdData, DescriptionData, OitemData, OitemType, OitemView, OidData } from 'joe-models';
import { IdDef, DescriptionDef } from 'joe-models';
import { GroupLinkData, GroupLinkType, GroupLinkView } from './projects';

export const PROJECT_TYPEDEF = 'project';
export const PROJECT_STORE = 'projects';
export const PROJECT_ID = 'id';
export const PROJECT_REV = 'id ';

export enum ENV_TYPE {
    dev = 'dev',
    beta = 'bta',
    prod = 'prd'
}

export const S_ENV_TYPE = new Tstring({
    type: 'string',
    title: 'S_ENVTYPE',
    minlength: 1,
    maxlength: 1,
    enum: [ENV_TYPE.dev, ENV_TYPE.beta, ENV_TYPE.prod],
    default: ENV_TYPE.dev
});

export interface Position {
    x: number;
    y: number;
}
export interface ProjectPosition {
    oid: string;
    pos: Position;
    env?: string;
}

export interface ProjectDocData extends IdData, DescriptionData, AdministratedItemData {
    env: string;
    public: boolean;
    pos?: PositionData;
    clipos?: PositionData;
    apps: AppLinkData[];
    groups: GroupLinkData[];
    scopes: ResourceLinkData[];
    admins: string[];
    cmdbs: OitemData[];
}

export const OAuthProject: ProjectDocData = {
    id: 'openid',
    public: true,
    env: 'any',
    description: 'Project for OAuth2 scopes',
    apps: [],
    groups: [],
    scopes: [
        {
            oid: 'openid',
            description: 'Identifies the request as an OpenID Connect request.',
            admins: []
        },
        {
            oid: 'profile',
            description: "Requests access to the end user's default profile claims.",
            admins: []
        },
        {
            oid: 'email',
            description: 'Requests access to the email and email_verified claims.',
            admins: []
        },
        {
            oid: 'phone',
            description: 'Requests access to the phone_number and phone_number_verified claims.',
            admins: []
        },
        {
            oid: 'address',
            description: 'Requests access to the address claim.',
            admins: []
        },
        {
            oid: 'groups',
            description: 'Requests access to the groups claim.',
            admins: []
        },
        {
            oid: 'offline_access',
            description:
                'Requests a refresh token used to obtain more access tokens without re-prompting the user for authentication.',
            admins: []
        }
    ],
    admins: [],
    cmdbs: []
};

/**
 * {
 *   name, description, lastUpmetadataPublishdated, default
 * }
 */
export const ProjectDocDef: ObjectDef<ProjectDocData> = {
    type: 'object',
    title: PROJECT_TYPEDEF,
    extends: [IdDef, DescriptionDef],
    properties: {
        env: S_ENV_TYPE,
        public: t.bool._,
        pos: PositionType,
        clipos: PositionType,
        apps: t.array.of(AppLinkType),
        groups: t.array.of(GroupLinkType),
        scopes: t.array.of(ScopeLinkType),
        admins: t.array.of(t.string.id),
        cmdbs: t.array.of(OitemType)
    },
    required: ['id', 'apps', 'groups', 'scopes', 'admins'],
    index: { id: PROJECT_ID, sort: PROJECT_ID }
};
export const ProjectDocType: Tobject<ProjectDocData> = t.object.as<ProjectDocData>(ProjectDocDef);
/**
 * [ {
 *   id, created, lastUpdated, lastMembershipUpdated, profile
 * } ]
 */
export const ProjectDocTypeCollection: Tarray = t.array.of(ProjectDocType);

export class ProjectDocView extends Objview<ProjectDocData> implements ProjectDocData, OidData {
    constructor(entity?: any, parent?: IViewElement)  {
        super(ProjectDocType, entity, parent);
    }
    declare id: string;
    declare public: boolean;
    declare env: ENV_TYPE;
    declare description: string;
    declare pos?: PositionView;
    declare clipos?: PositionView;
    declare apps: Setview<AppLinkView>;
    declare groups: Setview<GroupLinkView>;
    declare scopes: Setview<ScopeLinkView>;
    declare admins: Setview<string>;
    declare cmdbs: Setview<OitemView>;
    get oid(): string {
        return this.id;
    }
    hasApis(): boolean {
        return this.apps.some((app) => app.swagger && app.apis && app.apis.length > 0);
    }
    apis(): string[] {
        const apis: string[] = [];
        this.apps.forEach((app) => {
            if (app.swagger && app.apis) {
                app.apis.forEach((api) => {
                    if (!apis.includes(api)) {
                        apis.push(api);
                    }
                });
            }
        });
        return apis.sort();
    }
}
ProjectDocType.viewctor = ProjectDocView;

RuntimeMessage.Register('uniqueid', (id) => {
    return `Id: "${id}" already exists!`;
});
