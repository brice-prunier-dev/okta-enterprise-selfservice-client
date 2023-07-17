

declare global {
    export interface Promise<T> {
        thenReturn( value: any ): any | PromiseLike<any>;
    }
}
Promise.prototype.thenReturn = function ( value: any ): any | PromiseLike<any> {
    // tslint:disable-next-line: only-arrow-functions
    return this.then( () => value );
};
/**
 * Array with item of 'a' that are in 'b'
 */
export function arrayIntersect<T>( a: Array<T>, b: Array<T> ) {
    // tslint:disable-next-line:no-shadowed-variable
    let t: Array<T>;
    if ( b.length > a.length ) {
        t = b;
        b = a;
        a = t;
    }
    return a.filter( ( e ) => b.indexOf( e ) > -1 );
}
/**
 * Array with item of 'a' that are not in 'b'
 */
export function arrayMinus<T>( a: Array<T>, b: Array<T> ) {
    return a.filter( ( e ) => b.indexOf( e ) === -1 );
}

/**
 * Turn an input description label into a "id" key value.
 * @param input description value.
 * @param shortTerms array of short terms.
 * @param longTerms array of long terms.
 */

// ────────────────────────────────────────────────────────────────────────────────
export function desc2id( input: string, substitutes: [ string, string ][] = [] ) {
    const subtitute = ( word: string ): string => {
        const sub = substitutes.find( ( map ) => map[ 0 ] === word );
        return sub === undefined ? word : sub[ 1 ];
    };
    const accent = [
        /[\300-\306]/g, /[\340-\346]/g, // A, a
        /[\310-\313]/g, /[\350-\353]/g, // E, e
        /[\314-\317]/g, /[\354-\357]/g, // I, i
        /[\322-\330]/g, /[\362-\370]/g, // O, o
        /[\331-\334]/g, /[\371-\374]/g, // U, u
        /[\321]/g, /[\361]/g, // N, n
        /[\307]/g, /[\347]/g, // C, c
    ];
    const noaccent = [ 'A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N', 'n', 'C', 'c' ];

    for ( let i = 0; i < input.length; i++ ) {
        input = input.replace( accent[ i ], noaccent[ i ] );
    }
    return input
        .toLowerCase()
        .replace( /[()\[\]]/g, '' )
        .replace( /\s*/g, ' ' )
        .split( ' ' )
        .map( ( word ) => subtitute( word ) )
        .join( '_' );
}
export function isaccent( input: string ) {
    const accents = [
        /[\300-\306]/g, /[\340-\346]/g, // A, a
        /[\310-\313]/g, /[\350-\353]/g, // E, e
        /[\314-\317]/g, /[\354-\357]/g, // I, i
        /[\322-\330]/g, /[\362-\370]/g, // O, o
        /[\331-\334]/g, /[\371-\374]/g, // U, u
        /[\321]/g, /[\361]/g, // N, n
        /[\307]/g, /[\347]/g, // C, c
    ];
    for ( const accent of accents ) {
        if ( new RegExp( accent ).test( input ) ) {
            return true;
        }
    }
    return false;
}
// ────────────────────────────────────────────────────────────────────────────────


