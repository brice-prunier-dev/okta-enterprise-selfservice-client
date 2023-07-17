import { JoeLogger } from 'joe-fx';
import { S_GAIA } from '../src';

describe('GAIA type validations', () => {

    beforeEach(() => {
        JoeLogger.isProd = true;
    });

    
    it( 'Uper case AB1234 is a valid GAIA (XX000)', () => {
        const validationResult = S_GAIA.validate( 'AB1234' );
        expect( validationResult.errors ).toEqual({});
    } );

    it( 'Uper case AB1234-O is a valid Admin GAIA (XX000-0)', () => {
        const validationResult = S_GAIA.validate( 'AB1234-O' );
        expect( validationResult.errors ).toEqual({});

    } );

    it( 'Lower case ab1234 is a valid GAIA (xx0000)', () => {
        const validationResult = S_GAIA.validate( 'ab1234' );
        expect( validationResult.errors ).toEqual({});

    } );

    it( 'Lower case abc234-o is a valid Admin GAIA (xx0000-0)', () => {
        const validationResult = S_GAIA.validate( 'abc234-o' );
        expect( validationResult.errors ).toEqual({});

    } );

    it( 'Mixed case aB1234 is a valid GAIA (xX0000)', () => {
        const validationResult = S_GAIA.validate( 'aB1234' );
        expect( validationResult.errors ).toEqual({});

    } );

    it( 'Mixed case aBc234-o is a valid Admin GAIA (xXx000-0)', () => {
        const validationResult = S_GAIA.validate( 'aBc234-o' );
        expect( validationResult.errors ).toEqual({});

    } );

    it( 'ABC456 is a valid GAIA (xXx000)', () => {
        const validationResult = S_GAIA.validate( 'ABC456' );
        expect( validationResult.errors ).toEqual({});
    } );

    it( 'abcd12 is a valid GAIA (xxxx00)', () => {
        const validationResult = S_GAIA.validate( 'abcd12' );
        expect( validationResult.errors ).toEqual({});

    } );

    it( 'abcd12-O is a valid Admin GAIA  (xxxx00-o)', () => {
        const validationResult = S_GAIA.validate( 'abcd12-O' );
        expect( validationResult.errors ).toEqual({});

    } );

    it( 'Lower case ABBC56-Y is not a valid Admin GAIA (xxxx00-Y)', () => {
        const validationResult = S_GAIA.validate( 'ab1234-Y' );
        expect( validationResult.errors ).not.toEqual({});
    } );
} );
