import { loadAppDetail_inctact_client } from './_factories';
import { DefaultAppDocView, DefaultAppDocType } from 'intact-models';
import { JoeLogger } from 'joe-fx';



describe('New Application Validation', () => {
    let appView: DefaultAppDocView;

    beforeEach(() => {
        JoeLogger.isProd = true;
        appView = new DefaultAppDocView({});
    });

    it('Intact-Client app shoud be valid', () => {
        const intactClientData = loadAppDetail_inctact_client();
        DefaultAppDocType.prepare(intactClientData);
        appView = new DefaultAppDocView(intactClientData);
        appView.validate();
        expect(appView.$validation.withError()).toBeFalsy();
    });

    it('Application as Intact-Client shoud be valid', () => {
        const intactClientData = loadAppDetail_inctact_client();
        appView.application_type = intactClientData.application_type;
        appView.client_id = intactClientData.client_id;
        appView.client_name = intactClientData.client_name;
        appView.client_uri = intactClientData.client_uri;
        appView.grant_type = intactClientData.grant_type;
        appView.initiate_login_uri = intactClientData.initiate_login_uri;
        for (const rt of intactClientData.response_types) {
            appView.response_types.add(rt);
        }
        for (const uri of intactClientData.redirect_uris!) {
            appView.redirect_uris.add(uri);
        }
        for (const uri of intactClientData.logout_uris!) {
            appView.logout_uris.add(uri);
        }

        appView.validate();
        expect(appView.$validation.withError()).toBeFalsy();
    });
});
