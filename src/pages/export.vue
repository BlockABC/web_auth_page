<template>
  <v-container class="page-export fill-height" fluid>
    <v-row v-if="needPassword">
      <v-col>
        <v-form ref="exportForm">
          <v-text-field
            class="mt-0 pt-2"
            type="password"
            :label="$tt('Keypair Password')"
            :hint="$tt('The password you chosed when you signed in.')"
            persistent-hint
            :rules="rules.password"
            :error-messages="passwordError"
            @blur="onClearState"
            v-model="password"
          />
          <v-btn
            v-if="needConfirm"
            class="mt-4"
            color="error"
            @click.prevent="onConfirm"
          >
            {{ $tt('Confirmed, I will never leak it.') }}
          </v-btn>
          <v-btn
            v-else
            class="mt-4"
            color="success"
            @click.prevent="onExport"
          >
            {{ $tt('Export') }}
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col>
        <v-list>
          <v-list-item two-line>
            <v-list-item-content @mouseup="onCopyAddress">
              <v-list-item-title>
                {{ $tt('Address') }} <v-icon small>{{mdiContentCopy}}</v-icon>
              </v-list-item-title>
              <v-list-item-subtitle ref="address">{{ keypair.address }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content @mouseup="onCopyWIF">
              <v-list-item-title>
                {{ $tt('Private Key') }} <v-icon small>{{mdiContentCopy}}</v-icon>
              </v-list-item-title>
              <v-list-item-subtitle ref="privateKey">{{ keypair.privateKey }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
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
import { mapState } from 'vuex'
import { sha256 } from '~/modules/helper'

export default {
  name: 'export',
  middleware: ['auth'],

  data () {
    return {
      mdiContentCopy,
      needPassword: true,
      needConfirm: true,
      password: '',
      rules: {
        password: [
          v => v ? true : this.$tt('Password is required.'),
        ]
      },
      passwordError: [],
      copySucceed: false,
      copyFailed: false,
    }
  },
  computed: {
    ...mapState('auth', [
      'keypair',
      'passwdHash',
    ]),
  },

  methods: {
    onConfirm () {
      if (this.$refs.exportForm.validate()) {
        this.needConfirm = false
      }
    },
    onClearState () {
      this.passwordError = []
    },
    onExport () {
      if (this.$refs.exportForm.validate()) {
        const passwdHash = sha256(this.keypair.privateKey.slice(2) + this.password)
        if (passwdHash !== this.passwdHash) {
          this.passwordError = [this.$tt('Password error.')]
          return
        }

        this.passwordError = []
        this.needPassword = false
      }
    },
    onCopyAddress () {
      this.$copyText(this.keypair.address).then(() => {
        this.copySucceed = true
      }, () => {
        this.copyFailed = true
      }).finally(() => {
        this.select(this.$refs.address)
      })
    },
    onCopyWIF () {
      this.$copyText(this.keypair.privateKey).then(() => {
        this.copySucceed = true
      }, () => {
        this.copyFailed = true
      }).finally(() => {
        this.select(this.$refs.privateKey)
      })
    },
    select (el) {
      const range = document.createRange()
      range.selectNode(el)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)
    }
  }
}
</script>

<style lang="scss">
.page-export {

}
</style>
