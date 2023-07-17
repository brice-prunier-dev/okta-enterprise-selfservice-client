import {
    MetadataHelper,
    IDataInfo,
    IViewElement,
    NULL_ViewElement,
    DataAction,
    DataOrigin,
    DataPayload,
    OType,
    ObjviewType,
    StringMap,
    PATH_ROOT,
    ElementValidationState,
    PropertyTypology,
    ValidationState,
    isFunction,
    cacheValueAsValue,
    isEmptyString,
    isBlank,
    isDataAssigned,
    JsonObj,
    Scalar,
    PATH_UNASSIGNED,
    ChangeSet,
    ValidationRule,
    AsyncValidationRule,
    ASYNCRULE_RUNNING,
    isStringAssigned,
    DataObj,
    isObjAssigned,
    JoeLogger,
    REFRESH_PAYLOAD,
    ValidationScopes,
    IRootViewElement
} from '../core';
import { Tobject, corelateValidationWithParents } from '../types';
import { ObjviewEditor } from './objview-editor';

const NO_NOTIFY = -100;
const freezedSym = Symbol('__freezed__');
function nowrite() {
    return;
}
export class Objview<T = any> implements IViewElement {
    [key: string]: unknown;
    private _parent_: IViewElement | undefined;
    private _refCache: StringMap<IViewElement | Promise<IViewElement>> | undefined;
    // private _editCache: any | undefined;
    private _ver_ = 1;

    public $editor?: ObjviewEditor<T>;
    public $validation: ElementValidationState<T>;
    public $rules?: { [P in keyof T]?: ValidationRule<T> } & { _?: ValidationRule<T> };
    public $asyncrules?: { [P in keyof T]?: AsyncValidationRule<T> } & {
        _?: AsyncValidationRule<T>;
    };
    public onEditingChanged?: () => void;
    public get $isEditing(): boolean {
        return this.$editor !== undefined && this._ver_ > 0;
    }

    public get $isTracking(): boolean {
        return this._ver_ > 0;
    }

    public get $src(): IDataInfo {
        return MetadataHelper.getTypeInfo(this);
    }

    constructor(type: Tobject<T>, obj: any, parent?: IViewElement) {
        this._parent_ = parent;
        this.$validation = new ElementValidationState<T>();
        if (!obj) {
            obj = type.defaultValue();
        }
        if (!parent) {
            type.prepare(obj, null, PATH_ROOT);
        }
        MetadataHelper.link(obj, this, type);
        if (type.needHoisting) {
            this._refCache = {};
        }

        // if ( src.isNew() ) {
        //   this.$edit();
        // }
        const names = Object.keys(type.allProperties);
        if (names && names.length > 0) {
            names.forEach((propertyName) => {
                // const isAsync = propInfo.lookup && propInfo.lookup.isAsync;
                // const isCachedLookup = propInfo.lookup && propInfo.lookup.writer;
                // const isNotJson = propertyName === '_attachments';

                const getter = function (this: Objview<T>) {
                    return this._read(propertyName);
                };

                // const getterAsync = function () {
                //   return this._readAsync( propertyName );
                // };

                const setter = function (this: Objview<T>, newVal: any) {
                    return this._write(propertyName, newVal);
                };

                if (delete this[propertyName]) {
                    // if ( isAsync ) {

                    //   Object.defineProperty( this, propertyName, {
                    //     get: getterAsync,
                    //     set: nowrite,
                    //     enumerable: true,
                    //     configurable: true,
                    //   } );

                    // } else if ( isCachedLookup ) {

                    //   Object.defineProperty( this, propertyName, {
                    //     get: getter,
                    //     set: setter,
                    //     enumerable: true,
                    //     configurable: true,
                    //   } );

                    // } else {
                    Object.defineProperty(this, propertyName, {
                        get: getter,
                        set: setter,
                        enumerable: true,
                        configurable: true
                    });
                    // }
                }
            });
        }
        type.viewctor = this.constructor as ObjviewType;
    }

    private _read(property: string, forceOriginal: boolean = false): any {
        if (this._ver_ === -111) {
            return 'RELEASED_ITEM';
        }
        if (this.$editor && !forceOriginal) {
            if (this.$editor.isDirty(property)) {
                return cacheValueAsValue(this.$editor.editCache[property]);
            }
        }
        const src = MetadataHelper.getTypeInfo(this);
        const obj = src.obj;
        const type = src.type as OType;
        const propInfo = type.allProperties[property];

        // scalar
        if (propInfo.kind === PropertyTypology.Scalar) {
            return propInfo.readAsView(obj, this);
        } else if (this._refCache) {
            const cachedValue = this._refCache[property];

            if (cachedValue) {
                return cacheValueAsValue(cachedValue);
            }
            const value = propInfo.readAsView(obj, this);
            if (!forceOriginal) {
                this._refCache[property] = value || NULL_ViewElement;
            }
            if (this.$editor) {
                value.$edit();
            }
            return value;
        }
        return undefined;
    }

    // private _readAsync( property: string ): Promise<IViewElement> {
    //   const src = MetadataHelper.get( this );
    //   const type = src.type as OType;
    //   const propInfo = type.allProperties[ property ] as TobjectSimpleProperty;
    //   return propInfo.readAsViewAsync( src.obj );

    // }

    private _write(property: string, value: any) {
        if (isEmptyString(value)) {
            value = undefined;
        }
        const src = MetadataHelper.getTypeInfo(this);
        const type = src.type as OType;
        const propInfo = type.allProperties[property];
        // write same value
        // if ( !propInfo.lookup ) {
        const objValue = this._read(property);
        if (value === objValue) {
            return;
        }

        const editor = this.$edit();
        const isPropertyRoolback = editor.isDirty(property) && value === this._read(property, true);
        if (isPropertyRoolback) {
            if (editor.editCache[property]) {
                delete editor.editCache[property];
            }
        } else {
            editor.editCache[property] = isBlank(value) ? NULL_ViewElement : value;
        }
        if (value !== undefined && propInfo.kind === PropertyTypology.Object) {
            src.setParentChildView(value as IViewElement, property);
        }
        const changedHandlerName = property + 'Changed';

        if (isFunction(this[changedHandlerName])) {
            (this[changedHandlerName] as Function)();
        }

        this.validate(ValidationScopes.Property, property);

        this.$notify({
            action: DataAction.Modified,
            sourcePath: this.$src.path,
            dataPath: property,
            dataInfo:
                propInfo.kind === PropertyTypology.Scalar
                    ? 'scalar'
                    : propInfo.kind === PropertyTypology.Object
                    ? 'object'
                    : propInfo.kind === PropertyTypology.Tuple
                    ? 'tuple'
                    : propInfo.kind === PropertyTypology.List
                    ? 'array'
                    : 'map'
        });
    }

    public $assign(value: Partial<T>, withRootNotification = false): this {
        if (!this.$isEditing) {
            this.$edit();
        }
        this.$trackChange(false);
        try {
            const type = this.$src.type as OType;
            Object.keys(value).forEach((propertyName) => {
                const propertyType = type.allProperties[propertyName];
                if (propertyType) {
                    switch (propertyType.kind) {
                        case PropertyTypology.Scalar:
                            this[propertyName] = (value as any)[propertyName];
                            break;

                        default:
                            (this[propertyName] as IViewElement).$assign((value as any)[propertyName]);
                            break;
                    }
                }
            });
        } catch (ex) {}
        this.$trackChange(true);
        if (withRootNotification) {
            this.$notify(REFRESH_PAYLOAD);
        }
        return this;
    }

    public $children(): StringMap<IViewElement> {
        if (this._refCache) {
            return this._refCache as StringMap<IViewElement>;
        }
        return {};
    }

    public $json(): JsonObj  {
        const data = {} as any;
        const src = MetadataHelper.getTypeInfo(this);
        const type = src.type as OType;
        const propDefs = type.allProperties;
        for (const p in propDefs) {
            if (propDefs.hasOwnProperty(p)) {
                const propDef = propDefs[p];
                switch (propDef.kind) {
                    case PropertyTypology.Scalar:
                        const propertyValue = this[p];
                        if (propDefs.required || isDataAssigned(propertyValue)) {
                            data[p] = propertyValue as JsonObj;
                        }
                        break;
                    default:
                        const json = ((this[p] || NULL_ViewElement) as IViewElement).$json();
                        if (isDataAssigned(json)) {
                            data[p] = json;
                        }
                }
            }
        }
        return data as JsonObj;
    }

    public clone(parent?: IViewElement): Objview<T> {
        const cloneObj = JSON.parse(JSON.stringify(this.$src.obj));
        return new Objview(this.$src.obj as Tobject<T>, cloneObj, parent);
    }

    public $isRoot(): boolean {
        return this._parent_ === undefined;
    }

    public $newChild<U extends IViewElement>(childType: ObjviewType): U {
        const child = new childType(undefined, this) as U;
        child.$src.type.prepare(child.$src.obj, this.$src.obj, PATH_UNASSIGNED);
        child.$edit();
        return child;
    }

    public $notify(arg: DataPayload) {
        if (
            this._ver_ === NO_NOTIFY ||
            arg.sourcePath === PATH_UNASSIGNED ||
            arg.origin === undefined
        ) {
            return;
        }
        this._ver_++;
        if (this.$isRoot()) {
            JoeLogger.group('SEND NOTIF From View ' + this.$src.type.title);
            JoeLogger.info(arg);
            JoeLogger.endgroup();
            this.$editor!.onViewChanged!.next(arg);
        } else {
            this.$parent().$notify(arg);
        }
    }

    public $parent(): IViewElement {
        return this._parent_ || this;
    }

    public $release(): void {
        this._ver_ = -111;
        const self = this;
        if (this._refCache) {
            const children = this.$children();
            const childrenNames = Object.keys(children);
            if (childrenNames && childrenNames.length > 0) {
                childrenNames.forEach((prop) => {
                    const value = children[prop];
                    if (isFunction(value.$release)) {
                        value.$release();
                    }
                });
            }
        }
        self.$editor = undefined;
        self._refCache = undefined;
        self._parent_ = undefined;
        MetadataHelper.clearTypeInfo(self);
    }

    public $refresh(data: any, keepChanges = false): void {
        const src = this.$src;
        const path = src.path;
        const oldData = src.obj;
        const otype = src.type as OType;

        if (!src.isRoot) {
            return this.$parent().$refreshChild(path, data);
        } else {

            const changeSet = [] as ChangeSet;
            if (this.$isEditing) {
                this.$editor!.writeChangeSet(changeSet);
                this.$editor!.cancelEdit();
            }
            MetadataHelper.releaseDoc(oldData);
            if (this._refCache) {
                const cacheKeys = Object.keys(this._refCache);
                if (cacheKeys && cacheKeys.length > 0) {
                    cacheKeys.forEach((p) => (this._refCache![p] as IViewElement).$release());
                }
                this._refCache = {};
            }

            otype.prepare(data, undefined, PATH_ROOT);
            ( src as any)['_obj' ] = data;

            if (keepChanges && changeSet.length > 0) {
                this.$edit().applyChangeSet(changeSet);
            }
        }
    }

    public $refreshChild(property: string, data: any): void {
        const src = this.$src;
        const otype = src.type as OType;

        const obj = this.$src.obj;

        const oldData = obj[property];
        if (oldData) {
            MetadataHelper.detach(oldData);
        }
        obj[property] = data;
        otype.prepare(obj, data, property);

        if (this._refCache && this._refCache[property]) {
            delete this._refCache[property];
        }
    }

    public $root(): IRootViewElement {
        let parent = this._parent_;
        while (parent && !parent.$isRoot()) {
            if (parent !== parent.$parent()) {
                parent = parent.$parent();
            } else {
                throw new Error('Infinite loop on Objview.$root()!');
            }
        }
        return (parent || this) as IRootViewElement;
    }

    public validate(
        scope: ValidationScopes = ValidationScopes.State,
        scopeRef?: any
    ): ValidationState {
        const type = this.$src.type;
        const validationContext = this.$validation;
        // if (src.attached) {
        type.validate(this, scope, scopeRef);
        if (isObjAssigned(this.$rules)) {
            for (const [ruleName, validationRule] of Object.entries(this.$rules!)) {
                if (ruleName === '_' && !validationContext.withError()) {
                    validationContext.setItemErrors(
                        ruleName,
                        validationRule!(this as unknown as T)
                    );
                } else if (validationContext.errors[ruleName] === undefined) {
                    validationContext.setItemErrors(
                        ruleName,
                        validationRule!(this as unknown as T)
                    );
                }
            }
        }
        corelateValidationWithParents(this);
        validationContext.debug(type.title + ' - ' + scope, this.$isRoot());
        return validationContext;
    }

    /**
     * Check the validity of an object instance on the current schema.
     * @param scope instance to validate (required).
     * @returns ValidationResult, map of errors by property name;
     */
    public validateAsync(scope: ValidationScopes = ValidationScopes.State, scopeRef?: any): void {
        const withScope = isStringAssigned(scopeRef);
        const validationContext = this.$validation;

        (this.$src.type as OType).validateAsync(this, scope, scopeRef);
        if (this.$src.attached && isObjAssigned(this.$asyncrules)) {
            for (const [asyncRuleName, asyncValidationRule] of Object.entries(this.$asyncrules!)) {
                if (!withScope || (withScope && scopeRef === asyncRuleName)) {
                    if (asyncRuleName === '_' && !validationContext.withError()) {
                        validationContext.setItemErrors(asyncRuleName, ASYNCRULE_RUNNING);

                        corelateValidationWithParents(this);
                        this.$notify({
                            action: DataAction.Validation,
                            sourcePath: this.$src.path,
                            dataPath: asyncRuleName,
                            origin: DataOrigin.code
                        });

                        asyncValidationRule(this as unknown as T)
                            .then((asyncResult) => {
                                validationContext.setItemErrors(asyncRuleName, asyncResult);

                                corelateValidationWithParents(this);
                                this.$notify({
                                    action: DataAction.Validation,
                                    sourcePath: this.$src.path,
                                    dataPath: asyncRuleName,
                                    origin: DataOrigin.code
                                });
                            })
                            .catch((err) => {
                                validationContext.setItemErrors(asyncRuleName, {
                                    asyncrule: { running: false, error: err }
                                } as DataObj);

                                corelateValidationWithParents(this);
                                this.$notify({
                                    action: DataAction.Validation,
                                    sourcePath: this.$src.path,
                                    dataPath: asyncRuleName,
                                    origin: DataOrigin.code
                                });
                            });
                    } else if (validationContext.errors[asyncRuleName] === undefined) {
                        validationContext.setItemErrors(asyncRuleName, ASYNCRULE_RUNNING);
                        corelateValidationWithParents(this);
                        this.$notify({
                            action: DataAction.Validation,
                            sourcePath: this.$src.path,
                            dataPath: asyncRuleName,
                            origin: DataOrigin.code
                        });

                        asyncValidationRule(this as unknown as T)
                            .then((asyncResult) => {
                                validationContext.setItemErrors(asyncRuleName, asyncResult);

                                corelateValidationWithParents(this);
                                this.$notify({
                                    action: DataAction.Validation,
                                    sourcePath: this.$src.path,
                                    dataPath: asyncRuleName,
                                    origin: DataOrigin.code
                                });
                            })
                            .catch((err) => {
                                validationContext.setItemErrors(asyncRuleName, {
                                    asyncrule: { running: false, error: err }
                                } as DataObj);

                                corelateValidationWithParents(this);
                                this.$notify({
                                    action: DataAction.Validation,
                                    sourcePath: this.$src.path,
                                    dataPath: asyncRuleName,
                                    origin: DataOrigin.code
                                });
                            });
                    }
                }
            }
        }
        this.$validation.debug(this.$src.type.title + ' - ' + (scope || '*'), this.$isRoot());
    }

    public $edit(forceTracking: boolean = false): ObjviewEditor<T> {
        if (forceTracking) {
            this.$trackChange(true);
        }
        if (!this.$editor) {
            JoeLogger.debug(this.$src.type.title + ' -> ' + this.$src.path + ' --- EDIT.');
            const isRoot = this.$isRoot();
            if (!isRoot) {
                this._parent_!.$edit();
            }
            this.$editor = new ObjviewEditor(this);
            if (this._refCache) {
                const cacheKeys = Object.keys(this._refCache);
                if (cacheKeys && cacheKeys.length > 0) {
                    cacheKeys
                        .filter((p) => this._refCache![p] === NULL_ViewElement)
                        .forEach((p) => delete this._refCache![p]);
                }
            }
            if (isRoot && this.onEditingChanged !== undefined) {
                const type = this.$src.type;
                JoeLogger.debug(
                    this.$src.type.title +
                        ' -> ' +
                        this.$src.path +
                        ' --- IS NOTIFYING ITS EDITING STATE.'
                );

                this.onEditingChanged!();
            }
        }
        return this.$editor;
    }

    public $trackChange(active: boolean): this {
        if (active) {
            if (this._ver_ === NO_NOTIFY) {
                this._ver_ = (this as unknown as any)[freezedSym] || 1;
                delete (this as unknown as any)[freezedSym];
            }
        } else {
            if (this._ver_ !== NO_NOTIFY) {
                (this as unknown as any)[freezedSym] = this._ver_;
                this._ver_ = NO_NOTIFY;
            }
        }

        return this;
    }

    public asString(): string {
        if (this.$src && this.$src.type) {
            const otype = this.$src.type as Tobject;
            if (otype.index && otype.index.sort) {
                return otype.getObjDescription(this);
            }
            return otype.title;
        }
        return this.toString();
    }
}
