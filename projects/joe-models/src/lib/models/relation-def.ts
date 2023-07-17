import { IViewElement, Objview, Tobject, ObjectDef, isStringAssigned } from 'joe-fx';
import { t, RelationDefData } from 'joe-types';

/**
 * {
 *  rev?, href, path, kind, title
 * }
 */
export const RelationDefDef: ObjectDef<RelationDefData> = {
    type: 'object',
    title: 'RelationDef',
    properties: {
        rev: t.string.id,
        href: t.string.id,
        path: t.string.path,
        title: t.string.name,
        type: t.string.name
    },
    required: ['href'],
    index: { id: 'href' }
};
/**
 * {
 *  rev?, href, path, kind, title
 * }
 */
export const RelationDefType: Tobject<RelationDefData> =
    t.object.as<RelationDefData>(RelationDefDef);

/**
 * {href
 *  ref$, paths[]
 * }
 */
export class RelationDefView extends Objview<RelationDefData> implements RelationDefData {
    constructor(entity?: any, parent?: IViewElement) {
        super(RelationDefType, entity, parent);
    }
    declare public  rev: string | undefined;
    declare public href: string | undefined;
    declare public path: string | undefined;
    declare public title: string | undefined;
    declare public type: string | undefined;

    isAssigned(): boolean {
        return isStringAssigned(this.href);
    }

    isUnassigned(): boolean {
        return !this.isAssigned();
    }
}
RelationDefType.viewctor = RelationDefView;
