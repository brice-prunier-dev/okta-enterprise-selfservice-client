import { defineConfig } from 'cypress'
import plugin from 'projects/intact/cypress/plugins/index';
export default defineConfig({
  chromeWebSecurity: false,

  videosFolder: 'projects/intact/cypress/videos',
  screenshotsFolder: 'projects/intact/cypress/screenshots',
  fixturesFolder: 'projects/intact/cypress/fixtures',
  defaultCommandTimeout: 20000,
  viewportWidth: 1400,
  viewportHeight: 800,
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'projects/intact/cypress/results/output-[hash].xml',
    toConsole: true,
  },
  env: {
    auth_username: 'intact.e2e@gem.test.account.fr',
    auth_password: '=End2End!',
    okta_domain: 'https://gem-beta.oktapreview.com',
    okta_issuer_id: 'aus3v6rg3e9zNHMxe0x6',
    okta_client_id: '2-b-intact-client-NTFBHCDNKPAJAKP',
    okta_scopes: [
      'openid',
      'email',
      'profile',
      'api.iam',
      'api.iam.admin.commands',
      'api.iam.apps.commands',
      'api.iam.projects.commands',
    ],
    base_url: 'https://localhost:4201',
    base_api_url: 'https://localhost:44307',
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return plugin(
        on,
        config
      )
    },
    specPattern: 'projects/intact/cypress/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'projects/intact/cypress/support/index.ts',

  },
})
