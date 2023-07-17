import {
    AnyDef,
    AnyTypeKey,
    ArrayItemProperty,
    BaseType,
    MType,
    OType,
    PropertyTypology,
    toPropertyTypology,
    StringMap,
    PATH_ROOT,
    isAssigned,
    isViewElement,
    ListValidationState,
    isBoolean,
    asArray,
    toArraySelector,
    ValidationState,
    DataObj,
    ValidationScopes,
    extractContent
} from '../core';
import { Tarray } from './array';
import { Tobject } from './object';
import { MapViewFactory } from './factory-mview';

export class TarraySimpleItem implements ArrayItemProperty {
    // #region Properties

    readonly def: AnyDef & BaseType;
    readonly kind: PropertyTypology;
    readonly required: boolean;
    readonly typology: AnyTypeKey;

    // #endregion Properties

    // #region Constructors

    constructor(def: AnyDef & BaseType, required: boolean = true) {
        this.required = required;
        this.def = def;
        this.kind = toPropertyTypology(def);
        this.typology = def.type;
    }

    // #endregion Constructors

    // #region Public Accessors

    get isObject(): boolean {
        return this.kind === PropertyTypology.Object;
    }

    get isScalar(): boolean {
        return this.kind === PropertyTypology.Scalar;
    }

    // #endregion Public Accessors

    // #region Public Static Methods

    static Matches(sch: AnyDef): boolean {
        return sch.type !== 'array';
    }

    // #endregion Public Static Methods

    // #region Public Methods

    defaultValue(typename?: string | number, asEntity?: boolean): any {
        switch (this.kind) {
            case PropertyTypology.Map:
                const kl = {};
                return asEntity ? MapViewFactory.Create(kl, this.def as MType) : kl;

            case PropertyTypology.Object:
                const otype = this.def as OType;
                const obj = this.def.defaultValue();

                if (asEntity && !otype.viewctor) {
                    throw new Error(`${otype.title} has no view configured!`);
                }
                return asEntity ? new otype.viewctor!(obj) : obj;

            default:
                return this.def.defaultValue();
        }
    }

    innertype(): BaseType {
        return this.def;
    }

    prepare(obj: any, parent: any, path: string = PATH_ROOT) {
        if (obj && asArray(obj)) {
            let idx = 0;
            for (const item of obj) {
                (this.def as OType).prepare(item, obj, toArraySelector(idx++));
            }
        }
    }

    readAsView(obj: any, idx: number, view: any): any {
        if (this.isScalar) {
            return obj;
        }
        const otype = this.def as OType;
        if (obj) {
            if (this.isObject) {
                const key = otype.viewctor ? otype.getIndexPath(obj) : `${idx}`;
                otype.prepare(obj, view.$src.obj, key);
                if (otype.viewctor === undefined) {
                    throw new Error(`${otype.title} has no view configured!`);
                }
                // return new otype.viewctor(obj, view);

                const childView = new otype.viewctor(obj, view);
                // childView.$src.setPath(key);
                return childView;
            }
        }
        return undefined;
    }

    unprepare(obj: any) {
        switch (this.kind) {
            case PropertyTypology.Tuple:
            case PropertyTypology.List:
                (this.def as Tarray).unprepare(obj);
                break;
            case PropertyTypology.Object:
                (this.def as OType).unprepare(obj);
                break;
            case PropertyTypology.Map:
                (this.def as MType).unprepare(obj);
                break;
            default:
                return;
        }
    }

    validate(state: ValidationState, target: any, scope: ValidationScopes, scopeRef?: any): void {
        const childScope =
            scope === ValidationScopes.EnforceState
                ? ValidationScopes.EnforceState
                : ValidationScopes.State;

        const array = target as any[];

        if (scope === ValidationScopes.AddChild) {
            const t = this.def as Tobject;
            const propKey = scopeRef as string;
            const withIndexCheck = propKey.startsWith('(');
            if (withIndexCheck) {
                const twin = array.filter(
                    (o: any, idx: number) => o !== scope && propKey === t.getIndexPath(idx, o)
                );
                if (twin && twin.length > 1) {
                    state.setItemErrors('_', {
                        _lstIndex: { index: propKey }
                    } as DataObj);
                }
            }
        } else {
            for (let i = 0; i < array.length; i++) {
                const child = array[i];
                if (this.def.isScalar) {
                    state.setItemErrors(`[${i}]`, this.def.validate(child, childScope).errors);
                } else {
                    const t = this.def as Tobject;
                    state.setItemErrors(
                        t.getIndexPath(i, child),
                        isViewElement(child)
                            ? child.validate(childScope).errors
                            : this.def.validate(child, childScope).errors
                    );
                }
            }
        }
    }

    // #endregion Public Methods
}
