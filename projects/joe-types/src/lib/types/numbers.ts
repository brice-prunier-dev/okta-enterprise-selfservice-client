import {NumberPattern, NumberDef} from 'joe-fx';

export const DOUBLE_0: NumberDef = {
    type: 'number',
    title: 'DOUBLE_0',
    pattern: NumberPattern.DOUBLE,
    default: 0.0,
    minimum: Number.MIN_VALUE,
    maximum: Number.MAX_VALUE,
};

export const DOUBLE: NumberDef = {
    type: 'number',
    title: 'DOUBLE',
    pattern: NumberPattern.DOUBLE,
    minimum: Number.MIN_VALUE,
    maximum: Number.MAX_VALUE,
};

export const INT_0: NumberDef = {
    type: 'number',
    title: 'INT_0',
    pattern: NumberPattern.INT,
    default: 0,
    minimum: Number.MIN_SAFE_INTEGER,
    maximum: Number.MAX_SAFE_INTEGER,
};

export const INT: NumberDef = {
    type: 'number',
    title: 'INT',
    pattern: NumberPattern.INT,
    default: 0,
    minimum: Number.MIN_SAFE_INTEGER,
    maximum: Number.MAX_SAFE_INTEGER,
};

export const UDOUBLE_0: NumberDef = {
    type: 'number',
    title: 'UDOUBLE_0',
    pattern: NumberPattern.DOUBLE,
    default: 0.0,
    minimum: 0.0,
    maximum: Number.MAX_VALUE,
};

export const UDOUBLE: NumberDef = {
    type: 'number',
    title: 'UDOUBLE',
    pattern: NumberPattern.DOUBLE,
    minimum: 0.0,
    maximum: Number.MAX_VALUE,
};

export const UINT_0: NumberDef = {
    type: 'number',
    title: 'UINT_0',
    pattern: NumberPattern.INT,
    default: 0,
    minimum: Number.MIN_SAFE_INTEGER,
    maximum: Number.MAX_SAFE_INTEGER,
};

export const UINT_STRICT_POSITIVE: NumberDef = {
    type: 'number',
    title: 'UINT_STRICT_POSITIVE',
    pattern: NumberPattern.INT,
    minimum: 1,
    maximum: Number.MAX_SAFE_INTEGER,
};

export const UINT: NumberDef = {
    type: 'number',
    title: 'UINT',
    pattern: NumberPattern.INT,
    minimum: Number.MIN_SAFE_INTEGER,
    maximum: Number.MAX_SAFE_INTEGER,
};

