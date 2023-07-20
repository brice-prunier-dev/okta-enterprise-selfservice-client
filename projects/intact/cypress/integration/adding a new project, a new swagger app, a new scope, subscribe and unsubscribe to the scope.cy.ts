/// <reference types='cypress' />

describe('adding a new project, a new SPA app, a new scope, subscribe and unsubscribe to the scope', () => {
    const baseUrl = Cypress.env('base_url');
    const projectName = 'project-e2e';
    const adminGroupName = 'project-e2e-admin';
    const groupName = 'project-e2e-group';
    const appName = 'spa-application-e2e';
    const scopeName = `api.project-e2e.scope-e2e`;
    const scopeSuffix = 'scope-e2e';
    const username = Cypress.env('auth_username');

    beforeEach(() => {
        cy.oktaLogin();
        cy.cleanE2e([
            {
                id: projectName,
                apps: [
                    {
                        id: appName,
                        groups: [],
                        scopes: [scopeName]
                    }
                ],
                groups: [adminGroupName, groupName],
                scopes: [scopeName]
            }
        ]);
        // cy.deleteProject(projectName);
        // cy.clearCache();

        // cy.loginByOktaApi();
    });

    afterEach(() => {
        // cy.deleteScope(projectName, scopeName);

        // cy.deleteGroup(adminGroupName);

        // cy.deleteProject(projectName);

        // cy.deleteApplication(appName);

        cy.clearCache();

        cy.visit(baseUrl);
    });

    it('adding a new project, a new SPA app, a new scope, subscribe and unsubscribe to the scope', () => {
        cy.createProject(projectName);

        cy.createApplication(projectName, 'Swagger', appName);

        cy.createScope(projectName, scopeSuffix);
        cy.subscribeToScope(projectName, appName, scopeName, 'Client scopes');
        cy.createGroup(projectName, groupName);
        cy.addUserToGroup(projectName, groupName, username);
        cy.subscribeGroupToApp(projectName, groupName, appName);
        cy.subscribeToScopeForGroup(projectName, appName, scopeName, groupName);

        cy.unsubscribeToScope(projectName, scopeName);
        cy.unsubscribeGroupToApp(projectName, groupName, appName);
    });
});
