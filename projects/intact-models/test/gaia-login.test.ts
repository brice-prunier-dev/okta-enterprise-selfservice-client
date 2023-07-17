import { JoeLogger } from 'joe-fx';
import { S_GAIA_LOGIN } from '../src';

describe('GAIA ID validations <gaia>@engie|myengie.com', () => {

    beforeEach(() => {
        JoeLogger.isProd = true;
    });

    
    
    it( 'AB1234@engie.com is a valid GAIA login', () => {
        const validationResult = S_GAIA_LOGIN.validate( 'AB1234@engie.com' );
        expect( validationResult.errors ).toEqual({});

    } );

    it( 'Lower case abc234-o@engie.com is a valid Admin GAIA login', () => {
        const validationResult = S_GAIA_LOGIN.validate( 'abc234-o@engie.com' );
        expect( validationResult.errors ).toEqual({});

    } );

    it( 'Upper case AB1234-O@engie.com is a valid Admin GAIA login', () => {
        const validationResult = S_GAIA_LOGIN.validate( 'AB1234-O@engie.com' );
        expect( validationResult.errors ).toEqual({});

    } );

    it( 'ab1234@engie.com is a valid GAIA login', () => {
        const validationResult = S_GAIA_LOGIN.validate( 'ab1234@engie.com' );
        expect( validationResult.errors ).toEqual({});

    } );

    it( 'ABC123@engie.com is a valid GAIA login', () => {
        const validationResult = S_GAIA_LOGIN.validate( 'ABC123@engie.com' );
        expect( validationResult.errors ).toEqual({});

    } );

    it( 'abc123@engie.com is a valid GAIA login', () => {
        const validationResult = S_GAIA_LOGIN.validate( 'abc123@engie.com' );
        expect( validationResult.errors ).toEqual({});

    } );

    it( 'abc123@myengie.com is a valid GAIA login', () => {
        const validationResult = S_GAIA_LOGIN.validate( 'abc123@myengie.com' );
        expect( validationResult.errors ).toEqual({});

    } );

    it( 'ABCD12@engie.com is a valid GAIA login', () => {
        const validationResult = S_GAIA_LOGIN.validate( 'ABCD12@engie.com' );
        expect( validationResult.errors ).toEqual({});

    } );

    it( 'abcd12@engie.com is a valid GAIA login', () => {
        const validationResult = S_GAIA_LOGIN.validate( 'abcd12@engie.com' );
        expect( validationResult.errors ).toEqual({});

    } );

    it( 'abcd124@engie.com is not a valid GAIA login', () => {
        const validationResult = S_GAIA_LOGIN.validate( 'abcd124@engie.com' );
        expect( validationResult.errors ).not.toEqual({});

    } );

    it( 'abcd12@engie.fr is not a valid GAIA login', () => {
        const validationResult = S_GAIA_LOGIN.validate( 'abcd124@engie.fr' );
        expect( validationResult.errors ).not.toEqual({});

    } );

    it( 'abcd12@gdf-suez.fr is not a valid GAIA login', () => {
        const validationResult = S_GAIA_LOGIN.validate( 'abcd12@gdf-suez' );
        expect( validationResult.errors ).not.toEqual({});

    } );

    it( 'brice.prunier@engie.com is not a valid GAIA login', () => {
        const validationResult = S_GAIA_LOGIN.validate( 'brice.prunier@engie.com' );
        expect( validationResult.errors ).not.toEqual({});

    } );

} );
