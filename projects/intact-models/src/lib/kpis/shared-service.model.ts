import { ObjectDef, Tobject } from 'joe-fx';
import { t } from 'joe-types';



//
// ─── INFRA ──────────────────────────────────────────────────────────────────────
//

export const SHARED_SERVICE_TYPEDEF = 'sharedservice';
/**
 * {
 *  id, lastUpdated?
 *  status, name, label
 * }
 */
export interface SharedServiceData {
    date: string
    ipCount: number
}

/**
 * {
 *  id, lastUpdated?
 *  status, name, label
 * }
 */
export const SharedServiceDef: ObjectDef<SharedServiceData> = {
    type: 'object',
    title: SHARED_SERVICE_TYPEDEF,
    properties: {
        date:t.string.date_iso,
        ipCount: t.number.int,
    },
    required: [ 'date', 'ipCount' ],
};

export const SharedServiceType = new Tobject(SharedServiceDef);
