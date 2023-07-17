import {ViewModelManager, queryList, queryById} from '../src';
import {JoeLogger} from "joe-fx";
import {SocietyListDataModel, SocietyDetailViewModel } from './_viewmodels';

describe('ViewModelManager Entries ', () => {
    const vmm = new ViewModelManager();
    beforeEach(() => {
        JoeLogger.isProd = true;
        vmm.clearViewModels();
    });

    
    it('Validate resolveStaticViewModel return a static RuntimeContext', () => {
        const societyListVm = vmm.resolveStaticViewModel<SocietyListDataModel>(SocietyListDataModel, queryList);
        societyListVm.loadOp();

       expect(societyListVm.entry.static).toBeTruthy();
    });

    it('Validate resolveCurrentViewModel return a current RuntimeContext', () => {
        const societyListVm = vmm.resolveStaticViewModel<SocietyListDataModel>(SocietyListDataModel, queryList);
        societyListVm.loadOp();
        const afSocietyVm = vmm.resolveCurrentViewModel<SocietyDetailViewModel>(SocietyDetailViewModel, queryById('af'));
        afSocietyVm.loadOp();

        expect(societyListVm.entry.static).toBeTruthy();
        
        expect(afSocietyVm.entry.current).toBeTruthy();
    });

    it('Validate multiple resolveCurrentViewModel return a current on last RuntimeContext', () => {
        const societyListVm = vmm.resolveStaticViewModel<SocietyListDataModel>(SocietyListDataModel, queryList);
        societyListVm.loadOp();
        
        const afSocietyVm = vmm.resolveCurrentViewModel<SocietyDetailViewModel>(SocietyDetailViewModel, queryById('af'));
        afSocietyVm.loadOp();

        const sgSocietyVm = vmm.resolveCurrentViewModel<SocietyDetailViewModel>(SocietyDetailViewModel, queryById('sg'));
        sgSocietyVm.loadOp();

        expect(societyListVm.entry.static).toBeTruthy();
        expect(afSocietyVm.entry.current).toBeFalsy();
        expect(sgSocietyVm.entry.current).toBeTruthy();
    });

   


});