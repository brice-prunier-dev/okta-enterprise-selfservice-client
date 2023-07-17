import { StringMap, Tstring } from 'joe-fx';
import { LabelData } from 'joe-models';
import { UsageQueryData } from './usage-query.model';

export enum CDH_UNIT {
    countPerMonth = 'CountPerMonth',
    countPerDay = 'CountPerDay',
    countPerHour = 'CountPerHour',
    countPerMinute = 'CountPerMinute'
}

export const S_CDH_UNITTYPE = new Tstring({
    type: 'string',
    title: 'S_CDH_UNITTYPE',
    minlength: 1,
    maxlength: 20,
    enum: ['CountPerMonth', 'CountPerDay', 'CountPerHour', 'CountPerMinute'],
    default: 'CountPerDay'
});

export enum CDH_TARGET {
    clientId = 'ClientId',
    clientIdByUser = 'ClientIdByUser',
    user = 'User'
}

export const S_CDH_TARGETYPE = new Tstring({
    type: 'string',
    title: 'S_CDH_TARGETTYPE',
    minlength: 1,
    maxlength: 1,
    enum: ['ClientId', 'ClientIdByUser', 'User'],
    default: 'ClientId'
});

export interface UsageData extends LabelData {
    data: number[];
}

export interface UsageResponseData {
    name: string | undefined;
    labels: string[];
    datasets: UsageData[];
}

export interface CdhUsageData {
    query: UsageQueryData;
    response: UsageResponseData;
    pages?: StringMap<UsageResponseData>;
}

export interface CdhContextData {
    monthly: CdhUsageData[];
    daily: CdhUsageData[];
    hourly: CdhUsageData[];
    minutly: CdhUsageData[];
}
