<template>
  <v-container class="page-signin" fluid>
    <template v-if="!needPassword">
      <div class="social-btns">
        <v-btn fab dark large color="blue" :loading="loading.twitter" @click.prevent="onTwitter">
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
      </div>
      <div class="footer">
        <v-btn color="error" @click="onCancel">{{$tt('Cancel')}}</v-btn>
      </div>
    </template>
    <template v-else>
<!--      {{$tt('Hi, {nickname}', { nickname })}}-->
      <div class="password-form">
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
            :loading="loading.submit"
            @click.prevent="onSubmitPassword"
          >{{$tt('Submit')}}</v-btn>
        </v-form>
      </div>
    </template>
  </v-container>
</template>

<script>
  import { mdiTwitter, mdiGoogle, mdiFacebook, mdiTelegram, mdiGithub } from '@mdi/js'

  import { ApiError } from '~/error'
  import { sha256 } from '~/modules/helper'

  export default {
    name: 'signin',
    head () {
      return {
        title: 'Sign In',
      }
    },

    data () {
      return {
        // icons
        mdiTwitter,
        mdiGoogle,
        mdiFacebook,
        mdiTelegram,
        mdiGithub,
        // UI
        loading: {
          twitter: false,
          submit: false,
        },
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
        if (!this.loading.twitter) {
          window.location.href = `${this.backendUrl}/auth/twitter?redirect=${this.currentUrl}`
          this.loading.twitter = true
        }
      },
      onGoogle () {

      },
      onFacebook () {

      },
      onTelegram () {

      },
      onCancel () {
        // Notify window.opener with keypair
        this.$wm.notify({
          method: 'signedIn',
          params: {
            confirm: false,
          }
        })

        // It would be timesaving for debug if you comment the line below
        window.close()
      },
      onConfirm () {
        if (this.$refs.signInForm.validate()) {
          this.needConfirm = false
        }
      },
      onSubmitPassword () {
        if (this.loading.submit) {
          return
        }

        if (this.$refs.signInForm.validate()) {
          this.loading.submit = true

          // WARNING! Modify the following code will break users' keypair !!!
          // Generate keypair from openId and password
          const privateKey = sha256(this.openId + this.password)
          const keypair = this.$ckb.helper.privateKeyToAddress(privateKey, this.$ckb.chainId)

          !process.env.PROD && this.$log.debug('Generate keypair:', keypair)

          // Notify window.opener with keypair
          this.$wm.notify({
            method: 'signedIn',
            params: {
              confirm: true,
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

<style lang="scss">
.page-signin {
  display: flex;
  flex-direction: column;
  height: 100%;

  &>.social-btns {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-grow: 1;
  }

  &>.password-form {
    display: flex;
    align-items: center;
    flex-grow: 1;
  }
}
</style>
