import { JoeLogger } from 'joe-fx';
import { S_ENGIE_MAIL } from '../src';


describe( 'ENGIE mail address Validation', () => {

    beforeEach(() => {
        JoeLogger.isProd = true;
    });

    it( 'brice.prunier@engie.com is a valid ENGIE mail', () => {
        const validationResult = S_ENGIE_MAIL.validate( 'brice.prunier@engie.com' );
        expect( validationResult.errors ).toEqual({});

    } );

    it( 'brice.prunier@engie.com is a valid ENGIE mail', () => {
        const validationResult = S_ENGIE_MAIL.validate( 'brice.prunier@engie.com' );
        expect( validationResult.errors ).toEqual({});

    } );

    it( 'brice.prunier@fr.engie.com is a valid ENGIE mail', () => {
        const validationResult = S_ENGIE_MAIL.validate( 'brice.prunier@fr.engie.com' );
        expect( validationResult.errors ).toEqual({});

    } );

    it( 'brice.prunier@fr.Engie.com is a valid ENGIE mail', () => {
        const validationResult = S_ENGIE_MAIL.validate( 'brice.prunier@fr.Engie.com' );
        expect( validationResult.errors ).toEqual({});

    } );

    it( 'brice.prunier@fr.ENGIE.COM is a valid ENGIE mail', () => {
        const validationResult = S_ENGIE_MAIL.validate( 'brice.prunier@fr.ENGIE.COM' );
        expect( validationResult.errors ).toEqual({});

    } );

    it( 'brice.prunier@fr.TOTO.COM is not a valid ENGIE mail', () => {
        const validationResult = S_ENGIE_MAIL.validate( 'brice.prunier@fr.TOTO.COM' );
        expect( validationResult.errors ).not.toEqual({});

    } );


} );
