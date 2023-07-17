import { ObjectDef, Tobject } from 'joe-fx';
import { IdData, IdDef, LabelData, LabelDef } from 'joe-models';
import { t } from 'joe-types';
import { StringMap } from 'joe-fx';
import { KpiJobResultData, KpiJobResultType } from './kpis/kpi-job-result.model';
import { KpiSummaryData } from './kpis/kpi-summary.model';


export const KPI_ID = "id";
export const KPI_STORE = "kpis";



//
// ─── INFRA ──────────────────────────────────────────────────────────────────────
//

export const KPIINFO_TYPEDEF = 'kpiinfo';
/**
 * {
 *  id, lastUpdated?
 *  status, name, label
 * }
 */
export interface KpiInfoData extends IdData, LabelData {
    dependencies: string[];
    lastComputed: string;
    depencenciesStatus: KpiJobResultData[];
    result: StringMap<KpiSummaryData>
}

/**
 * {
 *  id, lastUpdated?
 *  status, name, label
 * }
 */
export const KpiInfoDef: ObjectDef<KpiInfoData> = {
    type: 'object',
    title: KPIINFO_TYPEDEF,
    extends: [
        IdDef,
        LabelDef,
    ],
    properties: {
        dependencies: t.array.of(t.string.id),
        lastComputed: t.string.datetime_iso,
        depencenciesStatus: t.array.of(KpiJobResultType),
        result: t.map.of(KpiJobResultType),
    },

    required: [
        ...IdDef.required,
        ...LabelDef.required,
        'dependencies',
        'lastComputed',
        'depencenciesStatus',
    ]
};

export const KpiInfoType = new Tobject(KpiInfoDef);