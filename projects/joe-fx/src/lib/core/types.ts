import { Subject } from 'rxjs';
import { PATH_ROOT, REFRESH_DATAPATH } from './constants';
import {
    ChangeStateEnum,
    DataAction,
    MessageTypology,
    PropertyTypology,
    ValidationScopes
} from './enums';

export type Json = string | number | boolean | null | undefined | { [property: string]: Json } | Json[];

export type JsonObj = {[property: string]: Json};
export type JsonScalar = string | number | boolean;
export type Scalar = string | number | boolean | Date;

export type ScalarTypeKey = 'string' | 'number' | 'boolean' | 'date';
export type ReferenceTypeKey = 'object' | 'array' | 'map' | 'xobject';
export type AnyTypeKey = ScalarTypeKey | ReferenceTypeKey;
export type ValueAccessor = (o?: any) => any;
export type StringAccessor = (o?: any) => string;
export type StringListAccessor = (o?: any) => string[];
export type DateAccessor = (o?: any) => Date;
export type DateListAccessor = (o?: any) => Date[];
export type NumberAccessor = (o?: any) => number;
export type NumberListAccessor = (o?: any) => number[];
export type Constructor<T> = new (...args: any[]) => T;
export type LookupWriter = (self: any, lookupObj: any, property: string) => void;

export type ObjData =
    | string
    | number
    | boolean
    | Date
    | { [property: string]: ObjData }
    | ObjData[];

export type DataObj = { [property: string]: ObjData };

export interface StringMap<T = any> {
    [x: string]: T;
}

export interface BooleanDef {
    type: 'boolean';
    title: string;
    default: boolean;
}

export interface NumberDef {
    type: 'number';
    title: string;
    pattern: string;
    default?: number | NumberAccessor;
    minimum?: number;
    maximum?: number;
    minexclusive?: number;
    maxexclusive?: number;
}

export interface DateDef {
    type: 'date';
    title: string;
    pattern: string | undefined;
    default?: Date | DateAccessor;
    minimum?: Date;
    maximum?: Date;
    minexclusive?: Date;
    maxexclusive?: Date;
}

export interface StringDef {
    type: 'string';
    title: string;
    pattern?: string;
    patternModel?: string;
    enum?: string[];
    default?: string | StringAccessor;
    minlength?: number;
    maxlength?: number;
}

export interface ArrayDef<T = AnyDef | AnyDef[]> {
    type: 'array';
    title: string;
    minlength: number;
    maxlength: number;
    items: T;
}

export interface MapDef {
    type: 'map';
    title: string;
    minlength: number;
    maxlength: number;
    items: AnyDef | AnyDef[];
}

export interface IndexDef {
    id: string | string[];
    rev?: string;
    sort?: string | string[];
}

export interface TupleDef<T = AnyDef[]> extends ArrayDef<T> {
    index?: IndexDef;
}

export type PropertyDef = AnyDef;
export type PartialPropertiesDef<T> = { [P in keyof T]?: PropertyDef };
export type PropertiesDef<T> = { [P in keyof T]: PropertyDef };

export interface ObjectDef<T = any> {
    type: 'object';
    title: string;
    extends?: ObjectDef[];
    properties: PartialPropertiesDef<T>;
    required: (keyof T)[];
    index?: IndexDef;
}

export interface XObjectDef<T = any> {
    type: 'xobject';
    title: string;
    extends?: OType<T>[];
    getType(obj: object): OType<T>;
    getIndexObjFromValue(obj: any | any[]): JsonObj;
}

export type ScalarDef = StringDef | NumberDef | BooleanDef | DateDef;
export type JsonObjDef = ArrayDef | ObjectDef | MapDef | XObjectDef;
export type AnyDef = ScalarDef | JsonObjDef;

/**
 * Validation state for a ViewView
 */
export interface ValidationState {
    /**
     * View Errors: Empty obj when valid
     */
    errors: DataObj;
    setItemErrors(propName: string, result: DataObj | undefined): void;
    /**
     * Remove all errors but keep the same error instances
     */
    clear(): void;
    /**
     * Has any validation error
     */
    withError(): boolean;
    /**
     * Has errors relative to the entity type
     */
    withCoreError(): boolean;
}
/**
 *
 */
export const NULL_ValidationState: ValidationState = {
    errors: {},
    setItemErrors(propName: string, result: DataObj | undefined): void {
        return;
    },
    clear() {
        return;
    },
    withError() {
        return false;
    },
    withCoreError() {
        return false;
    }
};

export interface IRuntimeMessage {
    get msg(): string;
    get domain(): string;
    get source(): string[];
    get scope(): MessageTypology;
    get def(): any;
    get path(): string;
    get property(): string | null;
    isPathRelated(path: string): boolean;
}
export interface IRuntimeSummary {
    get messages(): IRuntimeMessage[];
    get isValid(): boolean;

    get hasMessages(): boolean;

    clearAll(): IRuntimeSummary;

    clearPath(path: string): IRuntimeSummary;

    push(msg: IRuntimeMessage): IRuntimeSummary;
    hasError(path: string): boolean;
}

/**
 * Core type behaviour: validation & default value.
 * ```ts
 * {
 *  validate(target, action, scope?, result ): ValidationResult;
 *  defaultValue(): any;
 * }
 * ```
 */
export interface BaseTypeBehaviour {
    validate(target: any, scope: ValidationScopes, scopeRef?: any): ValidationState;
    defaultValue(): any;
}

/**
 * Basic Json Type info: type, title (aka name) 
 * plus an isScalar getter as helper
 * ```ts
 * {
 *  type: AnyTypeKey;
 *  title: string;
 *  get isScalar()
 *  ...
 *  validate(target, action, scope?, result ): ValidationResult;
 *  defaultValue(): any;
 * }
  * ```
 */
export interface BaseType extends BaseTypeBehaviour {
    type: AnyTypeKey;
    title: string;
    isScalar: boolean;
}
export interface CoreEntityTypeBehaviour {
    prepare(obj: any, parent: any, path: string): void;
    unprepare(obj: any): void;
}

export interface IndexableType {
    withIndex: boolean;
    getIndexPath(obj: any, index?: number): string;
    buildIndexObjFromSelectorValue(keyDef: string | number | (string | number)[]): object;
    getIndexValue(obj: object): string | number | (string | number)[];
}

export interface EntityBaseType extends BaseType, CoreEntityTypeBehaviour {}
export type ArrayTypeConstructor = new (sch: ArrayDef) => AType;

export type ObjectTypeConstructor<T = any> = new (options: ObjectDef<T>, name?: string) => OType<T>;

export type XObjectTypeConstructor<T = any> = new (
    options: XObjectDef<T>,
    name?: string
) => XType<T>;

export type MapTypeConstructor = new (sch: MapDef) => MType;
export type ObjviewType = new (entity?: any, parent?: any) => IViewElement;

export type SetviewTypeConstructor = new (args: any[], type?: AType, parent?: any) => IViewElement;

export type MapviewType = new (obj: any, type?: MType, parent?: any) => IViewElement;

export interface OType<T = any> extends ObjectDef<T>, EntityBaseType, IndexableType {
    type: 'object';
    allProperties: PropertiesInfo;
    index?: IndexDef;
    viewctor?: ObjviewType;
    getIndexObjFromValue(obj: any | any[]): JsonObj;
    validateAsync(target: any, scope: ValidationScopes, scopeRef?: any): void;
    fillValidationSummary(
        objErrors: StringMap,
        summary: IRuntimeSummary,
        path: string
    ): IRuntimeSummary;
}

export interface XType<T = any> extends XObjectDef<T>, EntityBaseType, IndexableType {
    type: 'xobject';
    validateAsync(target: any, scope: ValidationScopes, scopeRef?: any): void;
    viewctor(obj: any): ObjviewType;
}

export interface AType extends ArrayDef, EntityBaseType, IndexableType {
    type: 'array';
    itemsTypeDef?: ArrayItemProperty;
    isTuple: boolean;
    isMultiDimension: boolean;
    viewctor?: SetviewTypeConstructor;
    size: number;
    fillValidationSummary(
        objErrors: StringMap,
        summary: IRuntimeSummary,
        path: string
    ): IRuntimeSummary;
}

export interface MType extends MapDef, EntityBaseType {
    type: 'map';
    itemsTypeDef?: MapProperty;
    isTuple: boolean;
    isMultiDimension: boolean;
    needHoisting: boolean;
    viewctor?: MapviewType;
    size: number;
    fillValidationSummary(
        objErrors: StringMap,
        summary: IRuntimeSummary,
        path: string
    ): IRuntimeSummary;
}
export interface BaseProperty {
    defaultValue(): any;
    validate(state: ValidationState, target: any, scope: ValidationScopes, scopeRef?: any): void;
    kind: PropertyTypology;
}

// export const LOCAL_PROPERTY: BaseProperty = {
//     kind: PropertyTypology.Object,
//     defaultValue: () => undefined,
//     validate: (target: any, scope?: string | object | boolean) => void
// };

export interface Property extends BaseProperty {
    required: boolean;
    defaultValue(asEntity?: boolean): any;
    readAsView(obj: any, parentView: IViewElement): any;

    // lookup?: LookupDef;
}
export type Properties<T> = { [K in keyof T]: Property };
export interface ScalarProperty extends Property {
    lookupClientName?: string;
}

export interface ArrayItemProperty extends BaseProperty, CoreEntityTypeBehaviour {
    def: (AnyDef & BaseType) | Array<AnyDef & BaseType>;
    defaultValue(typename?: string | number, asEntity?: boolean): any;
    readAsView(obj: any, idx: number, parentView: IViewElement): any;
    // getIndexPath(i: number, item: any): string;
}

export interface MapProperty extends BaseProperty, CoreEntityTypeBehaviour {
    def: (AnyDef & BaseType) | Array<AnyDef & BaseType>;
    defaultValue(typename?: string | number, asEntity?: boolean): any;
    readAsView(obj: any, idx: string, parentView: IViewElement): any;
}

export type PropertiesInfo = StringMap<Property>;
export type SortComparer = (a: any, b: any) => number;

/**
 * {op, path, seletor? obj{}}
 */
export interface ChangeItem {
    op: ChangeStateEnum;
    path: string;
    selector?: string;
    obj: any;
}
export type ChangeSet = ChangeItem[];

export enum DataOrigin {
    user = 'user',
    code = 'code'
}

/**
 * {typology, storePath, docPath, root, origin?}
 */
export interface DataPayload {
    action: DataAction;
    sourcePath: string;
    dataPath: string;
    origin?: DataOrigin;
    dataInfo?: string;
}

export const REFRESH_PAYLOAD: DataPayload = {
    action: DataAction.Reset,
    sourcePath: PATH_ROOT,
    dataPath: REFRESH_DATAPATH,
    origin: DataOrigin.code
};

export interface EditCache<T> {
    inserted: T;
    deleted: T;
    modified: T;
}

export interface IEditState {
    clear(): void;
    isPristine(): boolean;
    isTouched(): boolean;
    isDirty(): boolean;
    message(): boolean;
}
export interface IEditor {
    isPristine(): boolean;
    endEdit(fromParent?: boolean): any;
    cancelEdit(fromParent?: boolean): void;
    isDirty(property?: string): boolean;
    isTouched(): boolean;
    writeChangeSet(changeset: ChangeSet): void;
    applyChangeSet(changeset: ChangeSet): void;
}

export interface IRootEditor extends IEditor {
    onViewChanged: Subject<DataPayload>;
}

/**
 * Core properties for a View element
 * {
 *  $src, $isEditing, $editor?, $validation,
 *  $children(), $edit(), $isRoot(), $parent(), $root(), $notify(),
 *  $refresh(), $release(), validate()
 * }
 */
export interface IViewElement extends StringMap<any> {
    $isEditing: boolean;
    $editor?: IEditor;
    $validation: ValidationState;
    $src: IDataInfo;
    $assign(value: any): this;
    $isRoot(): boolean;
    $parent(): IViewElement;
    $root(): IViewElement;
    $children(): StringMap<IViewElement> | IViewElement[] | undefined;
    $json(): JsonObj;
    $notify(arg: DataPayload): void;
    $refresh(data: any): void;
    $refreshChild(property: string, data: any): void;
    $release(): void;
    $edit(forceTracking?: boolean): IEditor;
    validate(scope: ValidationScopes, scopeRef?: any): ValidationState;
    asString(): string;
}

export interface IRootViewElement extends IViewElement {
    onViewChanged: Subject<DataPayload>;
}
/**
 * Core properties for a Set of element
 * { $newChild, add, remove }
 */
export interface ISetElement<T extends Scalar | IViewElement> extends IViewElement {
    hasScalarItems: boolean;
    length: number;
    $newChild<Ta extends IViewElement>(): Ta;
    $newChild(input: T, index: number): this;
    remove(input: T): void;
    removeAt(index: number): void;
    indexOfPath(path: string): number;
}
/**
 * Core properties for a Set of element
 * { $newChild, add, remove } idem as ISetElement.
 */
export interface IMapElement<T extends Scalar | IViewElement> extends IViewElement {
    $newChild<Ta extends IViewElement>(): Ta;
    add(input: T, index: number): void;
    remove(input: T): void;
}

export interface IDataInfo {
    isArray: boolean;
    isObject: boolean;
    isMap: boolean;
    isRoot: boolean;
    obj: any;
    parent: IDataInfo;
    detached: boolean;
    type: AType | OType | MType;
    path: string;
    attached: boolean;
    keyIndex(key: any): string;
    childPath(property?: string): string;
    release(): void;
    root(): IDataInfo;
    setParent(path: string, parent: IDataInfo): void;
    setPath(path: string): void;
    updatePath(path: string): void;
    setParentChildView(obj: IViewElement, path: string): void;
    unsetParent(): this;
    write(property: string, value: any): void;
}
