import { getSociety_SG } from './_factories';
import { SocietyType, SocietyView, AddressView } from './_types';
import { JoeLogger } from '../src/public_api';


describe('Joe-Fx Validation', () => {
    beforeEach(() => {
        JoeLogger.isProd = true;
    });
    
    it('No error on validate when valid', () => {
        const sg = getSociety_SG();
        SocietyType.prepare(sg);
        const validation = SocietyType.validate(sg);
        JoeLogger.debug(validation.errors);
        expect(validation.withError()).toBeFalsy();
    });

    it('Unvalid validation when society.name = undefined', () => {
        const sg = getSociety_SG();
        SocietyType.prepare(sg);
        sg.name.common = '';
        const validation = SocietyType.validate(sg);
        JoeLogger.debug(validation.errors);
        expect(validation.withError()).toBeTruthy();
    });

    it('Unvalid validation when one child address is unvalid', () => {
        const sg = getSociety_SG();
        const view = new SocietyView(sg);
        const sgMainAddress = view.addresses.find((a) => a.oid === 'sg-main')!;
        sgMainAddress.city = '';
        const validation = SocietyType.validate(sg);
        expect(validation.withError()).toBeFalsy();
    });

    it('Valid validation when unvalid child address has been removed', () => {
        const sg = getSociety_SG();
        const view = new SocietyView(sg);
        const sgMainAddress = view.addresses.find((a) => a.oid === 'sg-main')!;
        sgMainAddress.city = '';
        view.addresses.remove(sgMainAddress);
        const withError = view.validate().withError();
        expect(withError).toBeFalsy();
    });

    it('Unvalid validation on Society view when one child address is unvalid', () => {
        const sg = getSociety_SG();
        const view = new SocietyView(sg);
        const sgMainAddress = view.addresses.find((a) => a.oid === 'sg-main')!;
        sgMainAddress.city = '';
        expect(view.$validation.withError()).toBeTruthy();
    });

    it('Unvalid validation on Society view when more then 4 addresses', () => {
        const sg = getSociety_SG();
        const view = new SocietyView(sg);
        const sgNewAddress = view.addresses.$newChild<AddressView>();
        sgNewAddress.$assign({
            oid: 'sg-new',
            kind: 'new',
            city: 'PARIS',
            num: 6,
            street: 'rue new',
            info: 'Quartier'
        });
        view.addresses.add(sgNewAddress);
        expect(view.$validation.withError()).toBeTruthy();
    });
    
});
