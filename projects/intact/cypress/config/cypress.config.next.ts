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
    "auth_username": "intact.e2e@gem.test.account.fr",
    "auth_password": "YpIw5#n^0Lq8J2",
    "okta_domain": "https://gem-sandbox.oktapreview.com",
    "okta_issuer_id": "aus54jdrtfL8xzrHj0x7",
    "okta_client_id": "0oa59yi0q03ZlD5i60x7",
    "okta_scopes": [
      "openid",
      "email",
      "profile",
      "api.iam",
      "api.iam.admin.commands",
      "api.iam.apps.commands",
      "api.iam.projects.commands",
      "api.iam.projects.commands",
      "api.iam.kpis"
    ],
    "base_url": "https://iamapi-client-beta-next.ase.ncd.infrasys16.com",
    "base_api_url": "https://iamapi-beta-next.ase.ncd.infrasys16.com"
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
