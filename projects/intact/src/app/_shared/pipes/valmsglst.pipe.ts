import { Pipe, PipeTransform } from '@angular/core';
import { RuntimeMessage } from 'joe-fx';
@Pipe({
    name: 'valmsglst',
    pure: true
})
export class ValidationMessageListPipe implements PipeTransform {
    transform(obj: any) {
        if (obj) {
            return RuntimeMessage.AsText(obj);
        }
        return [];
    }
}
