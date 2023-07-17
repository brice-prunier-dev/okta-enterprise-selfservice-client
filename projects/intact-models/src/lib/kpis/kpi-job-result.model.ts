import { ObjectDef, Tobject } from 'joe-fx';
import { t } from 'joe-types';
import { KpiJobRunData, KpiJobRunInfoType } from './kpi-job-run.model';

//
// ─── INFRA ──────────────────────────────────────────────────────────────────────
//

export const KPI_JOB_RESULT_TYPEDEF = 'kpijobresultinfo';
/**
 * {
 *  id, lastUpdated?
 *  status, name, label
 * }
 */
export interface KpiJobResultData {
    jobName: string;
    last: KpiJobRunData;
    lastSuccess: KpiJobRunData;
}

/**
 * {
 *  id, lastUpdated?
 *  status, name, label
 * }
 */
export const KpiJobResultDef: ObjectDef<KpiJobResultData> = {
    type: 'object',
    title: KPI_JOB_RESULT_TYPEDEF,
    properties: {
        jobName: t.string.id,
        last: KpiJobRunInfoType,
        lastSuccess: KpiJobRunInfoType,
    },
    required: ['jobName'],
    index: {
        id: 'jobName',
        sort: 'jobName',
    },
};

export const KpiJobResultType = new Tobject(KpiJobResultDef);
