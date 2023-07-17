import {
    CdhContextData,
    CDH_UNIT,
    UsageQueryData,
    UsageQueryView,
    UsageResponseData,
    CdhUsageData
} from 'intact-models';
import {StringMap} from 'joe-fx';
import {IRuntimeContext, RuntimeEntry, StoreManager, DetailDataModel} from 'joe-viewmodels';
import {CDH_TARGET} from 'projects/intact-models/src';
import {Subscription} from 'rxjs';
import {CDH_STORE} from './app-usages.resolver';
import {AppUsagesService} from './app-usages.service';

export class AppUsagesContext extends DetailDataModel<CdhContextData> {
    private _queryChangeSubscription = new Subscription();
    constructor(entry: RuntimeEntry, parentContext?: IRuntimeContext) {
        super(entry, undefined, parentContext);
        this.contextname = 'Cdh App Context';
        this.resetView();
    }

    query!: UsageQueryView;

    getUsageData(unit: CDH_UNIT): CdhUsageData[] {
        switch (unit) {
            case CDH_UNIT.countPerMonth:
                return this.view!.monthly;
            case CDH_UNIT.countPerDay:
                return this.view!.daily;
            case CDH_UNIT.countPerHour:
                return this.view!.hourly;
            case CDH_UNIT.countPerMinute:
                return this.view!.minutly;
            default:
                return [];
        }
    }

    resetView() {
        const oldUnit = this.query;
        this._queryChangeSubscription.unsubscribe();
        this._queryChangeSubscription = new Subscription();

        this.view! = {
            monthly: [],
            daily: [],
            hourly: [],
            minutly: []
        };
        const today = new Date();
        this.query = new UsageQueryView({
            userId: undefined,
            clientId: this.entry.query.id as string,
            unit: oldUnit?.unit || CDH_UNIT.countPerDay,
            target: oldUnit?.target || CDH_TARGET.clientId,
            year: today.getFullYear(),
            month: today.getMonth(),
            day: today.getDay()
        });
        this.query.$edit(true);
    }

    spareIntoPages(query: UsageQueryData, response: UsageResponseData, querySet: CdhUsageData[]) {
        const separatorIndex = response.datasets[0].label.indexOf(':');
        if (separatorIndex > 1) {
            const clientMap: StringMap<UsageResponseData> = {};
            let firstKey: string | undefined = undefined;
            for (const usageResponseData of response.datasets) {
                const clientId = usageResponseData.label.substring(0, separatorIndex).trim()!;
                if (!firstKey) {
                    firstKey = clientId;
                }
                const clientIdData =
                    clientMap[clientId] ||
                    (clientMap[clientId] = {
                        name: clientId,
                        labels: response.labels,
                        datasets: []
                    });
                clientIdData.datasets.push(usageResponseData);
            }
            querySet.push({query, response: clientMap[firstKey!], pages: clientMap});
        } else {
            querySet.push({query, response});
        }
    }

    extractAppName(appClientId: string): string {
        const isIntactClientid = appClientId.startsWith('2-') || appClientId.startsWith('3-');
        if (isIntactClientid) {
            const segments = appClientId.split(' ');
            const clientId = segments[0];
            const label = isIntactClientid ? clientId.substring(4, clientId.length - 16) : clientId;
            return segments.length > 1 ? label + ' ' + segments.slice(1).join(' ') : label;
        } else if (appClientId.indexOf('@') > -1) {
            return appClientId.split('@')[0];
        }
        return appClientId;
    }

    runQuery(unit: CDH_UNIT): Promise<UsageResponseData> {
        this.setError(undefined);
        const queryToRun = this.query.$json() as unknown as UsageQueryData;
        const queryToSpare = this.query.$json() as unknown as UsageQueryData;
        queryToRun.month = queryToRun.month;
        queryToRun.unit = unit;
        const isMinutly = unit === CDH_UNIT.countPerMinute;
        const querySet = this.getUsageData(unit);
        const cachedData = querySet.find((q) => UsageQueryView.equals(queryToRun, q.query));

        if (cachedData !== undefined) {
            return Promise.resolve(cachedData.response);
        }

        const cdhProxy = StoreManager.INSTANCE.store<AppUsagesService>(CDH_STORE);
        const self = this;
        return cdhProxy
            .query(queryToRun)
            .then((r) => {
                if (r.datasets.length === 0) {
                    return Promise.reject('No result for ' + r.name);
                }
                for (const dataset of r.datasets) {
                    dataset.label = self.extractAppName(dataset.label);
                }
                if (unit === CDH_UNIT.countPerMinute) {
                    self.spareIntoPages(queryToSpare, r, querySet);
                } else {
                    querySet.push({query: queryToSpare, response: r});
                }
                return r;
            });
    }

    clearQueries(unit: CDH_UNIT): CdhUsageData[] {
        switch (unit) {
            case CDH_UNIT.countPerMonth:
                return (this.view!.monthly = []);

            case CDH_UNIT.countPerDay:
                return (this.view!.daily = []);

            case CDH_UNIT.countPerHour:
                return (this.view!.hourly = []);

            case CDH_UNIT.countPerMinute:
                return (this.view!.minutly = []);

            default:
                return [];
        }
    }

}
