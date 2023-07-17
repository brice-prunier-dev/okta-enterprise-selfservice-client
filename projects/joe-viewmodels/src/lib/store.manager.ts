// tslint:disable-next-line:max-line-length
import { IViewElement } from 'joe-fx';
import { IStore } from 'joe-types';

export class StoreManager {
    public static INSTANCE: StoreManager;
    private _stores: { [name: string]: IStore };

    constructor() {
        this._stores = {};
    }

    public get hasStore(): boolean {
        const storeNames = Object.keys(this._stores);
        return storeNames && storeNames.length > 0;
    }

    public registerStore(store: IStore, alias: string) {
        const storeRef = this._stores[alias];
        if (!storeRef) {
            this._stores[alias] = store;
        }
    }

    public store<T extends IStore>(alias: string): T {
        return this._stores[alias] as T;
    }
}

export function initStoreManager(): void {
    if (StoreManager.INSTANCE === undefined) {
        StoreManager.INSTANCE = new StoreManager();
    }
}

initStoreManager();
