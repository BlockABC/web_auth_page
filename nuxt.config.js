const colors = require('vuetify/es5/util/colors').default
const PROD = process.env.NODE_ENV === 'production'

module.exports = {
  mode: 'spa',
  srcDir: 'src',
  /*
   * Headers of the page
   */
  head: {
    titleTemplate: '%s - ' + process.env.npm_package_name,
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
   * Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   * Global CSS
   */
  css: [
  ],
  env: {
    baseUrl: process.env.BASE_URL || 'http://127.0.0.1:3000',
    backendUrl: process.env.BACKEND_URL || 'http://127.0.0.1:7000'
  },
  /*
   * Plugins to load before mounting the App
   */
  plugins: [
    '~/plugins/i18n',
    '~/plugins/service'
  ],
  /*
   * Nuxt.js dev-modules
   */
  buildModules: [
    ['@nuxt/typescript-build', {
      typeCheck: false,
    }],
    '@nuxtjs/vuetify',
  ],
  /*
   * Nuxt.js modules
   */
  modules: [
    // If you need ga, turn it on here
    // ['@nuxtjs/google-gtag', {
    //   id: process.env.GA_ID,
    //   debug: isDev,
    // }]
    // If you need sentry, turn it on here
    // [
    //   '@nuxtjs/sentry',
    //   {
    //     dsn: process.env.SENTRY_DSN,
    //     disabled: isDev,
    //     config: {}
    //   }
    // ]
  ],
  /*
   * vuetify module configuration
   * https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },
  /*
   * Build configuration
   */
  build: {
    'html.minify': false,
    babel: {
      presets (ctx) {
        let targets
        if (ctx.isServer) {
          targets = { node: 'current' }
        }
        else {
          targets = PROD ? {
            ie: 10
          } : {
            chrome: 80
          }
        }

        return [
          [ require.resolve('@nuxt/babel-preset-app'), { targets } ]
        ]
      }
    },
    optimization: {
      minimize: PROD
    },
    /*
     * You can extend webpack config here
     */
    extend (config, ctx) {
      // Disable webpack devtool for better typescript debug experience
      config.devtool = false
    }
  }
}
