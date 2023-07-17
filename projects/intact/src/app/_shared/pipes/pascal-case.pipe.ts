import { Pipe, PipeTransform } from '@angular/core';
import { pascalCase } from 'joe-types';
import { isStringAssigned } from 'joe-fx';

@Pipe( {
    name: 'pascalCase'
} )
export class PascalCasePipe implements PipeTransform {

    transform( value: any, args?: any ): any {
        if ( isStringAssigned( value ) ) {
            return pascalCase( value );
        }
        return null;
    }

}
