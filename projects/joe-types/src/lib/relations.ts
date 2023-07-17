/**
 * dep: dependency -> loading is mandatory on initialization
 * ref: reference -> loading at runtime
 * lkp: lookup ->
 */

export type RelationKind = 'lkp' | 'ref' | 'lnk' | 'att' | 'lnkdep';
export const RelationKindValues = ['lkp', 'ref', 'lnk', 'att', 'lnkdep'];
/**
 * Relation defined an external entity that is not part of the model
 */
export interface RelationDefData {
    rev?: string | undefined;
    href: string | undefined;
    path?: string | undefined;
    title?: string | undefined;
    type?: string | undefined;
}
/**
 * Reference defined an external entity that is cached into the model because they are not suposed to changed
 * Example: Address, typology
 */
export interface CachedRelationDefData<T = object> extends RelationDefData {
    value: T;
}

export interface HrefData {
    store: string | undefined;
    collection: string | undefined;
    id: string;
}
