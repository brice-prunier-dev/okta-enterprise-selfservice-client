import {
    PATH_ROOT,
    PATH_NEXT,
    IDataInfo,
    IViewElement,
    MetadataHelper,
    PATH_UNASSIGNED,
    StringMap
} from '../core';

import { Tobject, Tmap, Tarray } from '../types';

export type TdocElement = Tobject | Tarray | Tmap;

export class DataInfo implements IDataInfo {
    private _obj: any;
    private _parent: DataInfo | undefined;
    private _path: string;
    // private _state: EntityState = EntityState.Original;
    private _type: TdocElement;
    constructor(obj: any, type: TdocElement) {
        this._obj = obj;
        this._path = PATH_UNASSIGNED;
        this._type = type;
    }

    public get isArray(): boolean {
        return this._type.type === 'array';
    }

    public get isObject(): boolean {
        return this._type.type === 'object';
    }

    public get isMap(): boolean {
        return this._type.type === 'map';
    }

    public get isRoot(): boolean {
        return this._path === PATH_ROOT;
    }

    public get obj(): any {
        return this._obj;
    }

    // public set obj(value:  any ) {
    //     this._obj = value;
    // }

    public get parent(): DataInfo {
        return this._parent || this;
    }

    public get detached(): boolean {
        return this._path === undefined
            ? true
            : this._path === PATH_UNASSIGNED ||
                  this._path.startsWith(PATH_UNASSIGNED) ||
                  this._path.endsWith(PATH_NEXT + PATH_UNASSIGNED) ||
                  this._path.endsWith(PATH_NEXT + '[' + PATH_UNASSIGNED + ']');
    }

    public get type(): TdocElement {
        return this._type as TdocElement;
    }

    public get path(): string {
        return this._path;
    }

    public get attached(): boolean {
        return this._path.indexOf(PATH_UNASSIGNED) === -1;
    }

    public keyIndex(key: any): string {
        return this._path + PATH_NEXT + '[' + JSON.stringify(key).replace(/"/g, '') + ']';
    }
    public childPath(property?: string): string {
        return property === undefined ? this._path : this._path + PATH_NEXT + property;
    }
    /**
     * release all the referenced instance.
     */
    public release(): void {
        if (this._obj !== undefined) {
            this._obj = undefined;
        }
        this._path = PATH_UNASSIGNED;
        this._parent = undefined;
    }
    /**
     * Retrieve the root intance of the hierarchy.
     */
    public root(): DataInfo {
        let parent: DataInfo = this;
        while (parent._path !== PATH_ROOT && parent._parent !== undefined) {
            parent = parent._parent;
        }
        return parent;
    }

    public setParent(path: string, parent: DataInfo) {
        this._path = path;
        this._parent = parent;
    }

    public setPath(path: string) {
        this._path = path;
    }

    public updatePath(path: string) {
        this._path = this._path.replace(PATH_UNASSIGNED, path);
    }

    public setParentChildView(obj: IViewElement, path: string = PATH_ROOT) {
        if (obj) {
            const objInfo = obj.$src;
            const childPath = this.childPath(path);
            objInfo.setParent(childPath, this as IDataInfo);
            const children = obj.$children();
            if (children) {
                const childrenKey = Object.keys(children);

                childrenKey.forEach((p) => {
                    const child = (children as StringMap<IViewElement>)[p];
                    if (child.$src && child.$src.detached) {
                        child.$src.updatePath(childPath);
                    }
                });
            }
        }
    }

    public unsetParent(): this {
        this._path = PATH_UNASSIGNED;
        this._parent = undefined;
        return this;
    }

    public write(property: string, value: any) {
        const prevValue = this.obj[property];
        this.obj[property] = value;
        switch (this._type.type) {
            case 'array':
            case 'object':
                if (prevValue !== value) {
                    MetadataHelper.detach(prevValue);
                }
                break;
            case 'map':
                if (!value) {
                    delete this.obj[property];
                }
                if (prevValue !== value) {
                    MetadataHelper.detach(prevValue);
                }
                break;
        }
    }
}

MetadataHelper.initTypeInfoFactory(DataInfo);
