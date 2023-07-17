import {
    StringAccessor,
    BaseType,
    ValidationHandler,
    StringDef,
    StringMap,
    isAssigned,
    isString,
    isFunction,
    RuntimeMessage,
    ValidationState,
    ValidationScopes
} from '../core';

RuntimeMessage.Register('_strMinlength', (args) => {
    const min = args['minlength'];
    const actual = args['actualLength'];
    return `Should be at least ${min} chars long! (current length: ${actual})`;
});
RuntimeMessage.Register('_strMaxlength', (args) => {
    const max = args['maxlength'];
    const actual = args['actualLength'];
    return `Should not be more then ${max} chars long! (current length: ${actual})`;
});

RuntimeMessage.Register('_strPattern', (args) => {
    const model = args['model'];
    return `Should match ${model} pattern!`;
});

/**
 * Schema for a string property value
 */
export class Tstring implements StringDef, BaseType {
    public readonly isScalar: boolean;
    public type: 'string';
    public pattern: string;
    public patternModel: string;
    public patternRegExp: RegExp | undefined;
    public enumvalues: string[] | undefined;
    public defaultDef: string | StringAccessor | undefined;
    public minlength: number | undefined;
    public maxlength: number | undefined;
    public title: string;
    constructor(options: StringDef, name?: string) {
        this.type = 'string';
        this.title = name || options.title;
        this.isScalar = true;
        this.pattern = '';
        this.patternModel = '';
        this.patternRegExp = undefined;
        this.enumvalues = undefined;
        this.defaultDef = undefined;
        this.minlength = undefined;
        this.maxlength = undefined;
        this._assign(options);
    }

    /**
     * Apply on the current schema not null options.
     * @param options    Number's schema options to set on the current number schema.
     */
    private _assign(options: Partial<StringDef>) {
        this.pattern = options.pattern || this.pattern;
        this.patternModel = options.patternModel || this.patternModel;
        this.patternRegExp =
            options.pattern !== undefined ? new RegExp(options.pattern, 'i') : this.patternRegExp;
        this.enumvalues = options.enum || this.enumvalues;
        this.defaultDef = options.default || this.defaultDef;
        this.minlength = options.minlength || this.minlength;
        this.maxlength = options.maxlength || this.maxlength;
    }

    /**
     * Create a new Schema instance that takes the current options as defaultDef
     * and overrides the current definition with the ones past as parameters.
     * @param options    number's schema options to set on the current number schema.
     * @returns          New Schema instance with the current options plus the ones pass as parameter
     */
    public extendAs(title: string, options: Partial<StringDef>): Tstring {
        const myOption: StringDef = {
            type: 'string',
            title: title,
            pattern: this.pattern,
            patternModel: this.patternModel,
            default: this.defaultDef,
            enum: this.enumvalues,
            minlength: this.minlength,
            maxlength: this.maxlength
        };
        const instance = new Tstring(myOption);
        instance._assign(options);
        return instance;
    }

    /**
     *  Default value as string.
     */
    public defaultValue(): string | undefined {
        if (isFunction(this.defaultDef)) {
            const reader = this.defaultDef as StringAccessor;
            return reader();
        }
        return isString(this.defaultDef) ? (this.defaultDef as string) : undefined;
    }

    public validate(
        target: any,
        scope: ValidationScopes = ValidationScopes.State
    ): ValidationState {
        const validation = new ValidationHandler();
        if (!isString(target)) {
            validation.writeError('_badtype', { typedef: 'String' });
        } else {
            validation.writeError('_badtype', undefined);
            const str_value = target as string;
            if (isAssigned(target) && this.pattern && !this.patternRegExp!.test(str_value)) {
                validation.writeError('_strPattern', {
                    pattern: this.title,
                    value: str_value,
                    model: this.patternModel
                });
            }
            if (this.minlength && str_value.length < this.minlength) {
                validation.writeError('_strMinlength', {
                    minlength: this.minlength,
                    actualLength: str_value.length
                });
            } else if (this.maxlength && str_value.length > this.maxlength) {
                validation.writeError('_strMaxlength', {
                    maxlength: this.maxlength,
                    actualLength: str_value.length
                });
            }
        }
        return validation;
    }
}
