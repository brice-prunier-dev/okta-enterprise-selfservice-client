import {OitemData, OitemDef} from './oitem';
import {DescriptionData, DescriptionDef} from '../label';
import {ObjectDef, Tobject} from 'joe-fx';
import {t} from 'joe-types';

//
// ─── ITEM WITH DESC ───────────────────────────────────────────────────────────────────
//


/**
 * {
 *  oid, label,
 *  desc
 * }
 */
export interface OitemWithDescData extends OitemData, DescriptionData {
}


export const OitemWithDescDef: ObjectDef<OitemWithDescData> = {
    type: 'object',
    title: 'ItemWithDesc',
    extends: [OitemDef, DescriptionDef],
    properties: {},
    required: [...OitemDef.required, ...DescriptionDef.required],
    index: {id: 'oid', sort: ['$>label']}
};
/**
 * { oid, label }
 */
export const OitemWithDescType: Tobject<OitemWithDescData> = t.object.as(OitemWithDescDef);