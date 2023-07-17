import { t } from 'joe-types';
import { ObjectDef, Tobject, Objview, IViewElement } from 'joe-fx';

export interface PositionData {
    x: number;
    y: number;
}

export const PositionDef: ObjectDef = {
    type: 'object',
    title: 'position_type',
    properties: {
        x: t.number.int_0,
        y: t.number.int_0
    },
    required: ['x', 'y'],
    index: { id: ['x', 'y'] }
};
/**
 * { oid, label }
 */
export const PositionType: Tobject<PositionData> = t.object.as(PositionDef);

// export const ItemTypeCollection: joe.Tarray = t.array.of( OitemType );
export class PositionView extends Objview<PositionData> implements PositionData {
    declare x: number;
    declare y: number;
    constructor(entity?: any, parent?: IViewElement) {
        super(PositionType, entity, parent);
    }
}
PositionType.viewctor = PositionView;

export const NULL_PositionData: PositionData = { x: 0, y: 0 };
