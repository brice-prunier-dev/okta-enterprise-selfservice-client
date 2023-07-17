// ────────────────────────────────────────────────────────────────────────────────
import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
// ────────────────────────────────────────────────────────────────────────────────

import { JoeLogger } from 'joe-fx';
import { initViewModelManager, initStoreManager } from 'joe-viewmodels';

function throwIfAlreadyLoaded(parentModule: any, moduleName: string) {
    if (parentModule) {
        const msg = `${moduleName} has already been loaded. Import Core modules in the AppModule only.`;
        throw new Error(msg);
    }
}

// ────────────────────────────────────────────────────────────────────────────────
// tslint:disable-next-line: ban-types
export function jsonpCallbackContext(): Object {
    if (typeof window === 'object') {
        return window;
    }
    return {};
}
@NgModule({
    imports: [CommonModule, HttpClientModule, FormsModule]
})
export class CoreModule {
    constructor(
        @Optional()
        @SkipSelf()
        parentModule: CoreModule
    ) {
        JoeLogger.action('MODULE', 'CoreModule');
        throwIfAlreadyLoaded(parentModule, 'CoreModule');
        initViewModelManager();
        initStoreManager();
    }
}
