import {
    isAssigned,
    isFunction,
    isDate,
    asDate,
    DateAccessor,
    DateDef,
    BaseType,
    ValidationHandler,
    RuntimeMessage,
    StringMap,
    DataObj,
    ValidationState,
    ValidationScopes
} from '../core';

export const DatePattern = {
    DATETIME: 'DATETIME',
    DATE: 'DATE',
    YEAR: 'YEAR',
    MONTH: 'MONTH'
};

RuntimeMessage.Register('dateMinimum', (args) => {
    const min = args['minimum'];
    return `Should be on or after the ${min}!`;
});
RuntimeMessage.Register('dateMinExclusive', (args) => {
    const minEx = args['minExclusive'];
    return `Should be after the ${minEx}!`;
});
RuntimeMessage.Register('dateMaximum', (args) => {
    const max = args['maximum'];
    return `Should be on or prior the ${max}!`;
});
RuntimeMessage.Register('dateMaxExclusive', (args) => {
    const maxEx = args['maxExclusive'];
    return `Should be prior the ${maxEx}!`;
});

export class Tdate implements DateDef, BaseType {
    // #region Properties

    readonly isScalar: boolean;

    defaultDef: Date | DateAccessor | undefined;
    maxexclusive: Date | undefined;
    maximum: Date | undefined;
    minexclusive: Date | undefined;
    minimum: Date | undefined;
    pattern: string | undefined;
    title: string;
    type: 'date';

    // #endregion Properties

    // #region Constructors

    constructor(options: DateDef, name?: string) {
        this.type = 'date';
        this.title = name || options.title;
        this.isScalar = true;
        this.pattern = undefined;
        this.minimum = undefined;
        this.maximum = undefined;
        this.minexclusive = undefined;
        this.maxexclusive = undefined;
        this._assign(options);
    }

    // #endregion Constructors

    // #region Public Static Methods

    static AS_DATE(dt: Date): Date {
        const dtAsDate = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
        return dt === dtAsDate ? dt : dtAsDate;
    }

    static NOW(): Date {
        return new Date(Date.now());
    }

    static TODAY(): Date {
        return Tdate.AS_DATE(new Date(Date.now()));
    }

    // #endregion Public Static Methods

    // #region Public Methods

    defaultValue(): Date | undefined {
        if (isDate(this.defaultDef)) {
            return this.defaultDef as Date;
        }
        if (isFunction(this.defaultDef)) {
            const dateAccessor = this.defaultDef as DateAccessor;
            return dateAccessor();
        }
        return undefined;
    }

    public validate(
        target: any,
        scope: ValidationScopes = ValidationScopes.State
    ): ValidationState {
        const validation = new ValidationHandler();
        if (isAssigned(target)) {
            if (asDate(target)) {
                validation.writeError('_badtype', undefined);
                const dtValue = target as Date;
                if (this.pattern === DatePattern.DATE && dtValue !== Tdate.AS_DATE(dtValue)) {
                    validation.writeError('_badtype', { typedef: 'Date', subtypedef: 'no time' });
                }
                if (this.minimum && dtValue < this.minimum) {
                    validation.writeError('dateMinimum', {
                        minimum: this.minimum,
                        actualValue: dtValue
                    });
                } else if (this.minexclusive && dtValue <= this.minexclusive) {
                    validation.writeError('dateMinExclusive', {
                        minexclusive: this.minexclusive,
                        actualValue: dtValue
                    });
                }
                if (this.maximum && dtValue > this.maximum) {
                    validation.writeError('dateMaximum', {
                        maximum: this.maximum,
                        actualValue: dtValue
                    });
                } else if (this.maxexclusive && dtValue >= this.maxexclusive) {
                    validation.writeError('dateMaxExclusive', {
                        maxExclusive: this.maxexclusive,
                        actualValue: dtValue
                    });
                }
            } else {
                validation.writeError('_badtype', { typedef: 'Date' });
            }
        }
        return validation;
    }

    // #endregion Public Methods

    // #region Private Methods

    /**
     * Apply on the current schema not null options.
     * @param options    Number's schema options to set on the current number schema.
     */
    private _assign(options: Partial<DateDef>) {
        this.pattern = options.pattern || this.pattern || '';
        if (isAssigned(options.default)) {
            this.defaultDef = options.default;
        }
        if (isAssigned(options.minimum)) {
            this.minimum = options.minimum;
        }
        this.minimum = options.minimum || this.minimum;
        this.maximum = options.maximum || this.maximum;
        this.minexclusive = options.minexclusive || this.minexclusive;
        this.maxexclusive = options.maxexclusive || this.maxexclusive;
    }

    /**
     * Create a new Schema instance that takes the current options as defaultDef
     * and overrides the current definition with the ones past as parameter.
     * @param options    date's schema options to set on the current date schema.
     * @returns          New Schema instance with the current options plus the ones pass as parameter
     */
    public extendAs(title: string, options: Partial<DateDef>): Tdate {
        const myOption: DateDef = {
            type: 'date',
            title: title,
            pattern: this.pattern,
            default: this.defaultDef,
            minimum: this.minimum,
            maximum: this.maximum,
            minexclusive: this.minexclusive,
            maxexclusive: this.maxexclusive
        };
        const instance = new Tdate(myOption);
        instance._assign(options);
        return instance;
    }

    // #endregion Private Methods
}
