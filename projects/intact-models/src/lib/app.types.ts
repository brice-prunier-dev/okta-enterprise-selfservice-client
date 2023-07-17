export const APPDEF_TYPEDEF = 'appdef';
export const APPDEF_STORE = 'apps';
export const APPDEF_ID = 'id';
export const APPDEF_REV = 'created';

export enum APPLICATION_TYPE {
    Web = 'web',
    Native = 'native',
    Browser = 'browser',
    Service = 'service',
    Swagger = 'swagger',
    Saml = 'saml_2_0'
}

export const APPLICATION_TYPE_VALUES: string[] = [
    APPLICATION_TYPE.Web,
    APPLICATION_TYPE.Native,
    APPLICATION_TYPE.Browser,
    APPLICATION_TYPE.Service,
    APPLICATION_TYPE.Swagger,
    APPLICATION_TYPE.Saml,
];

export enum RESPONSE_TYPE {
    Code = 'code',
    Token = 'token',
    TokenId = 'id_token',
}
export const RESPONSE_TYPE_VALUES = [
    RESPONSE_TYPE.Code,
    RESPONSE_TYPE.Token,
    RESPONSE_TYPE.TokenId,
];

export enum GRANT_TYPE {
    AuthorizationCode = 'authorization_code',
    Implicit = 'implicit',
    Password = 'password',
    RefreshToken = 'refresh_token',
    ClientCredentials = 'client_credentials',
}
export const GRANT_TYPE_VALUES: string[] = [
    GRANT_TYPE.AuthorizationCode,
    GRANT_TYPE.Implicit,
    GRANT_TYPE.Password,
    GRANT_TYPE.RefreshToken,
    GRANT_TYPE.ClientCredentials,
];

export const BROWSER_GRANT_TYPE_VALUES: string[] = [
    GRANT_TYPE.AuthorizationCode,
    GRANT_TYPE.Implicit,
    GRANT_TYPE.RefreshToken,
];


export const WEB_GRANT_TYPE_VALUES: string[] = [
    GRANT_TYPE.AuthorizationCode,
    GRANT_TYPE.Implicit,
    GRANT_TYPE.RefreshToken,
];

export const NATIVE_GRANT_TYPE_VALUES: string[] = [
    GRANT_TYPE.AuthorizationCode,
    GRANT_TYPE.Implicit,
    GRANT_TYPE.Password,
    GRANT_TYPE.RefreshToken,
];

export function encodeUriPath(text: string): string {
    return text.toLowerCase().replace(/ /, '_');
}

export function decodeUriPath(text: string): string {
    return text.replace(/_/, ' ');
}

