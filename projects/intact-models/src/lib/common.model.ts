import { isBlank, Tstring } from 'joe-fx';
import { OitemData } from 'joe-models';

export const GEM_ENVS_NONE = 'none';
export const GEM_ENVS_BETA = 'bta';
export const GEM_ENVS_PROD = 'prd';

export const GEM_ENVS_KEYS = [GEM_ENVS_NONE, GEM_ENVS_BETA, GEM_ENVS_PROD];

export const S_GEM_ENVS = new Tstring({
    type: 'string',
    title: 'S_GEM_ENVS',
    minlength: 3,
    maxlength: 4,
    enum: GEM_ENVS_KEYS,
    default: GEM_ENVS_BETA
});

export interface ApiRefData extends OitemData {
    env: string;
    apiId: string;
}

