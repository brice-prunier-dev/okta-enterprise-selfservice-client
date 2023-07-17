import {IRuntimeContext, RuntimeEntry, StoreManager, ListDataModel} from "joe-viewmodels";
import {KpiInfoData, KpiInfoType, KPI_STORE} from "intact-models";
import {KpisService} from "./kpis.service";
import moment from "moment";

export class KpiListViewModel extends ListDataModel<KpiInfoData> {
    constructor(entry: RuntimeEntry, parentContext?: IRuntimeContext) {
        super(entry, KpiInfoType, parentContext);
        this.contextname = 'Kpi List';
    }

    public loadOp(): Promise<void> {
        const store = StoreManager.INSTANCE.store<KpisService>(KPI_STORE);
        const self = this;

        return store.getAll().then(ks => {
            self.setView(ks);
        });
    }

    getPerformanceValue(kpi: KpiInfoData): number {
        return Object.values(kpi.result).reduce((c, n) => c + n.severity, 0);
    }
    formatUpdated(kpi: KpiInfoData) {
        return moment(kpi.lastComputed).fromNow();
    }

    getIcon(id: KpiInfoData) {
        switch (id.id) {
            case 'missing-cmdbs':
                return 'money_off';
            case 'deprecated-accounts':
                return 'person_off';
            default:
                return '';
        }
    }
}