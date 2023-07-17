import { OitemData, OitemDef } from 'joe-models';
import { t } from 'joe-types';
import { ObjectDef, Tobject, Objview, IViewElement, isBlank } from 'joe-fx';
import { SwaggerLinkData } from './swagger-lnk.model';

export interface SwaggerRefData extends OitemData {}

/**
 * {
 *   oid, label,
 * }
 */
export const SwaggerRefDef: ObjectDef<SwaggerRefData> = {
    type: 'object',
    title: 'SwaggerRef',
    extends: [OitemDef],
    properties: t.none,
    required: [...OitemDef.required]
};

/**
 * {
 *   oid, label,
 * }
 */
export const SwaggerRefType: Tobject<SwaggerRefData> = t.object.as<SwaggerRefData>(SwaggerRefDef);

/**
 * {
 *   oid, label,
 * }
 */
export class SwaggerRefView extends Objview<SwaggerRefData> implements SwaggerRefData {
    constructor(entity?: any, parent?: IViewElement) {
        super(SwaggerRefType, entity, parent);
    }
    #link: SwaggerLinkData | undefined;
    declare oid: string;
    declare label: string;
    get ref(): SwaggerLinkData | undefined {
        return this.#link;
    }
    set ref(value: SwaggerLinkData | undefined) {
        if (this.#link !== value) {
            if (value === undefined) {
                this.#link = undefined;
                this.oid = '?';
                this.label = '?';
            } else {
                this.#link = value;
                this.oid = value.oid;
                this.label = value.label;
            }
        }
    }
    initref(values: SwaggerLinkData[]): boolean {
        if (this.oid) {
            this.#link = values.find((v) => v.oid === this.oid)!;
        }
        return !!this.#link;
    }
}

SwaggerRefType.viewctor = SwaggerRefView;
