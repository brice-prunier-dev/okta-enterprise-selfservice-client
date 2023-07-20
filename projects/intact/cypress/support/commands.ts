const baseUrl = Cypress.env('base_url');
const oktaUsername = Cypress.env('auth_username');
const oktaPassword = Cypress.env('auth_password');
const baseApiUrl = Cypress.env('base_api_url');
const oktaDomain = Cypress.env('okta_domain');
const spaTypeApplication = 'SPA';
const swaggerTypeApplication = 'Swagger';
const serviceTypeApplication = 'Service';

const parseJwt = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map((c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
    );

    return JSON.parse(jsonPayload);
};

//--- begin Okta login section

Cypress.Commands.add('oktaLogin', () => {
    cy.visit(baseUrl);
    cy.log('WAIT START');
    cy.log('OKTA Login -> ' + baseUrl);
    cy.url().should('contain', oktaDomain)

    cy.get('input[type=text]').type(oktaUsername);
    cy.get('input[type=submit]').click();
    cy.get('input[type=password]').type(oktaPassword);
    cy.get('input[type=submit]').click();

    cy.url().should('contain', baseUrl);
    // Waiting of url is not enought: we get a 401 on the request after that...
    cy.wait(1000);
});

Cypress.Commands.add('loginByOktaApi', () => {
    const username = Cypress.env('auth_username');
    const password = Cypress.env('auth_password');
    const clientId = Cypress.env('okta_client_id');
    const scopes = Cypress.env('okta_scopes');
    const oktaDomain = Cypress.env('okta_domain');
    const oktaIssuerId = Cypress.env('okta_issuer_id');

    return cy
        .request({
            method: 'POST',
            url: `${baseApiUrl}/oauth`,
            body: {
                username,
                password,
                clientId,
                scopes,
                oktaDomain,
                oktaIssuerId,
                redirectUri: baseUrl
            }
        })
        .then(({body}) => {
            const scopes: string[] = body.scope.split(' ');
            const claims = parseJwt(body.id_token);
            console.debug(JSON.stringify(body.access_token, null, 2));
            sessionStorage.setItem('access_token', body.access_token);

            sessionStorage.setItem('id_token', body.id_token);
            sessionStorage.setItem('granted_scopes', JSON.stringify(scopes));
            sessionStorage.setItem('access_token_stored_at', body.stored_at);
            sessionStorage.setItem('id_token_stored_at', body.stored_at);
            sessionStorage.setItem('expires_at', body.expires_at);
            sessionStorage.setItem('id_token_expires_at', body.expires_at);
            sessionStorage.setItem('id_token_claims_obj', JSON.stringify(claims));
        });
});

//--- end Okta login section

//--- begin cleanup section
Cypress.Commands.add('cleanE2e', (e2eCleaningPayload: Cypress.CleanPayload) => {
    const token = sessionStorage.getItem('access_token');
    const options: any = {
        url: `${baseApiUrl}/projectadmin/e2e`,
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`
            // Connection: 'keep-alive',
            // 'Accept-Encoding': 'gzip, deflate'
        },
        body: e2eCleaningPayload,
        failOnStatusCode: true,
        timeout: 100000
    };
    return cy.request(options);
});

Cypress.Commands.add('deleteGroup', (groupName: string) => {
    const token = sessionStorage.getItem('access_token');
    const options: any = {
        url: `${baseApiUrl}/admincommands/group/${groupName}?dryrun=false`,
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`
            // Connection: 'keep-alive',
            // 'Accept-Encoding': 'gzip, deflate'
        },
        failOnStatusCode: false,
        timeout: 100000
    };

    cy.request(options).then((response) => {
        // expect(response.status).to.eq(200)
    });
});

Cypress.Commands.add('deleteApplication', (appName: string) => {
    const token = sessionStorage.getItem('access_token');
    const options: any = {
        url: `${baseApiUrl}/admincommands/app/${appName}?dryrun=false`,
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`
            // Connection: 'keep-alive',
            // 'Accept-Encoding': 'gzip, deflate'
        },
        failOnStatusCode: false,
        timeout: 100000
    };

    cy.request(options).then((response) => {
        // expect(response.status).to.eq(200)
    });
});

Cypress.Commands.add('deleteProject', (projectName: string) => {
    const token = sessionStorage.getItem('access_token');
    const options: any = {
        url: `${baseApiUrl}/projectadmin/${projectName}`,
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`
            // Connection: 'keep-alive',
            // 'Accept-Encoding': 'gzip, deflate'
        },
        failOnStatusCode: false,
        timeout: 100000
    };

    cy.request(options).then((response) => {
        // expect(response.status).to.eq(200)
    });
});

Cypress.Commands.add('deleteScope', (projectName: string, scopeName: string) => {
    const token = sessionStorage.getItem('access_token');
    const options: Partial<Cypress.RequestOptions> = {
        url: `${baseApiUrl}/scopecommands/${projectName}`,
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
            // Connection: 'keep-alive',
            // 'Accept-Encoding': 'gzip, deflate'
        },
        failOnStatusCode: false,
        timeout: 100000,
        body: JSON.stringify([scopeName])
    };

    cy.request(options).then((response) => {
        // expect(response.status).to.eq(200)
    });
});

Cypress.Commands.add('clearCache', () => {
    const token = sessionStorage.getItem('access_token');
    const options: any = {
        url: `${baseApiUrl}/admincommands/clear-cache`,
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            Connection: 'keep-alive',
            'Accept-Encoding': 'gzip, deflate'
        },
        failOnStatusCode: false,
        timeout: 100000
    };

    cy.request(options).then((response) => {
        // expect(response.status).to.eq(200);
    });
});

Cypress.Commands.add('clearStorage', () => {
    sessionStorage.clear();
    cy.clearCookies();

    cy.get('[data-test-id=logout]').should('be.visible').click();
});

//--- end cleanup section

Cypress.Commands.add('displayUserProjects', () => {
    cy.intercept('GET', `${baseApiUrl}/projects/mine/context**`).as('getProjectsRequest');

    cy.visit(baseUrl, {headers: {'Accept-Encoding': 'gzip, deflate'}});

    cy.wait('@getProjectsRequest').its('response.statusCode').should('equal', 200);
});
function projectRootUrl(projectName: string) {
    return `${baseUrl}/projects/${projectName}`;
}
function projectHomeUrl(projectName: string) {
    return `${projectRootUrl(projectName)}/home`;
}

function groupUrl(projectName: string, groupName: string) {
    return `${baseUrl}/projects/${projectName}/groups/${groupName}/details`;
}

Cypress.Commands.add('displayProjectHome', (projectName: string) => {
    const baseActiveUrl = projectRootUrl(projectName);
    cy.url().then((url) => {
        cy.log('test', url, baseActiveUrl);
        if (url.indexOf(baseActiveUrl) < 0) {
            // cy.intercept('GET', `${baseApiUrl}/subscriptions/projects/${projectName}**`).as(
            //     'getProjectSubscriptionsRequest'
            // );
            // cy.intercept('GET', `${baseApiUrl}/subscriptions/projects/groups**`).as(
            //     'getProjectGroupsRequest'
            // );

            cy.visit(baseActiveUrl, {headers: {'Accept-Encoding': 'gzip, deflate'}});

            // cy.wait(['@getProjectSubscriptionsRequest', '@getProjectGroupsRequest'])
            //     .its('response.statusCode')
            //     .should('equal', 200);
        }
    });
});

Cypress.Commands.add('createProject', (projectName: string) => {
    cy.displayUserProjects();

    //--
    cy.title().should('equal', 'My projects');
    cy.get('[data-test-id=title]').contains('My Projects');

    cy.get('[data-test-id=add-new-project-button]').should('be.visible').click();

    // Need to wait so that the modal is finished displaying on headless apparently
    cy.wait(1000);

    cy.get('[data-test-id=project-key]').should('be.visible').type(projectName);

    cy.get('[data-test-id=project-description]')
        .should('be.visible')
        .type(`A great description for ${projectName}`);
    //--

    //-- begin create project request

    cy.intercept('POST', `${baseApiUrl}/projectcommands/create/${projectName}/default`).as(
        'createProjectRequest'
    );

    cy.get('[data-test-id=new-project-save]').should('be.visible').click();

    cy.wait('@createProjectRequest', {timeout: 100000})
        .its('response.statusCode')
        .should('equal', 200);

    //-- end create project request
});

Cypress.Commands.add('createApplication', (projectName: string, type: Cypress.ApplicationType, appName: string) => {
    cy.displayProjectHome(projectName);

    //--
    cy.get('[data-test-id=new-application-button]').should('be.visible').click();

    // const appTypeButton =
    //     type === spaTypeApplication ? 'spa-application-button' : 'service-application-button';
    cy.contains('mat-button-toggle', type).click();
    // cy.get(`[data-test-id=${appTypeButton}]`).should('be.visible').click();

    cy.get('[data-test-id=application-name]').should('be.visible').type(appName);

    if (type === 'SPA' || type === 'Swagger') {
        cy.get('[data-test-id=login-url]').should('be.visible').type(`${baseUrl}/login-url`, {});

        cy.get('[data-test-id=redirect-urls]')
            .should('be.visible')
            .type(`${baseUrl}/redirect-url{enter}`)
            .trigger('input');
    }

    cy.get('[data-test-id=fill-data-next-button]').should('be.visible').click();

    cy.get('[data-test-id=application-description]')
        .should('be.visible')
        .type(`A great description for ${appName}`);

    cy.get('[data-test-id=description-next-button]').should('be.visible').click();
    //--

    //-- begin create application request

    cy.intercept('POST', `${baseApiUrl}/appcommands`).as('createAppRequest');

    if (type === spaTypeApplication) {
        cy.intercept('GET', `${baseApiUrl}/apps/${appName}/apis-info`).as('appsInfo');
    }

    cy.get('[data-test-id=save-new-application-button]').should('be.visible').click();

    cy.wait('@createAppRequest', {timeout: 100000})
        .its('response.statusCode')
        .should('equal', 200);

    if (type === spaTypeApplication) {
        cy.wait('@appsInfo', {timeout: 100000});
        // .its('response.statusCode')
        // .should('equal', 200);
    }

    //-- end create application request

    if (type === spaTypeApplication) {
        cy.get('.main-content > .item-row:nth-of-type(4)').should('be.visible').click();
    }
});

Cypress.Commands.add('createScope', (projectName: string, scopeSuffix: string) => {
    const scopeName = `api.${projectName}.${scopeSuffix}`;

    cy.displayProjectHome(projectName);

    //--
    cy.get('[data-test-id=new-scope-button]').click();

    cy.get('[data-test-id=scope-name]').type(`.${scopeSuffix}`);

    cy.get('[data-test-id=scope-description]').type(`A great description for ${scopeName}`);

    cy.get('[data-test-id=scope-data-next-button]').click();
    //--

    //-- begin create scope request

    cy.intercept('POST', `${baseApiUrl}/scopeCommands/${projectName}`).as('createScopeRequest');

    cy.get('[data-test-id=new-scope-save-button]').should('be.visible').click();

    cy.wait('@createScopeRequest', {timeout: 100000})
        .its('response.statusCode')
        .should('equal', 200);

    // Wait for redirection to happen so that we don't have it happen after
    cy.url().should('equal', projectHomeUrl(projectName))
    //-- end create scope request
});

Cypress.Commands.add('subscribeToScope', (projectName: string, appName: string, scopeName: string, scopeType?: string) => {
    cy.displayProjectHome(projectName);

    //--
    cy.get('[data-test-id=applications-title]').should('be.visible').click();
    cy.get('[data-test-id=applications-title]').contains('mat-list-item', appName).click();

    cy.get('[data-test-id=app-apis-tab]').should('be.visible').click();

    if (scopeType !== undefined) {
        cy.contains('.mdc-tab', scopeType).should('be.visible').click();
    }

    cy.get('[data-test-id=app-manage-scopes-button]:nth-of-type(1)')
        .should('be.visible')
        .click();

    cy.get('[data-test-id=new-scope-name]')
        .should('be.visible')
        .type(`${scopeName}{enter}`)
        .trigger('input');
    //--

    //-- begin subscribe to scope request

    cy.intercept('POST', `${baseApiUrl}/appcommands/subscribe`).as('subscribeToScopeRequest');

    cy.get('[data-test-id=save-new-scope]').should('be.visible').click();

    cy.get('iam-confirm-dialog .mdc-button:nth-of-type(2)').should('be.visible').click();

    cy.wait('@subscribeToScopeRequest', {timeout: 100000})
        .its('response.statusCode')
        .should('equal', 200);

    //-- end subscribe to scope request
});

Cypress.Commands.add('subscribeToScopeForGroup', (projectName: string, appName: string, scopeName: string, groupName: string) => {
    cy.displayProjectHome(projectName);

    //--
    cy.get('[data-test-id=applications-title]').should('be.visible').click();
    cy.get('[data-test-id=applications-title]').contains('mat-list-item', appName).click();

    cy.get('[data-test-id=app-apis-tab]').should('be.visible').click();

    cy.contains('.mdc-tab', 'Groups scopes').should('be.visible').click();

    cy.contains('mat-card', slugToName(groupName)).contains('button', 'Manage Scopes').click();

    cy.get('[data-test-id=new-scope-name]')
        .should('be.visible')
        .type(`${scopeName}{enter}`)
        .trigger('input');
    //--

    //-- begin subscribe to scope request

    cy.intercept('POST', `${baseApiUrl}/appcommands/subscribe`).as('subscribeToScopeRequest');

    cy.get('[data-test-id=save-new-scope]').should('be.visible').click();

    cy.get('iam-confirm-dialog .mdc-button:nth-of-type(2)').should('be.visible').click();

    cy.wait('@subscribeToScopeRequest', {timeout: 100000})
        .its('response.statusCode')
        .should('equal', 200);

    //-- end subscribe to scope request
});


Cypress.Commands.add('unsubscribeToScopeForGroup', (projectName: string, scopeName: string, groupName: string) => {
    cy.displayProjectHome(projectName);

    //--
    cy.get('[data-test-id=scopes-title]').should('be.visible').click();

    cy.get('[data-test-id=scopes-title] mat-list-item:nth-of-type(1)').should('be.visible').click();

    cy.get('[data-test-id=subscription-row]:nth-of-type(1)').should('be.visible').click();

    cy.get('[data-test-id=subscription-row]:nth-of-type(1) .cancel-scope-subscription')
        .should('be.visible')
        .click();

    cy.get('mat-dialog-content input')
        .should('be.visible')
        .type(`The scope ${scopeName} should be unsubscribed !!!`);
    //--

    //-- begin unsubscribe to scope request

    cy.intercept('POST', `${baseApiUrl}/subscriptioncommands/cancel`).as(
        'unsubscribeToScopeRequest'
    );

    cy.get('mat-dialog-actions button:nth-of-type(2)').should('be.visible').click();

    cy.wait('@unsubscribeToScopeRequest', {timeout: 100000})
        .its('response.statusCode')
        .should('equal', 200);

    //-- end unsubscribe to scope request
});
Cypress.Commands.add('unsubscribeToScope', (projectName: string, scopeName: string) => {
    cy.displayProjectHome(projectName);

    //--
    cy.get('[data-test-id=scopes-title]').should('be.visible').click();

    cy.get('[data-test-id=scopes-title] mat-list-item:nth-of-type(1)').should('be.visible').click();

    cy.get('[data-test-id=subscription-row]:nth-of-type(1)').should('be.visible').click();

    cy.get('[data-test-id=subscription-row]:nth-of-type(1) .cancel-scope-subscription')
        .should('be.visible')
        .click();

    cy.get('mat-dialog-content input')
        .should('be.visible')
        .type(`The scope ${scopeName} should be unsubscribed !!!`);
    //--

    //-- begin unsubscribe to scope request

    cy.intercept('POST', `${baseApiUrl}/subscriptioncommands/cancel`).as(
        'unsubscribeToScopeRequest'
    );

    cy.get('mat-dialog-actions button:nth-of-type(2)').should('be.visible').click();

    cy.wait('@unsubscribeToScopeRequest', {timeout: 100000})
        .its('response.statusCode')
        .should('equal', 200);

    //-- end unsubscribe to scope request
});
Cypress.Commands.add('createGroup', (projectName: string, groupName: string) => {
    cy.displayProjectHome(projectName);
    cy.get('[data-test-id=new-group-button]').should('be.visible').click();
    cy.get('[data-test-id=group-name]').should('be.visible').type(groupName);

    cy.get('[data-test-id=group-description]')
        .should('be.visible')
        .type(`A great description for ${groupName}`);

    cy.contains('button', 'Next').should('be.visible').click();
    cy.contains('mat-list-option', `${projectName}-admin`).click();
    cy.contains('button', 'Save').should('be.visible').click();
    cy.url().should('equal', groupUrl(projectName, groupName));
});
Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false;
});
Cypress.Commands.add(
    'subscribeGroupToApp',
    (projectName: string, groupName: string, appName: string) => {
        cy.displayProjectHome(projectName);
        cy.get('[data-test-id=applications-title]').click();

        cy.get('[data-test-id=applications-title]')
            .contains('mat-list-item', appName)
            .click();
        cy.get('[data-test-id=app-groups-tab]').click();

        cy.intercept('POST', `${baseApiUrl}/groupcommands/link**`).as('linkGroup');

        cy.contains('iam-appgroup-link .item-row', groupName)
            .find('mat-slide-toggle')
            .then(c => {
                if (!c.hasClass('mat-mdc-slide-toggle-checked')) {
                    c.click();
                }
            })
            .click();

        cy.wait('@linkGroup');
    }
);

Cypress.Commands.add(
    'unsubscribeGroupToApp',
    (projectName: string, groupName: string, appName: string) => {
        cy.displayProjectHome(projectName);
        cy.get('[data-test-id=applications-title]').click();
        cy.get('[data-test-id=applications-title]').contains('mat-list-item', appName).click();
        cy.get('[data-test-id=app-groups-tab]').click();

        cy.intercept('POST', `${baseApiUrl}/groupcommands/unlink**`).as('unlinkGroup');

        cy.contains('iam-appgroup-link .item-row', groupName)
            .find('mat-slide-toggle')
            .then(c => {
                if (c.hasClass('mat-mdc-slide-toggle-checked')) {
                    c.click();
                }
            })
            .click();

        // Only click if present
        cy.get('body').then(b => {
            b.find('iam-confirm-dialog button:contains(Yes)').click()
        });
        cy.wait('@unlinkGroup');
    }
);


Cypress.Commands.add(
    'addUserToGroup',
    (projectName: string, groupName: string, userName: string) => {
        cy.displayProjectHome(projectName);
        cy.contains('mat-expansion-panel', 'Groups').click()
        cy.contains('mat-expansion-panel', 'Groups')
            .contains('mat-list-item', groupName)
            .should('be.visible')
            .click();
        cy.get('iam-member-actions input').focus().type(userName);
        cy.contains('mat-option', userName).click();
        cy.intercept(`${baseApiUrl}/projectcommands/membership`).as('addUserToGroup');
        cy.contains('iam-user-editor-dialog mat-list-option', groupName).scrollIntoView().find('input[type=checkbox]').check({force: true});
        cy.contains('iam-user-editor-dialog button', 'Save').click();
        cy.wait('@addUserToGroup');
    }
);


function slugToName(text:string) {
    return text.replace(/(^\w|-\w)/g, clearAndUpper);
}

function clearAndUpper(text:string) {
    return text.replace(/-/, " ").toUpperCase();
}
