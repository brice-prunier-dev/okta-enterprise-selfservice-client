import { Pipe, PipeTransform } from '@angular/core';
@Pipe( {
    name: 'dashpart',
    pure: true
} )
export class DashPartPipe implements PipeTransform {
    // #region Public Methods (1)

    public transform( value: any, index: string ) {
        if ( value && typeof ( value ) === 'string' ) {
            const parts = value.split( '-' );
            let idx = parseFloat( index );
            if ( idx < 0 ) {
                idx = parts.length + idx;
            }
            return parts[ idx ].toUpperCase();
        }
        return '';
    }

    // #endregion Public Methods (1)
}
