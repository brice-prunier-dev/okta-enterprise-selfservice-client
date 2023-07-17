

export function calcStrLen( str: string ) {
    let len = 0;

    for ( let i = 0; i < str.length; i++ ) {
        const charCode = str.charCodeAt( i );
        if ( charCode === 105 || charCode === 108 ) {
            len += 0.5;
        } else if ( str.charCodeAt( i ) > 0 && str.charCodeAt( i ) < 128 ) {
            len++;
        } else {
            len += 2;
        }
    }

    return len;
}

export function isFittingString( str: string, maxWidth: number, fontSize: number ): boolean {
    const fontWidth = fontSize * 1.3;
    maxWidth = maxWidth * 2;
    const width = calcStrLen( str ) * fontWidth;
    return width <= maxWidth;
}

export function fittingString( str: string, maxWidth: number, fontSize: number ) {
    const fontWidth = fontSize * 1.3;
    maxWidth = maxWidth * 2;
    const width = calcStrLen( str ) * fontWidth;
    const ellipsis = '…';
    if ( width > maxWidth ) {
        const actualLen = Math.floor( ( maxWidth - 10 ) / fontWidth );
        const result = str.substring( 0, actualLen ) + ellipsis;
        return result;
    }

    return str;
}
