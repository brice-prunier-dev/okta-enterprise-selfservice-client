import {isBlank, IViewElement, Tstring} from 'joe-fx';

export const GEM_ENVS_NONE = 'none';
export const GEM_ENVS_BETA = 'bta';
export const GEM_ENVS_PROD = 'prd';

export const GEM_ENVS_KEYS = [
    GEM_ENVS_NONE,
    GEM_ENVS_BETA,
    GEM_ENVS_PROD
];



export const S_GEM_ENVS = new Tstring({
    type: 'string',
    title: 'S_GEM_ENVS',
    minlength: 3,
    maxlength: 4,
    enum: GEM_ENVS_KEYS,
    default: GEM_ENVS_BETA
});

export enum APIITEM_TYPE {
    api = 'api',
    swagger = 'swg',
    backend = 'bck',
    frontend = 'frt',
    transformation = 'trf',
    enhancement = 'enh'
}


export function trimStart(text: string, toRemove: string) {
    let trimValue = text;

    while (!isBlank(trimValue) && trimValue.startsWith(toRemove)) {
        trimValue = trimValue.substring(toRemove.length);
    }
    return trimValue;
}
