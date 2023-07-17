import { JsonScalar, JsonObj } from 'joe-fx';

export const queryNew: JsonObj = { id: 'new' };
export const queryList: JsonObj = { id: '*' };
export const queryAny: JsonObj = { _: '*' };
export const queryCurrent: JsonObj = { id: '_' };
export function queryOnType(type: string): JsonObj {
    return { type };
}
export function queryById(id: JsonScalar): JsonObj {
    return { id };
}
export function readQueryId<T extends JsonScalar>(query: JsonObj): T {
    return query.id! as T;
}
