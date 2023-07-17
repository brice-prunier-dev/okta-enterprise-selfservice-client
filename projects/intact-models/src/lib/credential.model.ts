import { t } from 'joe-types';
import { ObjectDef, Tobject, Objview, IViewElement } from 'joe-fx';

//
// ─── INFRA ──────────────────────────────────────────────────────────────────────
//

export const CRED_TYPEDEF = 'cred';
export interface CredentialData {
    username: string;
    password: string;
}

/**
 * {
 *   id, status, created, activiated, statusChanged, lastLogin, lastUpdate, passwordChanged
 * }
 */
export const CredentialDef: ObjectDef = {
    type: 'object',
    title: CRED_TYPEDEF,
    properties: {
        username: t.string.word,
        password: t.string.name
    },
    required: ['username', 'password']
};
/**
 * {
 *   id, status, created, activiated, statusChanged, lastLogin, lastUpdate, passwordChanged
 * }
 */
export const CredentialType: Tobject<CredentialData> = t.object.as<CredentialData>(CredentialDef);

export class CredentialView extends Objview<CredentialData> implements CredentialData {
    constructor(entity?: any, parent?: IViewElement) {
        super(CredentialType, entity, parent);
    }
    declare username: string;
    declare password: string;
}
CredentialType.viewctor = CredentialView;
