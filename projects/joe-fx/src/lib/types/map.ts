import {
    asObject,
    isAssigned,
    RuntimeMessage,
    RuntimeSummary,
    MessageDomain,
    MessageTypology,
    MType,
    ArrayDef,
    AnyDef,
    MapProperty,
    StringMap,
    PropertyTypology,
    MetadataHelper,
    MapviewType,
    PATH_ROOT,
    AType,
    MapDef,
    ListValidationState,
    isViewElement,
    isArrayAssigned,
    IndexDef,
    isBlank,
    ValidationState,
    ValidationScopes,
    JoeLogger
} from '../core';
import { TmapSimpleItem } from './map-item.simple';
import { TmapArrayItem } from './map-item.array';
import { TypeFactory } from './factory-type';
import { MapTypeFactory } from './factory-mtype';

RuntimeMessage.Register('mapMinlength', (args) => {
    const min = args.minlength;
    return `Required at least ${min} items!`;
});

RuntimeMessage.Register('mapMaxlength', (args) => {
    const max = args.maxlength;
    const l = args.length;
    return !!l
        ? `Is bounded to a maximum of ${max} items! (currently: ${l}).`
        : `Is bounded to a maximum of ${max} items!.`;
});

export class Tmap<T = any> implements MType {
    // #region Properties

    readonly isTuple: boolean;

    readonly isScalar: boolean;

    items: AnyDef | AnyDef[];
    itemsTypeDef?: MapProperty;
    maxlength: number;
    // patern: number;
    minlength: number;
    needHoisting: boolean;
    size: number;
    title: string;
    type: 'map';
    viewctor?: MapviewType;

    // #endregion Properties

    // #region Constructors

    constructor(options: MapDef, name?: string) {
        this.type = 'map';
        this.size = 1;
        this.isScalar = false;
        this.isTuple = false;
        this.title = name || options.title;
        this.minlength = options.minlength;
        this.maxlength = options.maxlength;
        this.items = options.items;
        this.needHoisting = true;
        if (TmapSimpleItem.Matches(this.items as AnyDef)) {
            const itemType = TypeFactory.TYPEDEF(this.items as AnyDef);
            this.itemsTypeDef = new TmapSimpleItem(itemType);
            if (this.itemsTypeDef.kind === PropertyTypology.Scalar) {
                this.needHoisting = false;
            }
            if (!isAssigned(this.title)) {
                this.title = itemType.title;
            }
        } else if (TmapArrayItem.Matches(this.items as AnyDef)) {
            const atype = TypeFactory.TYPEDEF(this.items as ArrayDef) as AType;
            this.itemsTypeDef = new TmapArrayItem(atype);
            if (!isAssigned(this.title)) {
                this.title = atype.title;
            }
            this.size += atype.size;
        }
    }

    // #endregion Constructors

    // #region Public Accessors

    get isMultiDimension(): boolean {
        return this.itemsTypeDef instanceof TmapArrayItem;
    }

    // #endregion Public Accessors

    // #region Public Methods

    defaultValue(): any {
        const obj = {};
        return MetadataHelper.getTypeInfoSafe(obj, this).obj;
    }

    fillValidationSummary(
        objErrors: StringMap,
        summary: RuntimeSummary,
        path: string
    ): RuntimeSummary {
        for (const errorPropName in objErrors) {
            if (['_badtype', '_mapMinlength', '_mapMaxlength'].includes(errorPropName)) {
                const errorDef = objErrors[errorPropName];
                const msg = RuntimeMessage.ErrorText(errorPropName, errorDef);
                summary.push(
                    new RuntimeMessage(
                        msg,
                        MessageDomain.VALIDATION,
                        [path, errorPropName],
                        MessageTypology.Error,
                        errorDef
                    )
                );
            }
        }
        return summary;
    }

    options(): ArrayDef {
        return {
            type: 'array',
            title: this.title,
            minlength: this.minlength,
            maxlength: this.maxlength,
            items: this.items
        };
    }

    prepare(map: any, parent?: any, path: string = PATH_ROOT) {
        if (map) {
            const notPrepared = MetadataHelper.isNotPrepared(map);

            const objInfo = MetadataHelper.getTypeInfoSafe(map, this);
            if (parent && (notPrepared || objInfo.detached)) {
                const parentInfo = MetadataHelper.getTypeInfo(parent);
                const childPath = parentInfo.childPath(path);
                // JoeLogger.debug(childPath);
                objInfo.setParent(childPath, parentInfo);
            } else if (!parent && (notPrepared || objInfo.detached)) {
                objInfo.setPath(PATH_ROOT);
                // JoeLogger.header(objInfo.type.title);
            }
            if (notPrepared) {
                const keys = Object.keys(map);
                if (isArrayAssigned(keys)) {
                    keys.forEach((property) => {
                        const mapChild = map[property];
                        this.itemsTypeDef!.prepare(mapChild, map, property);
                    });
                }
            }
        }
    }

    public isNew(obj: any): boolean {
        return isBlank(obj) || Object.keys(obj).length === 0;
    }

    propType(): string {
        return '?'; // TODO TO_IMPLEMENT
    }

    unprepare(obj: any) {
        if (obj && typeof obj === 'object') {
            const objInfo = MetadataHelper.getTypeInfo(obj);
            if (objInfo) {
                const itemTypeDef = this.itemsTypeDef!;
                if (itemTypeDef!.kind !== PropertyTypology.Scalar) {
                    const keys = Object.keys(obj);
                    keys.forEach((property) => itemTypeDef.unprepare(obj[property]));
                }
                objInfo.release();
                MetadataHelper.clearTypeInfo(obj);
            }
        }
    }

    public validate(
        target: any,
        scope: ValidationScopes = ValidationScopes.State,
        scopeRef?: any
    ): ValidationState {
        const validationContext = isViewElement(target)
            ? (target.$validation as ListValidationState)
            : new ListValidationState();
        if (!validationContext.initialized || scope !== ValidationScopes.State) {
            if (asObject(target)) {
                const keys = Object.keys(target).filter(
                    (k) =>
                        typeof target[k] === 'object' &&
                        !k.startsWith('_') &&
                        !k.endsWith('_') &&
                        !k.startsWith('$') &&
                        !k.endsWith('$')
                );

                const mapMinlength =
                    keys.length < this.minlength
                        ? { actualLength: keys.length, minlength: this.minlength }
                        : undefined;
                validationContext.setItemError('_', 'mapMinlength', mapMinlength);

                const mapMaxlength =
                    this.maxlength && keys.length > this.maxlength
                        ? { actualLength: keys.length, maxlength: this.maxlength }
                        : undefined;
                validationContext.setItemError('_', 'mapMaxlength', mapMaxlength);

                switch (scope) {
                    case ValidationScopes.RemoveChild:
                        validationContext.setItemErrors(scopeRef as string, undefined);
                        break;

                    case ValidationScopes.AddChild:
                        validationContext.setItemErrors(scopeRef as string, undefined);
                        this.itemsTypeDef!.validate(
                            validationContext,
                            target,
                            ValidationScopes.AddChild,
                            scopeRef
                        );
                        break;

                    default:
                        this.itemsTypeDef!.validate(validationContext, target, scope, scopeRef);
                        break;
                }
            } else {
                validationContext.setItemError('_', '_badtype', { typedef: 'Array' });
            }
        }
        validationContext.initialized = true;
        return validationContext;
    }

    // #endregion Public Methods
}

MapTypeFactory.InitializeConstructor(Tmap);
