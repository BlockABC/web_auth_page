<template>
  <v-app class="layout-default">
    <v-app-bar class="flex-grow-0" color="primary" dark dense>
      <v-toolbar-title class="pointable" @click="onGoHome">
        {{config.title}}
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-menu ref="menu" v-if="isSignedIn" offset-y>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item @click="onExportKeypair">
            <v-list-item-title>{{ $tt('Export Keypair') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="onSignOut">
            <v-list-item-title>{{ $tt('Sign Out') }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-content>
      <nuxt ref="page" />
    </v-content>
  </v-app>
</template>

<script>
  import { mapState, mapGetters, mapActions } from 'vuex'

  import { authKeys } from '~/store/auth'

  export default {
    name: 'layout-default',

    computed: {
      ...mapState(['config']),
      ...mapGetters({
        isSignedIn: authKeys.isSignedIn
      })
    },

    methods: {
      ...mapActions({
        signOut: authKeys.signOut
      }),
      onGoHome () {
        this.$router.push('/')
      },
      onExportKeypair () {
        this.$router.push('/export')
      },
      async onSignOut () {
        await this.signOut()
      }
    }
  }
</script>

<style lang="scss">
  .v-toolbar__title.pointable {
    cursor: pointer;
    user-select: none;
  }
</style>
