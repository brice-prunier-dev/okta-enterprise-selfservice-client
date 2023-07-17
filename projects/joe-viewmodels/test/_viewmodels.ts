import {IRuntimeContext, RuntimeEntry, ListDataModel, DetailViewModel} from '../src';
import {SocietyData, SocietyType, SocietyView} from './_types';
import {getSociety_SG, getSociety_AF, getAllSocieties } from './_factories';

export class SocietyListDataModel extends ListDataModel<SocietyData> {

    constructor(entry: RuntimeEntry, parentContext?: IRuntimeContext) {
        super(entry, SocietyType, parentContext);
        this.contextname = 'Societies';
    }
    
    public loadOp(): Promise<any> {
        
        this.loadData(getAllSocieties());
        return Promise.resolve(true);
    }
}

export class SocietyDetailViewModel extends DetailViewModel<SocietyData, SocietyView> {
    constructor(entry: RuntimeEntry, parentContext?: IRuntimeContext) {
        super(entry, SocietyType, parentContext);
        this.contextname = 'Societies';
    }
    

    public loadOp() {
        const id = this.entry.query.id as string;
        if (id == 'af') {
            this.loadData(getSociety_AF());
        } else if (id == 'sg') {
            this.loadData(getSociety_SG());
        } else {
            this.setError( new Error(`Bad society id: "${id}".`));
        }
        
    }
}