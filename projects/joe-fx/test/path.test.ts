import { getSociety_SG } from './_factories';
import { SocietyType, SocietyView } from './_types';
import { JoeLogger, readPath, ChangeSet } from '../src';


describe('Joe-Fx XPath ', () => {
    
    beforeEach(() => {
        JoeLogger.isProd = true;
    });
    
    it('Validate "SG society" JSON obj', () => {
        const sg = getSociety_SG();
        SocietyType.prepare(sg);
        const validation = SocietyType.validate(sg);
        JoeLogger.debug(validation.errors);
        expect(validation.withError()).toBeFalsy();
    });

    it('Read "$>name>legal" on "SG society" JSON obj', () => {
        const sg = getSociety_SG();
        SocietyType.prepare(sg);
        const sgLegalName = readPath(sg, '$>name>legal');
        expect(sgLegalName).toBe('Société Générale');
    });

    it('Read addresses "sg-titre_haussman" on "SG society" JSON obj', () => {
        const sg = getSociety_SG();
        SocietyType.prepare(sg);
        const sgAddressKind = readPath(sg, '$>addresses>(sg->titre_haussman)>kind');
        expect(sgAddressKind).toBe('titre_haussman');
    });

    it('Read "$>addresses>{kind: main}>city" on "SG society" JSON obj', () => {
        const sg = getSociety_SG();
        SocietyType.prepare(sg);
        const sgAddressKind = readPath(sg, '$>addresses>{kind: main}>city');
        expect(sgAddressKind).toBe('PARIS LA DEFENSE CEDEX');
    });

    it('Write on  "$>addresses>{kind: sg-main}>info" on "SG society" JSON obj', () => {
        const sg = getSociety_SG();
        SocietyType.prepare(sg);
        const view = new SocietyView(sg);
        const sgMainAddress = view.addresses.find((a) => a.oid === 'sg-main')!;
        sgMainAddress.info = 'bibi';
        expect(view.$isEditing).toBeTruthy();
        const changes: ChangeSet = [];
        view.$editor!.writeChangeSet(changes);
        expect(changes.length).toEqual(1);
        const json = view.$json();
        const sgMainAddress2 = view.addresses.find((a) => a.oid === 'sg-main')!;
        expect(sgMainAddress2.info).toBe('bibi');
    });

    it('ObjView with index write its path correctly: "$>addresses>(sg-main)"', () => {
        const sg = getSociety_SG();
        SocietyType.prepare(sg);
        const view = new SocietyView(sg);
        const sgMainAddress = view.addresses.find((a) => a.oid === 'sg-main')!;
        const path = sgMainAddress.$src.path;
        expect(path).toBe('$>addresses>(sg-main)');
    });

    it('ObjView with index write its path correctly: "$>addresses>(sg-main)"', () => {
        const sg = getSociety_SG();
        SocietyType.prepare(sg);
        const view = new SocietyView(sg);
        const sgMainAddress = view.addresses.find((a) => a.oid === 'sg-main')!;
        const path = sgMainAddress.$src.path;
        expect(path).toBe('$>addresses>(sg-main)');
    });

    it('Assign should be the same as view', () => {
        const sg1 = getSociety_SG();

        const view1 = new SocietyView(sg1);

        expect(view1.addresses.$src).toBeTruthy();
        expect(view1.addresses.$src.path).toBe('$>addresses');

        expect(view1.name.$src).toBeTruthy();
        expect(view1.name.$src.path).toBe('$>name');
    });
});
