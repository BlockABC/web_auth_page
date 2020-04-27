<template>
  <v-card class="page-confirm-building" height="100%" width="100%" flat tile>
    <v-toolbar color="primary" dark dense>
      <v-toolbar-title>{{$tt('Building transaction')}}</v-toolbar-title>
    </v-toolbar>

    <v-tabs v-model="tab">
      <v-tab key="overview">{{ $tt('Overview') }}</v-tab>
      <v-tab key="raw">{{ $tt('RAW') }}</v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item key="overview">
        <v-card-text>
          <v-form ref="signInForm">
            <v-list class="pa-0 mb-4">
              <h4 class="pa-0 grey--text">From</h4>
              <v-list-item class="pa-0">
                <v-list-item-content class="pa-0">
                  <v-list-item-title v-for="address in inputs" :key="address">{{address}}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-list class="pa-0 mb-4">
              <h4 class="pa-0 grey--text">To</h4>
              <v-list-item class="pa-0">
                <v-list-item-content class="pa-0">
                  <v-list-item-title v-for="address in outputs" :key="address">{{address}}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-text-field
              :label="$tt('Total Amount')"
              v-model="value"
              suffix="CKB"
              hide-details
              disabled />
            <v-text-field
              :label="$tt('Total Change')"
              v-model="change"
              suffix="CKB"
              hide-details
              disabled />
            <v-text-field
              type="number"
              :label="$tt('Fee Rate')"
              v-model="feeRate"
              min="1"
              max="10"
              suffix="CKB/Byte"
              hide-details
              @blur="onFeeRateChange" />
            <v-text-field
              :label="$tt('Estimated Fee')"
              v-model="fee"
              suffix="CKB"
              hide-details
              disabled
              readonly />
          </v-form>
        </v-card-text>
      </v-tab-item>
      <v-tab-item key="raw">
        <v-card-text>
          <code>{{ txJSON }}</code>
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
  import { uniqAddresses } from '~/modules/helper'

  let tx

  export default {
    name: 'confirm-building',
    async asyncData ({ app, store }) {
      const keypair = store.state.auth.keypair
      if (!keypair) {
        throw WebAuthError.fromCode(100)
      }

      const params = await app.$localForage.getItem(CACHE.page.buildTransaction)
      await app.$localForage.removeItem(CACHE.page.buildTransaction)

      tx = await app.$ckb.provider.buildAutoFixTransaction({
        froms: [
          { address: keypair.address },
        ],
        tos: params.tos,
        changeAddress: keypair.address,
      })

      const feeRate = 1
      tx.edit({ feeRate })

      return {
        rawTx: tx.toJSON(),
        feeRate,
        inputs: uniqAddresses(tx.inputs),
        outputs: uniqAddresses(tx.outputs),
        value: parseInt(tx.value) / 1e8,
        change: parseInt(tx.change) / 1e8,
        fee: parseInt(tx.fee) / 1e8,
      }
    },
    data () {
      return {
        // UI
        tab: '',
        // transaction
        rawTx: null,
        inputs: [],
        outputs: [],
        value: '',
        change: '',
        feeRate: 0,
        fee: '',
      }
    },
    computed: {
      txJSON () {
        return JSON.stringify(this.rawTx, null, '  ')
      },
    },

    methods: {
      onFeeRateChange () {
        tx.edit({ feeRate: this.feeRate })
        this.inputs = uniqAddresses(tx.inputs)
        this.outputs = uniqAddresses(tx.outputs)
        this.value = parseInt(tx.value) / 1e8
        this.change = parseInt(tx.change) / 1e8
        this.fee = parseInt(tx.fee) / 1e8
      },
      async onConfirm () {
        this.$wm.emit('confirm-building', { confirm: true, signedTransaction: tx.toJSON() })
        this.$router.replace('/')
      },
      async onCancel () {
        this.$wm.emit('confirm-building', { confirm: false, signedTransaction: null })
        this.$router.replace('/')
      }
    }
  }
</script>

<style lang="scss">
.page-confirm-building {
  .v-list {
    &>.v-list-item {
      min-height: 0;
    }
  }

  code {
    overflow-wrap: anywhere;
  }
}
</style>
