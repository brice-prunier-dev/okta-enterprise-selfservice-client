import { ObjectDef, Tobject } from 'joe-fx';
import { t } from 'joe-types';



//
// ─── INFRA ──────────────────────────────────────────────────────────────────────
//

export const KPI_SUMMARY_TYPEDEF = 'kpisummary';
/**
 * {
 *  id, lastUpdated?
 *  status, name, label
 * }
 */
export interface KpiSummaryData {
    severity: number
}

/**
 * {
 *  id, lastUpdated?
 *  status, name, label
 * }
 */
export const KpiSummaryDef: ObjectDef<KpiSummaryData> = {
    type: 'object',
    title: KPI_SUMMARY_TYPEDEF,
    properties: {
        severity: t.number.int,
    },
    required: [ 'severity' ],
};

export const KpiSummaryType = new Tobject(KpiSummaryDef);