<template>
  <v-container class="page-confirm-singing py-0 fill-height" fluid>
    <v-row>
      <v-col>
        <v-tabs v-model="tab">
          <v-tab key="raw">{{ $tt('RAW') }}</v-tab>
          <v-tab key="unspents">{{ $tt('Unspents') }}</v-tab>
        </v-tabs>
      </v-col>
    </v-row>


    <v-row>
      <v-col>
        <v-tabs-items v-model="tab">
          <v-tab-item key="raw">
            <code>{{ rawTxJSON }}</code>
          </v-tab-item>
          <v-tab-item key="unspents">
            <code>{{ unspentsJSON }}</code>
          </v-tab-item>
        </v-tabs-items>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-btn color="success" @click="onConfirm">{{$tt('Confirm')}}</v-btn>
        <v-btn color="error" @click="onCancel">{{$tt('Cancel')}}</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { CACHE, WM_EVENTS } from '~/constants'
  import { WebAuthError } from '~/error'
  import { configKeys } from '~/store/config'

  export default {
    name: 'confirm-signing',
    middleware: ['auth'],

    data () {
      return {
        // UI
        tab: '',
        // transaction
        unspents: null,
        rawTx: null,
      }
    },
    computed: {
      unspentsJSON () {
        return JSON.stringify(this.unspents, null, '  ')
      },
      rawTxJSON () {
        return JSON.stringify(this.rawTx, null, '  ')
      },
    },
    async asyncData ({ app, store }) {
      const keypair = store.state.auth.keypair
      if (!keypair) {
        throw WebAuthError.fromCode(100)
      }

      const params = await app.$localForage.getItem(CACHE.page.signTransaction)
      await app.$localForage.removeItem(CACHE.page.signTransaction)

      return {
        unspents: params.unspents,
        rawTx: params.rawTransaction,
      }
    },

    created () {
      this.$store.commit(configKeys.setTitle, this.$tt('Sign Transaction'))
    },

    methods: {
      async onConfirm () {
        this.$wm.emit(WM_EVENTS.confirmSigning, { confirm: true })
        this.$router.replace('/')
      },
      async onCancel () {
        this.$wm.emit(WM_EVENTS.confirmSigning, { confirm: false })
        this.$router.replace('/')
      }
    }
  }
</script>

<style lang="scss">
.page-confirm-singing {
  .v-window {
    .v-window-item {
      overflow: hidden;

      &>code {
        overflow-wrap: anywhere;
      }
    }
  }
}
</style>
