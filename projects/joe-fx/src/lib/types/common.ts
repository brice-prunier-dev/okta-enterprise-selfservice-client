import { IViewElement, splitPath } from '../core';
/**
 * this method links the validation state of a child view to its parent view
 * until root element.
 * @param obj source view
 */
export function corelateValidationWithParents(obj: IViewElement) {
    if (!obj.$isRoot()) {
        // const root = obj.$root();
        let current = obj;
        let parent = obj.$parent();
        const keyparts = splitPath(obj.$src.path);
        let idx = keyparts.length - 1;
        let run = current !== parent  && idx > -1;
        while (run) {
            if (current.$validation.withError()) {
                parent.$validation.errors[keyparts[idx] as string] =
                    current.$validation.errors;
            } else if (parent.$validation.errors[keyparts[idx] as string]) {
                delete parent.$validation.errors[keyparts[idx] as string];
            }
            idx--;
            current = parent;
            parent = parent.$parent();
            run = current !== parent && idx > -1;
        }
    }
}
