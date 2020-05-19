<template>
  <v-container class="page-index fill-height" fluid>
    <v-row v-if="!isSignedIn">
      <v-col class="d-flex flex-column justify-center align-center">
        <h4 class="headline">{{ $tt('Welcome! Please sign in first before we start.') }}</h4>
        <v-btn class="mt-4" depressed color="primary" @click.prevent="onSignIn">{{ $tt('Sign In') }}</v-btn>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col>
        <v-list-item>
          <v-list-item-avatar color="grey" />
          <v-list-item-content>
            <v-list-item-title class="headline">{{ nickname }}</v-list-item-title>
            <v-list-item-subtitle>{{ keypair.address }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import { authKeys } from '~/store/auth'

export default {
  name: 'page-index',

  computed: {
    ...mapState('auth', [
      'keypair',
      'nickname',
      'profile'
    ]),
    ...mapGetters({
      isSignedIn: authKeys.isSignedIn
    })
  },

  methods: {
    onSignIn () {
      this.$wm.request({ method: 'signIn', target: 'self' })
    }
  }
}
</script>
