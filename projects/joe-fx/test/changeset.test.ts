import { getPerson_BP_1, getSociety_SG } from './_factories';
import { PersonView, SocietyType, SocietyView } from './_types';
import { ChangeStateEnum, JoeLogger } from '../src';
import { ChangeSet } from '../src';



describe('Joe-Fx Changeset ', () => {
    beforeEach(() => {
        JoeLogger.isProd = true;
    });

    it('Read ChangeSet after view update', () => {
        const sg = getSociety_SG();
        SocietyType.prepare(sg);
        const view = new SocietyView(sg);
        const sgMainAddress = view.addresses.find((a) => a.oid === 'sg-main')!;
        sgMainAddress.info = 'bibi';
        expect(view.$isEditing).toBeTruthy();
        const changes = [] as ChangeSet;
        view.$editor!.writeChangeSet(changes);
        expect(changes.length).toEqual(1);
        const json = view.$json();
        const sgMainAddress2 = view.addresses.find((a) => a.oid === 'sg-main');
        expect(changes[0].path).toBe('$>addresses>(sg-main)');
        expect(changes[0].obj.info).toBe('bibi');
    });

    it('Read ChangeSet after view creation', () => {
        const bp = getPerson_BP_1();
        const view = new PersonView();
        view.$assign(bp);

        expect(view.oid).toBe(bp.oid);
        expect(view.name.first).toBe(bp.name.first);
        expect(view.name.last).toBe(bp.name.last);
        expect(view.addresses.keys().length).toBe(Object.keys(bp.addresses).length);

        const changes = [] as ChangeSet;
        view.$editor!.writeChangeSet(changes);
        expect(changes.length).toBeGreaterThan(0);
    });

    it('Re apply ChangeSet wit update', () => {
        const sg = getSociety_SG();
        const view = new SocietyView(sg);
        const sgMainAddress = view.addresses.find((a) => a.oid === 'sg-main')!;
        sgMainAddress.info = 'bibi';
        sgMainAddress.street = 'tutu';
        expect(view.$isEditing).toBeTruthy();
        const changes = [] as ChangeSet;
        view.addresses.removeAt(3);
        view.$editor!.writeChangeSet(changes);
        expect(changes.length).toEqual(2);
        const updateChange = changes.find((c) => c.op === ChangeStateEnum.updated)!;
        expect(updateChange.path).toBe('$>addresses>(sg-main)');
        expect(Object.keys(updateChange.obj).length).toBe(2);
        expect(updateChange.obj.info).toBe('bibi');
        expect(updateChange.obj.street).toBe('tutu');
        
        const sg2 = getSociety_SG();
        SocietyType.prepare(sg2);
        const view2 = new SocietyView(sg2);
        view2.$edit().applyChangeSet(changes);
        expect(view2.addresses.length).toBe(3);
        const sgMainAddress2 = view2.addresses.find((a) => a.oid === 'sg-main')!;
        expect(sgMainAddress2.info).toBe('bibi');
    });

    it('Re apply ChangeSet wit create', () => {
        const bp = getPerson_BP_1();
        const view = new PersonView();
        view.$assign(bp);

        expect(view.oid).toBe(bp.oid);
        expect(view.name.first).toBe(bp.name.first);
        expect(view.name.last).toBe(bp.name.last);
        expect(view.addresses.keys().length).toBe(Object.keys(bp.addresses).length);

        const changes = [] as ChangeSet;
        view.$editor!.writeChangeSet(changes);
        expect(changes.length).toBeGreaterThan(0);

        const view2 = new PersonView();
        view2.$edit().applyChangeSet(changes);

        expect(view2.oid).toBe(view.oid);
        expect(view2.name.first).toBe(view.name.first);
        expect(view2.name.last).toBe(view.name.last);
        expect(view2.addresses.keys().length).toBe(Object.keys(bp.addresses).length);
    });
});
