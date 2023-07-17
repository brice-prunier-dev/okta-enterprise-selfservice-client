import { PipeTransform, Pipe } from '@angular/core';

@Pipe( {
    name: 'filter',
    pure: false
} )
export class FilterPipe implements PipeTransform {
    transform( items: any[], filterFn: ( item: any, stmt: string ) => boolean, stmt: string ): any {
        if ( !items || !filterFn ) {
            return items;
        }
        return items.filter( item => filterFn( item, stmt ) );
    }
}