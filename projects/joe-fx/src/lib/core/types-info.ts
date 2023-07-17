import { PATH_ROOT } from './constants';
import { PropertyTypology, ValidationScopes } from './enums';
import {
    AnyDef,
    IDataInfo,
    IEditor,
    IViewElement,
    NULL_ValidationState,
    ValidationState
} from './types';
import { asObject } from './types-helper';

export const NULL_Editor: IEditor = {
    isPristine: () => true,
    endEdit: () => null as any,
    cancelEdit: () => null,
    isTouched: () => false,
    isDirty: () => false,
    writeChangeSet: () => {},
    applyChangeSet: () => {}
};
/**
 * Default Null instance for IViewElement.
 */
export const NULL_ViewElement: IViewElement = {
    $children() {
        return {};
    },
    $edit: () => NULL_Editor,
    $isEditing: false,
    $assign(value: any): IViewElement {
        return this;
    },
    $isRoot: () => false,
    $json: () => {
        return {};
    },
    $notify(): void {
        return;
    },
    $parent(): IViewElement {
        return this;
    },
    $release(): void {
        return;
    },
    $refresh(data: any) {
        return;
    },
    $refreshChild(property: string, data: any): void {
        return;
    },
    $root(): IViewElement {
        return this;
    },
    $src: {} as unknown as IDataInfo,
    validate(
        scope: ValidationScopes = ValidationScopes.State,
        scopeRef?: string | boolean | object
    ): ValidationState {
        return {} as unknown as ValidationState;
    },
    $validation: NULL_ValidationState,
    asString() {
        return 'NULL_ViewElement';
    }
};

export type DataInfoConstructor = new (obj: any, type: any) => IDataInfo;

let _CONSTRUCTOR: DataInfoConstructor;

const infoKey = '__j-info__';
const infoSym = Symbol(infoKey);

export class MetadataHelper {
    static initTypeInfoFactory(dataInfoFactory: DataInfoConstructor) {
        _CONSTRUCTOR = dataInfoFactory;
    }

    static isNotPrepared(obj: any): boolean {
        const src = obj[infoSym];

        return src === undefined;
    }
    static getTypeInfoWithCheck(obj: any): IDataInfo | undefined {
        return obj !== undefined && typeof obj === 'object' ? obj[infoSym] : undefined;
    }
    static getTypeInfoSafe(obj: any, type: any): IDataInfo {
        let info = obj[infoSym] as IDataInfo;
        if (info) {
            return info;
        }
        return (obj[infoSym] = new _CONSTRUCTOR(obj, type));
    }
    static getTypeInfo(obj: any): IDataInfo {
        const info = obj[infoSym] as IDataInfo;
        return info;
    }
    static unsureTypeInfo(obj: any, type: any) {
        if (!obj[infoSym]) {
            obj[infoSym] = new _CONSTRUCTOR(obj, type);
        }
    }

    static clearTypeInfo(obj: any): void {
        if (obj !== undefined && obj[infoSym]) {
            if (obj[infoSym].obj && obj[infoSym].obj === obj) {
                obj[infoSym].obj = undefined;
            }
            obj[infoSym] = undefined;
        }
    }

    static asView(obj: any): obj is IViewElement {
        if (obj && asObject(obj)) {
            const src = MetadataHelper.getTypeInfo(obj);
            if (src) {
                return obj !== src.obj;
            }
        }
        return false;
    }

    static link(obj: any, target: any, type?: any) {
        const isObjUndefined = obj === undefined;
        if (isObjUndefined) {
            if (type) {
                obj = type.defaultValue();
            } else {
                throw new Error(
                    'Invalid Link operation: source is undefined no source type has been provided to create a default value!'
                );
            }
        }
        const info = obj[infoSym] as IDataInfo;
        if (info === undefined) {
            if (type !== undefined) {
                target[infoSym] = obj[infoSym] = new _CONSTRUCTOR(obj, type);
            } else {
                throw new Error(
                    'Invalid Link operation: source info is missing and no source type has been provided!'
                );
            }
        } else {
            target[infoSym] = info;
        }
    }

    static releaseDoc(obj: any, recursive: boolean = false): void {
        if (obj) {
            if (typeof obj === 'object') {
                if (Array.isArray(obj) && obj.length > 0) {
                    if (obj[0] !== undefined && typeof obj[0] === 'object') {
                        for (const child of obj) {
                            MetadataHelper.releaseDoc(child, recursive);
                        }
                    }
                } else if (recursive) {
                    for (const p in obj) {
                        if (obj.hasOwnProperty(p)) {
                            MetadataHelper.releaseDoc(obj[p], recursive);
                        }
                    }
                }
                const info = obj[infoSym] as IDataInfo;
                if (info) {
                    info.release();
                }
            }
        }
    }

    static detach(obj: any, recursive: boolean = false): void {
        if (obj && typeof obj === 'object') {
            const info = MetadataHelper.getTypeInfo(obj);
            if (info) {
                info.setParent(PATH_ROOT, undefined as unknown as IDataInfo);
            }
        }
    }
}

export function toPropertyTypology(sch: AnyDef): PropertyTypology {
    switch (sch.type) {
        case 'object':
            return PropertyTypology.Object;
        case 'map':
            return PropertyTypology.Map;
        case 'array':
            const asch = sch as any;
            return asch.isTuple ? PropertyTypology.Tuple : PropertyTypology.List;
        default:
            return PropertyTypology.Scalar;
    }
}

export function readTypeName(obj: any): string {
    if (obj[infoSym] && obj[infoSym].type) {
        return obj[infoSym].type.title;
    } else {
        return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase() as string;
    }
}

export function cacheValueAsValue(value: any): any {
    return value === NULL_ViewElement ? undefined : value;
}

export function isViewElement(obj: any): obj is IViewElement {
    if (typeof obj === 'object') {
        return obj.$src !== undefined;
    }
    return false;
}
