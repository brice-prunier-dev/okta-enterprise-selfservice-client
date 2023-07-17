import { asFunction, removeAll } from './types-helper';
import { IRuntimeMessage, StringMap } from './types';
import { isArrayAssigned } from './types-tester';
import { MessageDomain } from './constants';
import { MessageTypology } from './enums';
import { IRuntimeSummary } from '.';

const translationRepository: { [x: string]: any } = {};

export type TranslatorFn = (args: StringMap) => string;

export class RuntimeMessage implements IRuntimeMessage {
    public static Register(name: string, translator: TranslatorFn) {
        translationRepository[name] = translator;
    }
    public static Translator(name: string): TranslatorFn | undefined {
        return translationRepository[name];
    }
    public static ErrorText(name: string, args: StringMap): string {
        const translator = translationRepository[name];
        let msg = '';
        if (asFunction(translator)) {
            msg = translator(args);
        } else {
            const argTxt = JSON.stringify(args, null, 2);
            msg = `Missing register message: ${name} with ${argTxt}`;
        }
        return msg;
    }
    public static AsText(args: StringMap): string {
        const keys = Object.keys(args);
        let msg = '';
        let sep = '';
        if (isArrayAssigned(keys)) {
            keys.forEach((errortype) => {
                msg += sep + RuntimeMessage.ErrorText(errortype, args[errortype]);
                sep = ', ';
            });
        }
        return msg;
    }

    constructor(
        public readonly msg: string,
        public readonly domain: string,
        public readonly source: string[],
        public readonly scope: MessageTypology = MessageTypology.Debug,
        public readonly def: any
    ) {}

    public get path(): string {
        return this.source.length > 0 ? this.source[0] : '';
    }
    public get property(): string | null {
        return this.source.length > 1 ? this.source[1] : null;
    }
    public isPathRelated(path: string): boolean {
        return this.source.indexOf(path) > -1;
    }
}

export class RuntimeSummary implements IRuntimeSummary {
    private _hasError = false;
    private _messages: IRuntimeMessage[];

    constructor() {
        this._messages = [];
    }

    public get messages(): IRuntimeMessage[] {
        return this._messages;
    }

    public get isValid(): boolean {
        return !this._hasError;
    }

    public get hasMessages(): boolean {
        return this._messages.length > 0;
    }

    public clearAll(): IRuntimeSummary {
        removeAll(this._messages, this._messages);
        this._hasError = false;
        return this;
    }

    public clearPath(path: string): IRuntimeSummary {
        const predicate = (item: IRuntimeMessage) => item.isPathRelated(path);
        removeAll(this._messages, this._messages.filter(predicate));
        return this;
    }

    public clearPathProperty(
        path: string,
        property: string,
        domain: string = MessageDomain.ALL
    ): RuntimeSummary {
        const forAll = domain === MessageDomain.ALL;
        const predicate = (item: IRuntimeMessage) => {
            return (
                item.isPathRelated(path) &&
                item.property === property &&
                (forAll || item.domain === domain)
            );
        };
        removeAll(this._messages, this._messages.filter(predicate));
        this._hasError =
            this._messages.findIndex((msg) => msg.scope === MessageTypology.Error) > -1;
        return this;
    }

    public clearPathTypology(
        path: string,
        domain: string,
        strictEval: boolean = true
    ): RuntimeSummary {
        const predicate = (item: IRuntimeMessage) => {
            return (
                item.isPathRelated(path) &&
                ((strictEval && item.domain === domain) ||
                    (!strictEval && item.domain.startsWith(domain)))
            );
        };
        removeAll(this._messages, this._messages.filter(predicate));
        return this;
    }

    public push(msg: RuntimeMessage): RuntimeSummary {
        this._messages.push(msg);
        this._hasError = this._hasError || msg.scope === MessageTypology.Error;
        return this;
    }

    public hasError(path: string): boolean {
        return this._hasError
            ? this._messages.findIndex(
                  (msg) => msg.path === path && msg.scope === MessageTypology.Error
              ) > -1
            : true;
    }
}

export interface ValidationContext {
    summary: RuntimeSummary;
    source: string[];
}

RuntimeMessage.Register('_required', () => {
    return `Required!`;
});

RuntimeMessage.Register('_badtype', (args) => {
    const typedef = args.typedef;
    const subtypedef = args.subtypedef;
    return subtypedef === undefined
        ? `Should be a ${typedef} !`
        : `Should be a ${typedef} ${subtypedef}!`;
});
