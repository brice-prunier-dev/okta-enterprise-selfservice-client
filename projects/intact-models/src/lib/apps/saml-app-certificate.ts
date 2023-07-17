import { IViewElement, ObjectDef, Objview, Tobject } from 'joe-fx';
import { t } from 'joe-types';

/**
 * {
 *  issuer, valid_from, valid_to,
 *  version, thumbprint
 * }
 */
export interface SamlAppCertificateData {
    issuer: string | undefined;
    valid_from: string | undefined;
    valid_to: string | undefined;
    version: number | undefined;
    thumbprint: string | undefined;
}

/**
 * {
 *  issuer, valid_from, valid_to, version, thumbprint
 * }
 */
export const SamlAppCertificateDef: ObjectDef = {
    type: 'object',
    title: 'samlappcertificatedef',
    properties: {
        issuer: t.string.id,
        valid_from: t.string.datetime_iso,
        valid_to: t.string.datetime_iso,
        version: t.number.int,
        thumbprint: t.string.id
    },
    required: ['issuer', 'valid_from', 'valid_to', 'version', 'thumbprint'],
    index: { id: 'issuer', sort: 'valid_to' }
};
export const SamlAppCertificateType: Tobject<SamlAppCertificateData> =
    t.object.as<SamlAppCertificateData>(SamlAppCertificateDef);

/**
 * {
 *   issuer, valid_from, valid_to, version, thumbprint
 * }
 */
export class SamlAppCertificateView
    extends Objview<SamlAppCertificateData>
    implements SamlAppCertificateData
{
    constructor(entity?: any, parent?: IViewElement) {
        super(SamlAppCertificateType, entity, parent);
    }
    declare issuer: string | undefined;
    declare valid_from: string | undefined;
    declare valid_to: string | undefined;
    declare version: number | undefined;
    declare thumbprint: string | undefined;

    get from_date(): Date {
        return new Date(this.valid_from || '');
    }

    get to_date(): Date {
        return new Date(this.valid_to || '');
    }    
}
SamlAppCertificateType.viewctor = SamlAppCertificateView;
