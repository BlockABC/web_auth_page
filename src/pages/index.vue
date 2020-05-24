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
          <v-list-item-content @mouseup="onCopyAddress">
            <v-list-item-title class="headline">{{ nickname }} <v-icon small>{{mdiContentCopy}}</v-icon></v-list-item-title>
            <v-list-item-subtitle ref="address">{{ keypair.address }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-col>
    </v-row>

    <v-snackbar color="success" top v-model="copySucceed">
      {{ $tt('Copy successfully!') }}
      <v-btn text @click="copySucceed = false">{{ $tt('Close') }}</v-btn>
    </v-snackbar>
    <v-snackbar color="error" top v-model="copyFailed">
      {{ $tt('Copy failed, please do it yourself.') }}
      <v-btn text @click="copyFailed = false">{{ $tt('Close') }}</v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
  import { mdiContentCopy } from '@mdi/js'
  import { mapState, mapGetters } from 'vuex'

import { select } from '~/modules/helper'
import { authKeys } from '~/store/auth'

export default {
  name: 'page-index',

  data () {
    return {
      mdiContentCopy,
      copySucceed: false,
      copyFailed: false,
    }
  },
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

  mounted () {
    throw new Error('test error')
  },

  methods: {
    onSignIn () {
      this.$wm.request({ method: 'signIn', target: 'self' })
    },
    onCopyAddress () {
      this.$copyText(this.keypair.address).then(() => {
        this.copySucceed = true
      }, () => {
        this.copyFailed = true
      }).finally(() => {
        select(this.$refs.address)
      })
    },
  }
}
</script>
