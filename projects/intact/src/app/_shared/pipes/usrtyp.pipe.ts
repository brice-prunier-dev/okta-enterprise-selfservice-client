import { Pipe, PipeTransform } from '@angular/core';
import { userTypeLabel } from 'intact-models';

@Pipe( {
    name: 'usrtyp'
} )
export class UserTypePipe implements PipeTransform {

    transform( value: any, args?: any ): any {
        return userTypeLabel( value );
    }

}
