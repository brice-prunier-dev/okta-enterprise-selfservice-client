import { ObjectDef, Tobject } from 'joe-fx';
import { t } from 'joe-types';



//
// ─── INFRA ──────────────────────────────────────────────────────────────────────
//

export const KPI_JOB_RUN_TYPEDEF = 'kpijobresultinfo';
/**
 * {
 *  id, lastUpdated?
 *  status, name, label
 * }
 */
export interface KpiJobRunData {
    start:string;
    duration:string;
    status: string;
}


/**
 * {
 *  id, lastUpdated?
 *  status, name, label
 * }
 */
export const KpiJobRunDef: ObjectDef<KpiJobRunData> = {
    type: 'object',
    title: KPI_JOB_RUN_TYPEDEF,
    extends: [],
    properties: {
        start: t.string.datetime_iso,
        duration: t.string._,
        status: t.string._,
    },
    required: [ 'start', 'duration', 'status' ]
};


export const KpiJobRunInfoType = new Tobject(KpiJobRunDef);
