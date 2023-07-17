import {ApiInfoData, APPAPIS_STORE} from 'intact-models';
import {
    DetailViewModel,
    RuntimeEntry,
    StoreManager,
    CommandNotification,
    IRuntimeContext
} from 'joe-viewmodels';
import {ApiDocData, ApiDocType, ApiDocView, APIS_STORE} from './api-doc.model';
import {AppApisService} from './appapis.service';
export class ApiDetailViewModel extends DetailViewModel<ApiDocData, ApiDocView> {
    constructor(entry: RuntimeEntry, parentContext?: IRuntimeContext) {
        super(entry, ApiDocType, parentContext);
        const apiId = this.entry.query.apiId;
        this.contextname = apiId + ' (Api)';
    }

    public async saveInfoAsync(): Promise<boolean> {
        this.resetLifecycleValidity();
        const self = this;
        const view = this.view;

        const apiId = view.id;
        const store = StoreManager.INSTANCE.store<AppApisService>(APPAPIS_STORE);
        const payload = view.$json() as unknown as ApiDocData;
        return store.putApiAsync(payload).then((_) => {
            view.$editor!.endEdit();
            self.onStateChanged.next(CommandNotification.StateChanged);
            if (self.editBehavior && self.editBehavior.notify) {
                self.editBehavior.notify('Api Info', 'Saved');
            }
            return true;
        });
    }
}
