import {ApiInfoData} from 'intact-models';
import {IdData} from 'joe-models';


/**
 * {
 *   id,
 *   subscribers{},swaggeruis[{}],
 *   info{}, backends[{}] }
 */
export interface AppApisInfoData extends IdData {
    info: ApiInfoData;
    appScopes: string[];
}




