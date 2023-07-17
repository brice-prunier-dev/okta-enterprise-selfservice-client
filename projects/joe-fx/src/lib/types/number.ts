import {
    isFunction,
    isAssigned,
    isNumber,
    RuntimeMessage,
    NumberAccessor,
    BaseType,
    NumberDef,
    ValidationHandler,
    StringMap,
    ValidationState,
    ValidationScopes
} from '../core';

export const NumberPattern = {
    INT: 'int',
    DOUBLE: 'double',
    UINT: 'unsigned-int-positive',
    UINT_STRICT: 'unsigned-int-positive',
    UDOUBLE: 'unsigned-double',
    UDOUBLE_STRICT: 'unsigned-double-positive'
};

export class Tnumber implements NumberDef, BaseType {
    readonly isScalar: boolean;
    type: 'number';
    pattern: string;
    default: number | NumberAccessor | undefined;
    minimum: number;
    maximum: number;
    minexclusive: number;
    maxexclusive: number;
    title: string;
    constructor(options: NumberDef, name?: string) {
        if (options.pattern === NumberPattern.INT && options.title === 'number') {
            options.title = 'integer';
        }
        this.type = 'number';
        this.pattern = '';
        this.isScalar = true;
        this.minimum = Number.MIN_VALUE;
        this.maximum = Number.MAX_VALUE;
        this.minexclusive = Number.MIN_VALUE;
        this.maxexclusive = Number.MAX_VALUE;
        this.title = name || options.title;
        this._assign(options);
    }

    /**
     * Apply on the current schema not null options.
     * @param options    Number's schema options to set on the current number schema.
     */
    private _assign(options: Partial<NumberDef>) {
        this.pattern = options.pattern || this.pattern || '';
        if (isAssigned(options.default)) {
            this.default = options.default;
        }
        if (
            [NumberPattern.INT, NumberPattern.UINT, NumberPattern.UINT_STRICT].includes(
                this.pattern
            )
        ) {
            this.minimum = options.minimum || this.minimum || Number.MIN_SAFE_INTEGER;
            this.maximum = options.maximum || this.maximum || Number.MAX_SAFE_INTEGER;
            this.minexclusive =
                options.minexclusive || this.minexclusive || Number.MIN_SAFE_INTEGER;
            this.maxexclusive =
                options.maxexclusive || this.maxexclusive || Number.MAX_SAFE_INTEGER;
        } else {
            this.minimum = options.minimum || this.minimum || Number.MIN_VALUE;
            this.maximum = options.maximum || this.maximum || Number.MAX_VALUE;
            this.minexclusive = options.minexclusive || this.minexclusive || Number.MIN_VALUE;
            this.maxexclusive = options.maxexclusive || this.maxexclusive || Number.MAX_VALUE;
        }
    }

    /**
     * Create a new Schema instance that takes the current options as defaultDef
     * and overrides the current definition with the ones past as parameters.
     * @param options    number's schema options to set on the current number schema.
     * @returns          New Schema instance with the current options plus the ones pass as parameter
     */
    extendAs(title: string, options: Partial<NumberDef>): Tnumber {
        const myOption: NumberDef = {
            type: 'number',
            title: title,
            pattern: this.pattern,
            default: this.default,
            minimum: this.minimum,
            maximum: this.maximum,
            minexclusive: this.minexclusive,
            maxexclusive: this.maxexclusive
        };
        const instance = new Tnumber(myOption);
        instance._assign(options);
        return instance;
    }

    defaultValue(asEntity: boolean = false): number | undefined {
        if (isNumber(this.default)) {
            return this.default as number;
        }

        if (isFunction(this.default)) {
            const numberAccessor = this.default as NumberAccessor;
            return numberAccessor();
        }
        return undefined;
    }

    public validate(
        target: any,
        scope: ValidationScopes = ValidationScopes.State
    ): ValidationState {
        const validation = new ValidationHandler();
        if (isAssigned(target)) {
            if (isNumber(target)) {
                const numValue = target as number;
                if (this.pattern === NumberPattern.INT && !Number.isInteger(target)) {
                    validation.writeError('_badtype', { typedef: 'Number', subtypedef: 'as int' });
                } else {
                    validation.writeError('_badtype', undefined);
                }
                if (this.minimum && numValue < this.minimum) {
                    validation.writeError('_numMinimum', {
                        minimum: this.minimum,
                        actualValue: numValue
                    });
                } else if (this.minexclusive && numValue <= this.minexclusive) {
                    validation.writeError('_numMinExclusive', {
                        minexclusive: this.minexclusive,
                        actualValue: numValue
                    });
                }
                if (this.maximum && numValue > this.maximum) {
                    validation.writeError('_numMaximum', {
                        maximum: this.maximum,
                        actualValue: numValue
                    });
                } else if (this.maxexclusive && numValue >= this.maxexclusive) {
                    validation.writeError('_numMaxExclusive', {
                        maxexclusive: this.maxexclusive,
                        actualValue: numValue
                    });
                }
            } else {
                validation.writeError('_badtype', { typedef: 'Number' });
            }
        }
        return validation;
    }
}

RuntimeMessage.Register('_patternAsInt', () => {
    return `Should be a integer!`;
});
RuntimeMessage.Register('_numMinimum', (args) => {
    const min = args['minimum'];
    return `Should be greater or equal to ${min}!`;
});
RuntimeMessage.Register('_numMinExclusive', (args) => {
    const minEx = args['minExclusive'];
    return `Should be greater than ${minEx}!`;
});
RuntimeMessage.Register('_numMaximum', (args) => {
    const max = args['maximum'];
    return `Should be lower or equal to ${max}!`;
});
RuntimeMessage.Register('_numMaxExclusive', (args) => {
    const maxEx = args['maxExclusive'];
    return `Should be lower than ${maxEx}!`;
});
