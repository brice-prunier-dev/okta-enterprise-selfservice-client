import {IRuntimeContext, RuntimeEntry, ListDataModel} from 'joe-viewmodels';
import {ScopeDocData, ScopeDocType} from 'intact-models';

export class ScopeListViewModel extends ListDataModel<ScopeDocData> {
    constructor(entry: RuntimeEntry, parentContext?: IRuntimeContext) {
        super(entry, ScopeDocType, parentContext);
        this.contextname = 'Scope List';
    }

    public get withScopes(): boolean {
        return this.loaded && this.view.length > 0;
    }
}
