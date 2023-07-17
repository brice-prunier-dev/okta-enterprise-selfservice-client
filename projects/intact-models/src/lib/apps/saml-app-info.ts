import { IViewElement, ObjectDef, Objview, Tobject } from 'joe-fx';
import { t } from 'joe-types';
import {
    SamlAppCertificateData,
    SamlAppCertificateType,
    SamlAppCertificateView
} from './saml-app-certificate';

/**
 * {
 *  sso_url, audience, certificate
 * }
 */
export interface SamlAppInfoData {
    sso_url: string | undefined;
    audience: string | undefined;
    certificate: SamlAppCertificateData | undefined;
}

/**
 * {
 *  sso_url, audience, certificate
 * }
 */
export const SamlAppInfoDef: ObjectDef = {
    type: 'object',
    title: 'samlappinfodef',
    properties: {
        sso_url: t.string.url,
        audience: t.string.httpdomain,
        certificate: SamlAppCertificateType
    },
    required: ['sso_url', 'audience', 'certificate']
};
export const SamlAppInfoType: Tobject<SamlAppInfoData> =
    t.object.as<SamlAppInfoData>(SamlAppInfoDef);

/**
 * {
 *   sso_url, audience, certificate
 * }
 */
export class SamlAppInfoView extends Objview<SamlAppInfoData> implements SamlAppInfoData {
    constructor(entity?: any, parent?: IViewElement) {
        super(SamlAppInfoType, entity, parent);
    }
    declare sso_url: string | undefined;
    declare audience: string | undefined;
    declare certificate: SamlAppCertificateView | undefined;
}
SamlAppInfoType.viewctor = SamlAppInfoView;
