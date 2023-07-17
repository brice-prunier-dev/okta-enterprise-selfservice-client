import {
    isArray,
    asArray,
    RuntimeMessage,
    RuntimeSummary,
    MessageDomain,
    MessageTypology,
    AType,
    ArrayDef,
    AnyDef,
    ArrayItemProperty,
    StringMap,
    SetviewTypeConstructor,
    PropertyTypology,
    MetadataHelper,
    PATH_ROOT,
    JoeLogger,
    isAssigned,
    ListValidationState,
    isViewElement,
    ValidationState,
    REQUIRED_ERROR,
    IndexDef,
    asString,
    readPath,
    normalizePath,
    encodeSelector,
    isStringAssigned,
    toIndexSelector,
    PATH_UNASSIGNED,
    isBlank,
    TupleDef,
    ValidationScopes,
    OType
} from '../core';

import { TarraySimpleItem } from './array-item.simple';
import { TarrayArrayItem } from './array-item.array';
import { TarrayTupleItem } from './array-item.tuple';
import { TypeFactory } from './factory-type';
import { ArrayTypeFactory } from './factory-atype';

RuntimeMessage.Register('_lstMinlength', (args) => {
    return `Required at least ${args.minlength} item!`;
});

RuntimeMessage.Register('_lstMaxlength', (args) => {
    const max = args.maxlength;
    return `Is bounded to a maximum of ${args.maxlength} ! (currently: ${max}).`;
});

RuntimeMessage.Register('_lstItemRequired', (args) => {
    const index = args.index;
    return `${index}# should not be a null !`;
});

RuntimeMessage.Register('_lstIndex', (args) => {
    const index = args.index;
    return `${index} is not a unique identifier!`;
});

export class Tarray<T = any> implements AType {
    public readonly isScalar: boolean;
    public readonly isTuple: boolean;
    public viewctor?: SetviewTypeConstructor;
    public type: 'array';
    public title: string;
    /**
     * Index definition for Tuple
     * 'id' fields goes equals
     * and
     * 'sort' fiels goes flist sort.
     */
    public index?: IndexDef;

    public items: AnyDef | AnyDef[];
    public itemsTypeDef?: ArrayItemProperty;
    // public patern: number;
    public minlength: number;
    public maxlength: number;
    public size: number;
    constructor(options: ArrayDef, name?: string) {
        this.type = 'array';
        this.size = 1;
        this.title = name || options.title;
        this.minlength = options.minlength;
        this.maxlength = options.maxlength;
        this.items = options.items;
        this.isTuple = false;
        if (isArray(this.items)) {
            this.isScalar = false;
            if (TarrayTupleItem.Matches(this.items as AnyDef[], options)) {
                this.isTuple = true;
                this.index = (options as TupleDef).index;
                const tuple = (this.itemsTypeDef = new TarrayTupleItem(this, true, this.title));
                this.title = tuple.title;
            }
        } else {
            if (TarraySimpleItem.Matches(this.items as AnyDef)) {
                const itemType = TypeFactory.TYPEDEF(this.items as AnyDef);
                this.itemsTypeDef = new TarraySimpleItem(itemType);
                this.isScalar = this.itemsTypeDef.kind === PropertyTypology.Scalar;
                if (!isAssigned(this.title)) {
                    this.title = itemType.title;
                }
            } /* if ( TarrayArrayItem.Matches( this.items as AnyDef ) ) */ else {
                const atype = TypeFactory.TYPEDEF(this.items as ArrayDef) as AType;
                this.itemsTypeDef = new TarrayArrayItem(atype);
                if (!isAssigned(this.title)) {
                    this.title = atype.title;
                }
                this.isScalar = false;
                this.size += atype.size;
            }
        }
    }

    public options(): ArrayDef {
        return {
            type: 'array',
            title: this.title,
            minlength: this.minlength,
            maxlength: this.maxlength,
            items: this.items
        };
    }

    public get withIndex(): boolean {
        return (this.itemsTypeDef!.def as unknown as OType).index !== undefined;
    }

    public get isMultiDimension(): boolean {
        return this.itemsTypeDef instanceof TarrayArrayItem;
    }

    public defaultValue(): T[] {
        const array = this.isTuple ? this.itemsTypeDef!.defaultValue() : [];
        return MetadataHelper.getTypeInfoSafe(array, this).obj;
    }

    public propType(): string {
        return '?'; // TODO TO_IMPLEMENT
    }

    public isNew(obj: any): boolean {
        return isBlank(obj) || (asArray(obj) && obj.length === 0);
    }

    public get hasScalarItems(): boolean {
        return this.itemsTypeDef!.kind === PropertyTypology.Scalar;
    }

    public get hasObjectItems(): boolean {
        return this.itemsTypeDef!.kind === PropertyTypology.Object;
    }

    /**
     * Extract index {'.>[0]': 'xxx'} from obj (Xxx)
     */
    public buildIndexObjFromSelectorValue(value: string | number | (string | number)[]): any {
        const index: any = {};
        const indexDef = (this.itemsTypeDef!.def as unknown as OType).index!;

        if (asArray(value)) {
            (indexDef.id as string[]).forEach((p, idx) => (index[p] = value[idx]));
        } else {
            index[indexDef.id[0]] = value;
        }

        return index;
    }

    /**
     * turn { id: 'xxx' } into '{#xxx, yyy}'
     */
    public getIndexPath(obj: any, index?: number): string {
        if (!this.withIndex) {
            return index === undefined ? '' : `${index}`;
        }
        const idDef = (this.itemsTypeDef!.def as unknown as OType).index!.id;
        let indexVal = this.getIndexValue(obj);
        const selectorValue = encodeSelector(indexVal);
        return isStringAssigned(selectorValue) ? toIndexSelector(selectorValue) : '';
    }

    public getIndexValue(obj: any): string | number | (string | number)[] {
        if (!this.withIndex) {
            return '';
        }
        const idDef = (this.itemsTypeDef!.def as unknown as OType).index!.id;

        if (idDef) {
            if (asString(idDef)) {
                return readPath(obj, normalizePath(idDef));
            } else {
                if (idDef.length === 1) {
                    return readPath(obj, normalizePath(idDef[0]));
                } else {
                    return idDef.map<string | number>((s) => readPath(obj, normalizePath(s)));
                }
            }
        }
        return '';
    }

    public prepare(obj: any, parent?: any, path: string = PATH_ROOT) {
        if (obj) {
            if (isArray(obj)) {
                const array = obj as any[];
                const notPrepared = MetadataHelper.isNotPrepared(array);
                const objInfo = MetadataHelper.getTypeInfoSafe(array, this);

                if (parent && (notPrepared || objInfo.detached)) {
                    const parentInfo = MetadataHelper.getTypeInfo(parent);
                    if (path != PATH_UNASSIGNED) {
                        if (parentInfo.isArray && this.withIndex) {
                            path = this.getIndexPath(obj);
                        }
                    }
                    const childPath = parentInfo.childPath(path);
                    // JoeLogger.debug(childPath);
                    objInfo.setParent(childPath, parentInfo);
                } else if (!parent && (notPrepared || objInfo.detached)) {
                    objInfo.setPath(PATH_ROOT);
                    // JoeLogger.header(objInfo.type.title);
                }

                if (notPrepared && !this.isScalar) {
                    if (this.isTuple) {
                        (this.itemsTypeDef as TarrayTupleItem).prepare(array, parent, path);
                    } else if (this.isMultiDimension) {
                        (this.itemsTypeDef as TarrayArrayItem).prepare(array, parent, path);
                    } else {
                        (this.itemsTypeDef as TarraySimpleItem).prepare(array, parent, path);
                    }
                }
            }
        }
    }

    public unprepare(obj: any) {
        if (obj && asArray(obj)) {
            const objInfo = MetadataHelper.getTypeInfo(obj);
            if (this.hasObjectItems) {
                for (const item of obj) {
                    this.itemsTypeDef!.unprepare(item);
                }
            }
            objInfo.release();
            MetadataHelper.clearTypeInfo(obj);
        }
    }
    public validate(
        target: any,
        scope: ValidationScopes = ValidationScopes.State,
        scopeRef?: any
    ): ValidationState {
        const isView = isViewElement(target);
        const hasScalarItems = this.hasScalarItems;
        // on view children validation use parent view validationState
        // otherwhy a new validationState is used
        const validationContext = isView
            ? (target.$validation as ListValidationState)
            : new ListValidationState();
        if (!validationContext.initialized || scope !== ValidationScopes.State) {
            if (target) {
                if (isArray(target)) {
                    validationContext.clearListError(
                        hasScalarItems && scope === ValidationScopes.State
                    );
                    const array = target as any[];
                    const lstMinlength =
                        array.length < this.minlength
                            ? {
                                  actualLength: array.length,
                                  minlength: this.minlength
                              }
                            : undefined;
                    validationContext.setItemError('_', '_lstMinlength', lstMinlength);

                    const lstMaxlength =
                        this.maxlength && array.length > this.maxlength
                            ? {
                                  actualLength: array.length,
                                  maxlength: this.maxlength
                              }
                            : undefined;
                    validationContext.setItemError('_', '_lstMaxlength', lstMaxlength);

                    switch (scope) {
                        case ValidationScopes.RemoveChild:
                            validationContext.setItemErrors(scopeRef as string, undefined);
                            break;

                        case ValidationScopes.AddChild:
                            validationContext.setItemErrors(scopeRef as string, undefined);
                            this.itemsTypeDef!.validate(
                                validationContext,
                                array,
                                ValidationScopes.AddChild,
                                scopeRef
                            );
                            break;

                        default:
                            this.itemsTypeDef!.validate(validationContext, array, scope, scopeRef);
                            break;
                    }

                    return validationContext as ValidationState;
                } else {
                    validationContext.setItemErrors('_', { _badtype: { typedef: 'Array' } });
                }
            } else {
                validationContext.errors = { _: REQUIRED_ERROR };
            }
        }
        validationContext.initialized = true;
        return validationContext;
    }
    public fillValidationSummary(
        objErrors: StringMap,
        summary: RuntimeSummary,
        path: string
    ): RuntimeSummary {
        for (const errorTarget in objErrors) {
            if (errorTarget === '_') {
                const arrayErrors = objErrors._;
                for (const errorType in arrayErrors) {
                    if (
                        ['_badtype', '_lstMinlength', '_lstMaxlength', '_lstItemRequired'].includes(
                            errorType
                        )
                    ) {
                        const errorDef = arrayErrors[errorType];
                        if (path) {
                            const msg = RuntimeMessage.ErrorText(errorType, errorDef);
                            summary.push(
                                new RuntimeMessage(
                                    msg,
                                    MessageDomain.VALIDATION,
                                    [path, errorTarget],
                                    MessageTypology.Error,
                                    errorDef
                                )
                            );
                        } else {
                            const msg = RuntimeMessage.ErrorText(errorType, errorDef);
                            summary.push(
                                new RuntimeMessage(
                                    msg,
                                    MessageDomain.VALIDATION,
                                    [],
                                    MessageTypology.Error,
                                    errorDef
                                )
                            );
                        }
                    }
                }
            } else if (this.hasScalarItems) {
                for (const itemError in objErrors[errorTarget]) {
                    // if ( [ '_badtype', '_lstMinlength', '_lstMaxlength', '_lstItemRequired' ].includes( errorPropName ) ) {
                    const errorDef = objErrors[errorTarget][itemError];
                    if (path) {
                        const msg =
                            errorTarget + ': ' + RuntimeMessage.ErrorText(itemError, errorDef);
                        summary.push(
                            new RuntimeMessage(
                                msg,
                                MessageDomain.VALIDATION,
                                [path, itemError],
                                MessageTypology.Error,
                                errorDef
                            )
                        );
                    } else {
                        const msg =
                            errorTarget + ': ' + RuntimeMessage.ErrorText(itemError, errorDef);
                        summary.push(
                            new RuntimeMessage(
                                msg,
                                MessageDomain.VALIDATION,
                                [],
                                MessageTypology.Error,
                                errorDef
                            )
                        );
                    }
                }
            }
        }
        return summary;
    }
}

ArrayTypeFactory.InitializeConstructor(Tarray);
