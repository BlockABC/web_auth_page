<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="4">

      <v-card v-if="!needPassword" class="elevation-4" :loading="loading">
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>{{$tt('Sign in with')}}</v-toolbar-title>
        </v-toolbar>
        <v-card-text class="d-flex justify-space-between">
          <v-btn fab dark large color="blue" :loading="this.loading" @click.prevent="onTwitter">
            <v-icon>{{mdiTwitter}}</v-icon>
          </v-btn>
          <v-btn fab dark large color="grey lighten-1" @click.prevent="onGoogle">
            <v-icon>{{mdiGoogle}}</v-icon>
          </v-btn>
          <v-btn fab dark large color="grey lighten-1" @click.prevent="onFacebook">
            <v-icon>{{mdiFacebook}}</v-icon>
          </v-btn>
          <v-btn fab dark large color="grey lighten-1" @click.prevent="onTelegram">
            <v-icon>{{mdiTelegram}}</v-icon>
          </v-btn>
        </v-card-text>
      </v-card>

      <v-card v-else class="elevation-4" :loading="loading">
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>{{$tt('Hi, {nickname}', { nickname })}}</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-form ref="signInForm">
            <v-text-field
              class="mt-0 pt-2"
              type="password"
              :label="$tt('Keypair Password')"
              :hint="$tt('This password and your openid will be used to derive the keypair. PLEASE KEEP IT SAFELY!')"
              persistent-hint
              :rules="rules.password"
              v-model="password"
            ></v-text-field>
            <v-btn
              v-if="needConfirm"
              class="mt-4"
              color="error"
              @click.prevent="onConfirm"
            >{{$tt('Confirmed, I will keep it safely.')}}</v-btn>
            <v-btn
              v-else
              class="mt-4"
              color="success"
              @click.prevent="onSubmitPassword"
            >{{$tt('Submit')}}</v-btn>
          </v-form>
        </v-card-text>
      </v-card>

    </v-col>
  </v-row>
</template>

<script>
  import { mdiTwitter, mdiGoogle, mdiFacebook, mdiTelegram, mdiGithub } from '@mdi/js'

  import { ApiError } from '~/error'
  import { sha256 } from '~/modules/helper'

  export default {
    name: 'signin',
    data () {
      return {
        // icons
        mdiTwitter,
        mdiGoogle,
        mdiFacebook,
        mdiTelegram,
        mdiGithub,
        // UI
        loading: false,
        needPassword: false,
        needConfirm: true,
        password: '',
        rules: {
          password: [
            v => {
              if (v && v.length >= 6) {
                return true
              }

              return this.$tt('Password require more than 6 chars at least.')
            }
          ]
        },
        // profile
        nickname: '',
        openId: '',
        profile: null,
        // other
        currentUrl: window.location.href,
        backendUrl: process.env.backendUrl,
      }
    },

    async asyncData (ctx) {
      if (ctx.query && ctx.query.key) {
        let data
        try {
          data = await ctx.app.$backend.oAuthData({ key: ctx.query.key })
        }
        catch (err) {
          ctx.app.$log.error(`${err.name} ${err.code}: ${err.message}`)
          // ignore api error
          if (err instanceof ApiError && err.code === 10001) {
            return
          }

          throw err
        }

        ctx.app.$log.info(`Load user profile from server: ${data.nickname}`)
        if (data) {
          !process.env.PROD && ctx.app.$log.debug('User profile:', data)
          return {
            ...data,
            needPassword: true,
          }
        }
      }
    },

    methods: {
      onTwitter () {
        if (!this.loading) {
          window.location.href = `${this.backendUrl}/auth/twitter?redirect=${this.currentUrl}`
          this.loading = 'warning'
        }
      },
      onGoogle () {

      },
      onFacebook () {

      },
      onTelegram () {

      },
      onConfirm () {
        if (this.$refs.signInForm.validate()) {
          this.needConfirm = false
        }
      },
      onSubmitPassword () {
        if (this.$refs.signInForm.validate()) {
          // WARNING! Modify the following code will break users' keypair !!!
          // Generate keypair from openId and password
          const privateKey = sha256(this.openId + this.password)
          const keypair = this.$ckb.helper.privateKeyToAddress(privateKey, this.$ckb.chainId)

          !process.env.PROD && this.$log.debug('Generate keypair:', keypair)

          // Notify window.opener with keypair
          this.$wm.notify({
            method: 'signedIn',
            params: {
              keypair,
              nickname: this.nickname,
              profile: this.profile,
            }
          })

          // It would be timesaving for debug if you comment the line below
          window.close()
        }
      }
    }
  }
</script>

<style>

</style>
