import { MType, MapTypeConstructor, MapDef } from '../core';

let _mapConstructor: MapTypeConstructor;

export module MapTypeFactory {
    export function InitializeConstructor(typeConstructor: MapTypeConstructor) {
        _mapConstructor = typeConstructor;
    }

    export function Create(sch: MapDef): MType {
        return new _mapConstructor(sch);
    }
}
