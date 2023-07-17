// ────────────────────────────────────────────────────────────────────────────────
// tslint:disable-next-line:max-line-length
import { writePath, MetadataHelper, readPath, JsonObj } from 'joe-fx';
import type { RelationDefData, HrefData, IStore } from 'joe-types';
// ─_───────────────────────────────────────────────────────────────────────────────

// ─_───────────────────────────────────────────────────────────────────────────────

export abstract class IamApiStore<T> implements IStore {
    public readonly = false;

    public readDocId(doc: any): string {
        return readPath(doc, this.idname);
    }

    public readDocRevision(doc: any): string {
        return readPath(doc, this.revname);
    }

    public syncDocIdentity(source: any, doc: any): void {
        writePath(doc, this.idname, this.readDocId(source));
        writePath(doc, this.revname, this.readDocRevision(source));
    }

    constructor(public idname: string, public revname: string) {}

   

}

// ────────────────────────────────────────────────────────────────────────────────
