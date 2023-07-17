import {
    PATH_ROOT,
    IViewElement,
    AnyTypeKey,
    AnyDef,
    BaseType,
    PropertyTypology,
    Property,
    toPropertyTypology,
    OType,
    StringMap,
    CoreEntityTypeBehaviour,
    isBlank,
    MetadataHelper,
    ValidationState,
    ValidationScopes,
    ElementValidationState,
    isArray,
    isViewElement
} from '../core';

/**
 * ──────────────────────────────────────────────────────────────────────────────────
 *                   S I M P L E - O B J E C T - P R O P E R T Y
 * ──────────────────────────────────────────────────────────────────────────────────
 */
export class TobjectSimpleProperty implements Property, CoreEntityTypeBehaviour {
    public static Matches(itemSchema: AnyDef): boolean {
        return itemSchema.type !== 'array';
    }
    public readonly def: AnyDef & BaseType;
    public readonly kind: PropertyTypology;
    // public lookup?: LookupDef;
    public readonly required: boolean;
    public readonly property: string;
    public readonly typology: AnyTypeKey;
    constructor(property: string, def: AnyDef & BaseType, required: boolean = true) {
        this.property = property;
        this.required = required;
        this.def = def;
        this.kind = toPropertyTypology(def);
        this.typology = def.type;
    }

    public innertype(): BaseType {
        return this.def;
    }

    public prepare(obj: any, parent: any, path: string = PATH_ROOT) {
        const childObj = obj[path];
        if (childObj && this.kind !== PropertyTypology.Scalar) {
            (this.def as OType).prepare(childObj, obj, path);
        }
    }

    public unprepare(obj: any) {
        if (this.kind !== PropertyTypology.Scalar) {
            (this.def as OType).unprepare(obj);
        }
    }

    validate(state: ValidationState, target: any, scope: ValidationScopes, scopeRef?: any): void {
        if (
            isViewElement(target) &&
            !isArray(target) &&
            !target.$isEditing &&
            (state as ElementValidationState<any>).unassigned()
        ) {
            state.setItemErrors(scopeRef as string, undefined);
        }
        const childScope =
            scope === ValidationScopes.EnforceState
                ? ValidationScopes.EnforceState
                : ValidationScopes.State;
        const childValidation = this.def.validate(target, childScope);
        state.setItemErrors(scopeRef as string, childValidation.errors);
    }

    public defaultValue(): any {
        return this.def.defaultValue();
    }

    public readAsView(obj: any, view: IViewElement): any {
        const value = obj[this.property];
        if (isBlank(value)) {
            const defaultValue = this.defaultValue();
            if (this.kind !== PropertyTypology.Scalar) {
                const otype = this.def as OType;
                otype.prepare(defaultValue, obj, this.property);

                const defaultChildView = new otype.viewctor!(value, view);
                // defaultChildView.$src.setPath(this.property);
                return defaultChildView;
            }
            return defaultValue;
        } else if (this.kind === PropertyTypology.Object) {
            const otype = this.def as OType;
            otype.prepare(value, obj, this.property);

            const childView = new otype.viewctor!(value, view);
            // childView.$src.setPath(this.property);
            return childView;
        }
        return value;
    }
}
