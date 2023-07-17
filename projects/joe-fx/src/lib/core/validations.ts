import { JoeLogger } from './loggers';
import { isBlank, isDataAssigned } from './types-tester';
import { DataObj, ValidationState } from './types';

/**
 * Generic error for required field.
 */
export const REQUIRED_ERROR: DataObj = { _required: { required: true } };
/**
 * Fake error displayed when an asyncronous validation is running.
 * Setting ASYNCRULE_RUNNING makes the validation state invalid.
 * It force UI command to wait for the end of the validation.
 */
export const ASYNCRULE_RUNNING: DataObj = { asyncrule: { running: true } };
/**
 *  Class to manipulate a view error state.
 *  A view error state is a dictionnary that will have an entry on each view property that doesn't comply to its type definition.
 *  The value '_' is used as global error regarding to the view type definition.
 *  Example: if a Setview<T> is empty and has a minLength constraint set to 1 its error state
 *  will include an error on '_' to indicate that it should get one item in the list.
 */
export class ValidationHandler implements ValidationState {
    // #region Properties

    public errors: DataObj;

    // #endregion Properties

    // #region Constructors

    constructor(source?: DataObj) {
        this.errors = source || {};
    }

    // #endregion Constructors

    // #region Public Methods

    public clear() {
        if (this.withError()) {
            Object.keys(this.errors).forEach((prop) => delete this.errors[prop]);
        }
    }

    public debug(context: string, isRoot: boolean) {
        const scope = context || '*';
        if (scope === '*') {
            if (this.withError()) {
                JoeLogger.group('VALIDATION Global : KO');
                JoeLogger.info(this.errors);
                JoeLogger.endgroup();
            } else {
                JoeLogger.debug('VALIDATION Global : OK');
            }
        } else {
            if (this.errors[context]) {
                JoeLogger.group('VALIDATION ' + context + ' : KO');
                JoeLogger.info(this.errors[context] as object);
                JoeLogger.endgroup();
            } else {
                JoeLogger.debug('VALIDATION ' + context + ' : OK');
            }
        }
    }

    public elementErrorsCount(): number {
        return Object.keys(this.errors).filter((s) => isDataAssigned(this.errors[s])).length;
    }

    public errorCount(scope?: any): number {
        return Object.keys(this.errors).filter((s) => isDataAssigned(this.errors[s])).length;
    }

    public merge(validation?: ValidationHandler) {
        const withError = validation !== undefined && validation.withError;
        if (withError) {
            Object.keys(validation.errors!).forEach((p) => (this.errors[p] = validation.errors[p]));
        }
    }

    public setItemErrors(propName: string, error: DataObj | undefined): void {
        const withError = isDataAssigned(error);
        if (withError) {
            this.errors[propName] = error!;
        } else if (this.errors[propName]) {
            delete this.errors[propName];
        }
    }

    public setPropertyValidation(propertyName: string, propertyValidationState: ValidationState) {
        if (propertyValidationState.withError()) {
            this.errors[propertyName] = propertyValidationState.errors;
        } else if (this.errors[propertyName]) {
            delete this.errors[propertyName];
        }
    }

    public withCoreError(): boolean {
        return (
            Object.keys(this.errors).filter(
                (s) => !s.startsWith('_') && isDataAssigned(this.errors[s])
            ).length > 0
        );
    }

    public withError(): boolean {
        return this.errorCount() > 0;
    }

    public writeError(errorName: string, errorArgs: DataObj | undefined): boolean {
        const withError = errorArgs !== undefined;
        if (isDataAssigned(errorArgs)) {
            this.errors[errorName] = errorArgs!;
        } else if (this.errors[errorName]) {
            delete this.errors[errorName];
        }
        return withError;
    }

    // #endregion Public Methods
}

export type ElementErrorResults<T> = { [P in keyof T]?: DataObj | undefined } & {
    _?: DataObj | undefined;
} & DataObj;

export class ElementValidationState<T> implements ValidationState {
    // #region Properties

    public errors: ElementErrorResults<T>;
    public initialized = false;
    // #endregion Properties

    // #region Constructors

    constructor(source?: ElementErrorResults<T>) {
        this.errors = source || {};
    }

    // #endregion Constructors

    // #region Public Methods

    public checking(error: DataObj | undefined) {
        return error === ASYNCRULE_RUNNING;
    }

    public clear() {
        if (this.withError()) {
            const errors = this.errors as any;
            const props = Object.keys(errors);
            for (const prop of props) {
                delete errors[prop];
            }
        }
        this.initialized = false;
    }

    public debug(context: string, isRoot: boolean) {
        const scope = context || '*';
        if (scope === '*') {
            if (this.withError()) {
                JoeLogger.group('VALIDATION Global : KO');
                JoeLogger.info(this.errors);
                JoeLogger.endgroup();
            } else {
                JoeLogger.debug('VALIDATION Global : OK');
            }
        } else {
            if (this.errors[context]) {
                JoeLogger.group('VALIDATION ' + context + ' : KO');
                JoeLogger.info(this.errors[context] as object);
                JoeLogger.endgroup();
            } else {
                JoeLogger.debug('VALIDATION ' + context + ' : OK');
            }
        }
    }

    public matchesRequiredConstraint(
        propertyName: keyof T | '_',
        required: boolean,
        value: any
    ): boolean {
        const unassigned = isBlank(value);
        const errors = this.errors as any;
        if (required && unassigned) {
            errors[propertyName] = REQUIRED_ERROR;
        } else if (unassigned || this.errors[propertyName] === REQUIRED_ERROR) {
            delete errors[propertyName];
        }

        return !unassigned;
    }

    public setItemErrors(propName: string, error: DataObj | undefined): void {
        const withError = isDataAssigned(error);
        if (withError) {
            (this.errors as DataObj)[propName] = error!;
        } else if ((this.errors as DataObj)[propName]) {
            delete (this.errors as DataObj)[propName];
        }
    }

    public unassigned(): boolean {
        return (
            this.errors === undefined ||
            (this.errors !== undefined &&
                Object.values(this.errors).some((value) => value === REQUIRED_ERROR))
        );
    }

    public withCoreError(): boolean {
        if (this.errors !== undefined) {
            const values = Object.values(this.errors);
            for (const value of values) {
                if (value !== undefined) {
                    if (
                        Object.keys(value).filter(
                            (s) => !s.startsWith('_') && isDataAssigned((value as any)[s])
                        ).length > 0
                    ) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    public withError(): boolean {
        return isDataAssigned(this.errors);
    }

    // #endregion Public Methods
}

/**
 * ValidationState implementation for an Array
 * * Array specific constraint as min/mas Items count are set on '_' property name.
 * 
 * Invalid child item will be set:
 * * on a position index '[x]' if child is scalar or has no index,
 * * on **JOE** Json path key index '(Xxx)' when the child has an index.
 */
export class ListValidationState implements ValidationState {
    // #region Public Static Methods

    public static FROM(source: DataObj): ListValidationState {
        const result = new ListValidationState();
        if (source) {
            result.errors = source;
        }
        return result;
    }

    // #endregion Public Static Methods

    // #region Properties

    public initialized = false;
    public errors: DataObj;

    // #endregion Properties

    // #region Constructors

    constructor() {
        this.errors = {};
    }

    // #endregion Constructors

    // #region Public Methods

    public clear() {
        this.clearListError();
        this.initialized = false;
    }

    public clearListError(all: boolean = false): void {
        const errors = this.errors as any;
        if (all) {
            if (this.withError()) {
                const props = Object.keys(errors);
                for (const prop in props) {
                    delete errors[prop];
                }
            }
        } else if (this.errors?._) {
            errors._ = undefined;
        }
    }

    public debug(context: string, isRoot: boolean) {
        const scope = context || '*';
        if (scope === '*') {
            if (this.withError()) {
                JoeLogger.group('VALIDATION Global : KO');
                JoeLogger.info(this.errors);
                JoeLogger.endgroup();
            } else {
                JoeLogger.debug('VALIDATION Global : OK');
            }
        } else {
            if (this.errors[context]) {
                JoeLogger.group('VALIDATION ' + context + ' : KO');
                JoeLogger.info(this.errors[context] as object);
                JoeLogger.endgroup();
            } else {
                JoeLogger.debug('VALIDATION ' + context + ' : OK');
            }
        }
    }

    public getItemState(propName: string): ValidationHandler {
        return new ValidationHandler(this.errors[propName] as DataObj | undefined);
    }

    public merge(childrenErrors: DataObj): this {
        if (isDataAssigned(childrenErrors)) {
            const errors = this.errors as any;
            const selfExtra = childrenErrors._ as any;
            if (isDataAssigned(selfExtra)) {
                this.errors._ = this.withError() ? { ...errors._, ...selfExtra } : selfExtra;
                delete childrenErrors._;
            }
            if (isDataAssigned(childrenErrors)) {
                this.errors = this.withError()
                    ? { ...this.errors, ...childrenErrors }
                    : { ...childrenErrors };
            }
        }
        return this;
    }

    public result(): DataObj | undefined {
        return this.withError() ? this.errors : undefined;
    }

    public setItemError(propName: string, errorName: string, error: DataObj | undefined): boolean {
        const propError = this.getItemState(propName);
        propError.writeError(errorName, error);
        return this.setItemState(propName, propError);
    }

    public setItemErrors(propName: string, error: DataObj | undefined): void {
        const withError = isDataAssigned(error);
        if (withError) {
            this.errors[propName] = error!;
        } else if (this.errors[propName]) {
            delete this.errors[propName];
        }
    }

    public setItemState(propName: string, result?: ValidationState): boolean {
        const withError = result !== undefined && result.withError();
        if (withError) {
            this.errors[propName] = result.errors;
        } else {
            delete this.errors[propName];
        }
        return withError;
    }

    public setPropertyValidation(propertyName: string, propertyErrors: ValidationState) {
        this.setItemErrors(propertyName, propertyErrors.errors);
    }

    public withCoreError(): boolean {
        return this.errors._ !== undefined;
    }

    public withError(): boolean {
        return isDataAssigned(this.errors);
    }

    // #endregion Public Methods
}
export type ValidationRule<T> = (v: T) => DataObj | undefined;
export type AsyncValidationRule<T> = (v: T) => Promise<DataObj | undefined>;
