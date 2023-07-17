import { ObjectDef } from 'joe-fx';
import { t } from 'joe-types';



//
// ─── INFRA ──────────────────────────────────────────────────────────────────────
//

export const APPINFO_TYPEDEF = 'appinfo';
/**
 * {
 *  id, lastUpdated?
 *  status, name, label
 * }
 */
export interface AppInfoData {
    lastUpdated?: string;
    status: string;
    name: string;
    label: string;
}

/**
 * {
 *  id, lastUpdated?
 *  status, name, label
 * }
 */
export const AppInfoDef: ObjectDef = {
    type: 'object',
    title: APPINFO_TYPEDEF,
    properties: {
        lastUpdated: t.string.datetime_en,
        status: t.string.word,
        name: t.string.id,
        label: t.string.words
    },
    required: [ 'status', 'name', 'label' ]
};

