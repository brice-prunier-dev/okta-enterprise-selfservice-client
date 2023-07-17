import { t } from 'joe-types';
import type { DescriptionData } from 'joe-models';
import { DescriptionDef } from 'joe-models';
import { ItemDefData, ItemDefDef } from './definitions';
import { ObjectDef, Tobject } from 'joe-fx';

/**
 * {
 *   oid, label, description, admins?
 * }
 */
export interface ProjectItemData extends DescriptionData {
    project: string;
    itemtype: string;
    item: ItemDefData;
}

/**
 * {
 *   oid, label, description, admins?
 * }
 */
export const ProjectItemDef: ObjectDef<ProjectItemData> = {
    type: 'object',
    title: 'projectitem_type',
    extends: [ DescriptionDef ],
    properties: {
        project: t.string.id,
        itemtype: t.string.id,
        item: ItemDefDef,
    },
    required: [ 'project', 'description', 'itemtype', 'item' ],
    index: { id: 'item>oid', sort: 'label' }
};
/**
 * {
 *   oid, label, description, admins?
 * }
 */
export const ProjectItemType: Tobject<ProjectItemData> = t.object.as<ProjectItemData>( ProjectItemDef );

