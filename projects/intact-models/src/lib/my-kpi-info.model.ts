import { ObjectDef, Tobject } from 'joe-fx';
import { IdData, LabelData } from 'joe-models';
import { t } from 'joe-types';
import { DeprecatedAccountData, DeprecatedAccountType } from './kpis/deprecated-account.model';
import { SharedAccountData, SharedAccountDef } from './kpis/shared-account.model';
import { SharedServiceData, SharedServiceDef } from './kpis/shared-service.model';

export const MY_KPI_ID = "id";
export const MY_KPI_STORE = "mykpis";
export const MY_KPIINFO_TYPEDEF = "Mykpiinfo";

/**
 * {
 *  id, lastUpdated?
 *  status, name, label
 * }
 */
export interface MyKpiInfoData extends IdData, LabelData {
    projectId?: string,
    deprecatedAccount?: DeprecatedAccountData[],
    sharedAccounts?: Record< string, SharedAccountData >,
    sharedService?: Record< string, SharedServiceData >,
    unusedScopes?: string[];
}

/**
 * {
 *  id, lastUpdated?
 *  status, name, label
 * }
 */
export const MyKpiInfoDef: ObjectDef<MyKpiInfoData> = {
    type: 'object',
    title: MY_KPIINFO_TYPEDEF,
    extends: [],
    properties: {
        projectId: t.string.id,
        deprecatedAccount: t.array.of(DeprecatedAccountType),
        sharedAccounts: t.map.of(SharedAccountDef),
        sharedService: t.map.of(SharedServiceDef),
        unusedScopes: t.array.of(t.string.id),
    },
    required: ['projectId'],
    index: { id: 'projectId' },
};
export const MyKpiInfoType: Tobject<MyKpiInfoData> = new Tobject(MyKpiInfoDef);
