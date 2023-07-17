import {IRuntimeContext, RuntimeEntry, ListDataModel} from 'joe-viewmodels';
import {AppApisInfoData, AppApisInfoType} from 'intact-models';




export class AppApisViewModel extends ListDataModel<AppApisInfoData> {

    constructor(entry: RuntimeEntry, parentContext?: IRuntimeContext) {
        super(entry, AppApisInfoType, parentContext);
        this.contextname = 'Api List';
    }

    public get withData(): boolean {
        return this.loaded && this.view.length > 0;
    }

}

