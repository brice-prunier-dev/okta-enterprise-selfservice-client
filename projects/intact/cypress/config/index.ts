declare namespace Cypress {
    type CleanPayload = Array<{
        id: string,
        apps: Array<{
            id: string,
            groups: [],
            scopes: string[]
        }>,
        groups: string[],
        scopes: string[]
    }>
    interface Chainable {
        /**
         * Custom command to select DOM element by data-cy attribute.
         * @example cy.dataCy('greeting')
         */
        oktaLogin(): Chainable<any>;
        loginByOktaApi(): Chainable<Response<any>>;
        cleanE2e(payload: CleanPayload): Chainable<Response<any>>;
        deleteGroup(groupName: string): Chainable<Element>;
        deleteApplication(appName: string): Chainable<Element>;
        deleteProject(projectName: string): Chainable<Element>;
        deleteScope(projectName: string, scopeName: string): Chainable<Element>;
        clearCache(): Chainable<Element>;
        clearStorage(): Chainable<Element>;
        displayUserProjects(): Chainable<Element>;
        displayProjectHome(projectName: string): Chainable<Element>;
        createProject(projectName: string): Chainable<Element>;
        createApplication(projectName: string, type: ApplicationType, appName: string): Chainable<Element>;
        createScope(projectName: string, scopeSuffix: string): Chainable<Element>;
        subscribeToScope(projectName: string, appName: string, scopeName: string, scopeType?:string): Chainable<Element>;
        subscribeToScopeForGroup(projectName: string, appName: string, scopeName: string, groupName:string): Chainable<Element>;
        unsubscribeToScopeForGroup(projectName: string, appName: string, scopeName: string, groupName:string): Chainable<Element>;
        createGroup(projectName: string, groupName: string): Chainable<Element>;
        unsubscribeToScope(projectName: string, scopeName: string): Chainable<Element>;
        subscribeGroupToApp(projectName: string, groupName: string, appName: string): Chainable<Element>;
        unsubscribeGroupToApp(projectName: string, groupName: string, appName: string): Chainable<Element>;
        addUserToGroup(projectName: string,groupName: string, userName:string): Chainable<Element>;
    }
    type ApplicationType = 'SPA' | 'Swagger' | 'Service'
}

