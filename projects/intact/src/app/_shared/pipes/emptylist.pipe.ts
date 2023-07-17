import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'emptylist',
    pure: false,
    standalone: true
})
export class EmptyListPipe implements PipeTransform {
    transform( value: any, index: string ) {
        if ( value ) {
            return value.length === 0;
        }
        return false;
    }
}
