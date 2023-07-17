import { Pipe, PipeTransform } from '@angular/core';
import { isArrayAssigned } from 'joe-fx';
import { pascalCase } from 'joe-types';
@Pipe({
    name: 'listlabel',
    pure: true,
    standalone: true
})
export class ArrayLabelPipe implements PipeTransform {
    // #region Public Methods (1)

    public transform( value: string[], max: number = 100 ) {
        let label = isArrayAssigned( value )
            ? value.map( s => pascalCase( s ) ).join( ', ' )
            : 'N/A';

        if ( label.length > max ) {
            label = label.substr( 0, max );
            const lastComa = label.lastIndexOf( ',' );
            if ( lastComa > -1 ) {
                label = label.substr( 0, lastComa ) + '...';
            }
        }

        return label;
    }

    // #endregion Public Methods (1)
}
