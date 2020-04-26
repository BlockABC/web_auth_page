<template>
  <v-card class="page-confirm-singing" height="100%" width="100%" flat tile>
    <v-toolbar color="primary" dark dense>
      <v-toolbar-title>{{$tt('Signing transaction')}}</v-toolbar-title>
    </v-toolbar>

    <v-tabs v-model="tab">
      <v-tab key="raw">{{ $tt('RAW') }}</v-tab>
      <v-tab key="unspents">{{ $tt('Unspents') }}</v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item key="raw">
        <v-card-text>
          <code>{{ rawTxJSON }}</code>
        </v-card-text>
      </v-tab-item>
      <v-tab-item key="unspents">
        <v-card-text>
          <code>{{ unspentsJSON }}</code>
        </v-card-text>
      </v-tab-item>
    </v-tabs-items>

    <v-card-actions class="px-4 pt-0">
      <v-btn color="success" @click="onConfirm">{{$tt('Confirm')}}</v-btn>
      <v-btn color="error" @click="onCancel">{{$tt('Cancel')}}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
  import { CACHE } from '~/constants'
  import { WebAuthError } from '~/error'

  export default {
    name: 'confirm-signing',
    async asyncData ({ app, store }) {
      const keypair = store.state.auth.keypair
      console.log(keypair)
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

    methods: {
      async onConfirm () {
        this.$wm.emit('confirm-signing', true)
      },
      async onCancel () {
        this.$wm.emit('confirm-signing', false)
      }
    }
  }
</script>

<style lang="scss">
.page-confirm-singing {
  code {
    overflow-wrap: anywhere;
  }
}
</style>
