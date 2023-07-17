import { MapviewType, MType, StringMap, IViewElement } from '../core';

let _mapViewConstructor: MapviewType;

export module MapViewFactory {
    export function InitializeConstructor(viewctor: MapviewType) {
        _mapViewConstructor = viewctor;
    }

    export function Create<T>(
        obj: any,
        type?: MType,
        parent?: any
    ): IterableIterator<T> & IViewElement & StringMap<T> {
        return new _mapViewConstructor(obj, type, parent) as IterableIterator<T> & IViewElement & StringMap<T>;
    }
}
