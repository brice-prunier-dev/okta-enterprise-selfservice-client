import {
    AnyDef,
    BaseType,
    isSchema,
    ArrayDef,
    ObjectDef,
    MapDef,
    XObjectDef,
    isJoeType
} from '../core';

import { ArrayTypeFactory } from './factory-atype';
import { ObjectTypeFactory } from './factory-otype';
import { MapTypeFactory } from './factory-mtype';
import { Tnumber } from './number';
import { Tstring } from './string';
import { Tdate } from './date';
import { Tbool } from './bool';
import { XObjectTypeFactory } from './factory-xtype';

export module TypeFactory {
    export function TYPEDEF(sch: AnyDef): AnyDef & BaseType {
        if (isJoeType(sch)) {
            return sch as AnyDef & BaseType;
        }
        switch (sch.type) {
            case 'number':
                return new Tnumber(sch);
            case 'string':
                return new Tstring(sch);
            case 'date':
                return new Tdate(sch);
            case 'boolean':
                return new Tbool(sch);
            case 'array':
                return ArrayTypeFactory.Create(sch as ArrayDef);
            case 'map':
                return MapTypeFactory.Create(sch as MapDef);
            default:
                return ObjectTypeFactory.Create(sch as ObjectDef);
        }
    }
    export function XTYPEDEF(sch: XObjectDef<any>): XObjectDef<any> {
        if (isJoeType(sch)) {
            return sch;
        }
        return XObjectTypeFactory.Create(sch);
    }
}
