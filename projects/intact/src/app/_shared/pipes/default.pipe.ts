import { Pipe, PipeTransform } from '@angular/core';
import { isBlank } from 'joe-fx';

@Pipe({
  name: 'default'
})
export class DefaultPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return ( isBlank( value ) && args.length )
      ? args[ 0 ]
      : value;
  }
}


