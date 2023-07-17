import {IRuntimeContext, RuntimeEntry, ListDataModel} from 'joe-viewmodels';
import {AppInfoData} from 'intact-models';

export class SubscribersViewModel extends ListDataModel<AppInfoData> {

    constructor(entry: RuntimeEntry, parentContext?: IRuntimeContext) {
        super(entry, undefined, parentContext);
        this.contextname = 'Subscribers List';
    }



    public get scope(): string {
        return this.entry.query.scope;
    }
}


