import { IViewElement, ObjectDef, Objview, Tobject } from 'joe-fx';
import { t } from 'joe-types';

/**
 * {
 *   #private, #public
 * }
 */
export interface SubscribersInfoByEnvData {
    private: number;
    public: number;
}

/**
 * {
 *   #private, #public,
 * }
 */
export const SubscribersInfoByEnvDef: ObjectDef<SubscribersInfoByEnvData> = {
    type: 'object',
    title: 'SubscribersInfoByEnv',
    properties: {
        private: t.number.uint_0,
        public: t.number.uint_0
    },
    required: ['private', 'public']
};

/**
 * {
 *   #private, #public,
 * }
 */
export const SubscribersInfoByEnvType: Tobject<SubscribersInfoByEnvData> =
    t.object.as<SubscribersInfoByEnvData>(SubscribersInfoByEnvDef);

/**
 * {
 *   #private, #public,
 * }
 */
export class SubscribersInfoByEnvView
    extends Objview<SubscribersInfoByEnvData>
    implements SubscribersInfoByEnvData
{
    constructor(entity?: any, parent?: IViewElement) {
        super(SubscribersInfoByEnvType, entity, parent);
    }
    declare private: number;
    declare public: number;
    get count() {
        return this.private + this.public;
    }
}

SubscribersInfoByEnvType.viewctor = SubscribersInfoByEnvView;

// ────────────────────────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────────────────────

/**
 * {
 *   beta{}, prod{}
 * }
 */
export interface SubscribersInfoData {
    beta: SubscribersInfoByEnvData;
    prod: SubscribersInfoByEnvData;
}

/**
 * {
 *   #private, #public,
 * }
 */
export const SubscribersInfoDef: ObjectDef<SubscribersInfoData> = {
    type: 'object',
    title: 'SubscribersInfo',
    properties: {
        beta: SubscribersInfoByEnvType,
        prod: SubscribersInfoByEnvType
    },
    required: ['beta', 'prod']
};

/**
 * {
 *   #private, #public,
 * }
 */
export const SubscribersInfoType: Tobject<SubscribersInfoData> =
    t.object.as<SubscribersInfoData>(SubscribersInfoDef);

/**
 * {
 *   #private, #public,
 * }
 */
export class SubscribersInfoView
    extends Objview<SubscribersInfoData>
    implements SubscribersInfoData
{
    constructor(entity?: any, parent?: IViewElement) {
        super(SubscribersInfoType, entity, parent);
    }
    declare beta: SubscribersInfoByEnvView;
    declare prod: SubscribersInfoByEnvView;
    get count() {
        return this.beta.count + this.prod.count;
    }
}

SubscribersInfoType.viewctor = SubscribersInfoView;

// ────────────────────────────────────────────────────────────────────────────────
