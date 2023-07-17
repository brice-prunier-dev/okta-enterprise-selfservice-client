import { IViewElement, ObjectDef, Objview, Tobject } from 'joe-fx';
import { t } from 'joe-types';

/**
 * {
 *   name, description
 * }
 */
export interface DefinitionData {
    name: string;
    description: string;
}

// ────────────────────────────────────────────────────────────────────────────────
/**
 * {
 *   name, description
 * }
 */
export const DefinitionDef: ObjectDef<DefinitionData> = {
    type: 'object',
    title: 'Definition',
    properties: {
        name: t.string.name,
        description: t.string.comment
    },
    required: ['name', 'description'],
    index: { id: 'name', sort: 'name' }
};

// ────────────────────────────────────────────────────────────────────────────────
/**
 * {
 *   name, description
 * }
 */
export const DefinitionType: Tobject<DefinitionData> = t.object.as<DefinitionData>(DefinitionDef);

// ────────────────────────────────────────────────────────────────────────────────
/**
 * {
 *   name, description
 * }
 */
export class DefinitionView extends Objview<DefinitionData> implements DefinitionData {
    constructor(entity?: any, parent?: IViewElement) {
        super(DefinitionType, entity, parent);
    }
    declare name: string;
    declare description: string;
}
DefinitionType.viewctor = DefinitionView;
