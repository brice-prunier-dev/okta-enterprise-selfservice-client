/// <reference types='cypress' />

describe('adding a new project, a new SPA app, a new scope, subscribe and unsubscribe to the scope', () => {
    const baseUrl = Cypress.env('base_url');
    const projectName = 'project-e2e';
    const groupName = 'project-e2e-admin';
    const appName = 'spa-application-e2e';
    const scopeName = `api.project-e2e.scope-e2e`;
    const scopeSuffix = 'scope-e2e';
    
    beforeEach(() => {
        cy.oktaLogin();
        cy.wait(1000);
        cy.cleanE2e([{
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
        }]);
        cy.wait(1000);
        // cy.deleteProject(projectName);
        // cy.clearCache();

        // cy.loginByOktaApi();
    });

    afterEach(() => {
        // cy.deleteScope(projectName, scopeName);

        // cy.deleteGroup(groupName);

        // cy.deleteProject(projectName);

        // cy.deleteApplication(appName);

        cy.clearCache();

        cy.visit(baseUrl);
    });

    it('adding a new project, a new SPA app, a new scope, subscribe and unsubscribe to the scope', () => {
        cy.createProject(projectName);

        cy.createApplication(projectName, 'spa', appName);

        cy.createScope(projectName, scopeSuffix);

        cy.subscribeToScope(projectName, scopeName);

        cy.unsubscribeToScope(projectName, scopeName);
    });
});
