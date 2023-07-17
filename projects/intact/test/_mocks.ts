import {
    loadAppDetail_inctact_client,
    loadAppData_inctact_client,
    loadAppApiInfos_inctact_client
} from './_factories';

const appApiInfos = loadAppApiInfos_inctact_client();
const appDef = loadAppDetail_inctact_client();
const appData = loadAppData_inctact_client();

// TODO Lots of stuff looks like it doesnt do anything
export const ChangeDetectorRefMock = {
    markForCheck: jest.fn()
};

export const AppApisServiceMock = class {
    getAllScopeAsync = jest.fn().mockReturnValue(Promise.resolve(appApiInfos));
    subscribeAsync = jest.fn().mockReturnValue(Promise.resolve({
        ok: true,
        data: undefined
    }));
};

export const ConfirmServiceMock = class {
    confirm = jest.fn();
};

export const appServiceMock = {
    isAppAdmin: true,
    isIntactAdmin: true,
    selectedApp: appDef,
    selectedAppName: appDef.client_name,
    myAdminApps: () => [appData],
    checkAdmin: () => {
        appServiceMock.isAppAdmin = true;
        appServiceMock.isIntactAdmin = true;
    }
};

export const DialogClassMock = class {
    updateSize = jest.fn();
    close = jest.fn();
};
