import { Pipe, PipeTransform } from '@angular/core';
import { RuntimeMessage } from 'joe-fx';
@Pipe({
    name: 'valmsg',
    pure: true
})
export class ValidationMessagePipe implements PipeTransform {
    transform(obj: any) {
        if (obj) {
            return RuntimeMessage.AsText(obj);
        }
        return undefined;
    }
}
