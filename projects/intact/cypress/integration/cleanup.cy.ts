/// <reference types='cypress' />

describe('adding a new project, a new service app, a new scope, subscribe and unsubscribe to the scope', () => {
    const baseUrl = Cypress.env('base_url');
    const baseApiUrl = Cypress.env('base_api_url');
    const projectName = 'project-e2e';
    const groupName = 'project-e2e-admin';
    const appName = 'service-application-e2e';
    const scopeName = `api.${projectName}.scope-e2e`;
    const e2eCleaningPayload: Cypress.CleanPayload = [{
        id: projectName,
        apps: [{
            id: appName,
            groups: [],
            scopes: [scopeName]
        }],
        groups: [
            groupName
        ],
        scopes: [scopeName]
    }];

    beforeEach(() => {
        cy.cleanE2e(e2eCleaningPayload);
        cy.oktaLogin();
        // cy.loginByOktaApi();
    });

    it('cleanup', () => {
        //-- begin display user projects request

        cy.intercept('GET', `${baseApiUrl}/projects/mine/context**`).as('getProjectsRequest');

        cy.visit(baseUrl, { headers: { 'Accept-Encoding': 'gzip, deflate' } });

        cy.wait('@getProjectsRequest').its('response.statusCode').should('equal', 200);

        //-- end display user projects request

        //---
        // cy.deleteScope(projectName, scopeName);

        // cy.deleteApplication(appName);

        // cy.deleteGroup(groupName);

        // cy.deleteProject(projectName);

        cy.clearCache();

        //--
    });
});
