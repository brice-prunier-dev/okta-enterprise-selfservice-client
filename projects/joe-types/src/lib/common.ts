import { OType, JsonObj } from 'joe-fx';
import { RelationDefData, HrefData } from './relations';

export type DocOriginInfos = [string, string];

export interface IStore<T = any> {
    readDocId(doc: T): string;
    readDocRevision(doc: T): string;
    syncDocIdentity(source: T, target: T): void;
}
