import {
    PATH_ROOT,
    OType,
    ObjviewType,
    XType,
    XObjectDef,
    isStringAssigned,
    MetadataHelper,
    EntityBaseType,
    IndexableType,
    ValidationState,
    ValidationHandler,
    JsonObj,
    ValidationScopes
} from '../core';

import { XObjectTypeFactory } from './factory-xtype';

/**
 * Object Type that accept different type definition as implementation
 */
export class Txobject<T = any> implements XType<T>, EntityBaseType {
    public readonly isScalar: boolean;
    public readonly type: 'xobject';
    /**
     * Indicates local cache for reference object is needed
     */
    public readonly needHoisting = true;
    public readonly extends?: OType<T>[];
    public title: string;
    public getIndexObjFromValue: (value: any | any[]) => JsonObj;

    constructor(private _def: XObjectDef<T>, name?: string) {
        this.type = 'xobject';
        this.isScalar = false;
        this.title = name || _def.title;
        this.extends = _def.extends;
        this.getIndexObjFromValue = _def.getIndexObjFromValue;
    }

    public get withIndex(): boolean {
        return !this.extends!.some((s) => !(s as IndexableType).withIndex);
    }

    public getType(obj: any): OType<T> {
        const objinfo = MetadataHelper.getTypeInfo(obj);
        if (objinfo) {
            const extendType = this.extends!.find((s) => s.title === objinfo.type.title);
            if (extendType) {
                return extendType;
            }
        }
        return this._def.getType(obj);
    }

    public viewctor(obj: any): ObjviewType {
        return this.getType(obj).viewctor!;
    }

    /**
     * Extract index {id: 'xxx'} from obj (Xxx)
     */
    public buildIndexObjFromSelectorValue(value: (string | number)[]): any {
        const extendType = this.extends!.find((s) => s.title === value[0]);
        const index = {} as any;
        ((extendType as OType).index!.id as string[]).forEach((p, idx) => (index[p] = value[idx]));
        return index;
    }
    public getIndexPath(obj: any, index?: number): string {
        return this.getType(obj).getIndexPath(obj, index);
    }

    public getIndexValue(obj: any): string | number | (string | number)[] {
        return this.getType(obj).getIndexValue(obj);
    }

    /**
     * Visit the object graph and set on each instance a Symbol property with a DataInfo instance
     * that is a reverse linkedList of parent.
     * DataInfo also expose the underlying type of the instance and its path in the graph.
     * @param target instance to validate (required).
     * @returns ValidationResult, map of errors by property name;
     */
    public prepare(obj: any, parent?: any, path: string = PATH_ROOT) {
        if (obj) {
            const objType = this.getType(obj);
            if (objType) {
                return objType.prepare(obj, parent, path);
            }
        }
    }

    public unprepare(obj: any) {
        const objType = this.getType(obj);
        if (objType) {
            objType.unprepare(obj);
        }
    }

    /**
     * Check the validity of an object instance on the current schema.
     * @param subject instance to validate (required).
     * @returns ValidationResult, map of errors by property name;
     */
    public validate(
        subject: any,
        scope: ValidationScopes = ValidationScopes.State,
        scopeRef?: any
    ): ValidationState {
        const objType = this.getType(subject);
        if (objType) {
            return objType.validate(subject, ValidationScopes.State);
        }
        const objinfo = MetadataHelper.getTypeInfo(subject);
        return new ValidationHandler({
            _: { badtype: objinfo !== undefined ? objinfo.type.title : '' }
        });
    }

    public validateAsync(
        subject: any,
        scope: ValidationScopes = ValidationScopes.State,
        scopeRef?: string | boolean | object
    ): void {
        const objType = this.getType(subject);
        if (objType) {
            return objType.validateAsync(subject, ValidationScopes.State, scopeRef);
        }
    }

    public defaultValue(typename?: string): any {
        if (isStringAssigned(typename)) {
            const extendType = this.extends!.find((s) => s.title === typename);
            if (extendType) {
                return extendType.defaultValue();
            }
        }
        return undefined;
    }
}

XObjectTypeFactory.InitializeConstructor(Txobject);
