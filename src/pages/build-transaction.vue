<template>
  <v-card class="page-build-transaction" height="100%" width="100%" flat tile>
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
                  <v-list-item-title v-for="address in inputs">{{address}}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-list class="pa-0 mb-4">
              <h4 class="pa-0 grey--text">To</h4>
              <v-list-item class="pa-0">
                <v-list-item-content class="pa-0">
                  <v-list-item-title v-for="address in outputs">{{address}}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-text-field
              :label="$tt('Total Amount')"
              v-model="value"
              suffix="CKB"
              disabled />
            <v-text-field
              :label="$tt('Total Change')"
              v-model="change"
              suffix="CKB"
              disabled />
            <v-text-field
              type="number"
              :label="$tt('Fee Rate')"
              v-model="feeRate"
              min="1"
              max="10"
              suffix="CKB/Byte"
              @blur="onFeeRateChange" />
            <v-text-field
              :label="$tt('Estimated Fee')"
              v-model="fee"
              suffix="CKB"
              disabled
              readonly />

            <v-btn
              class="mt-4"
              color="success"
              @click="onSubmit"
            >{{$tt('Submit')}}</v-btn>
          </v-form>
        </v-card-text>
      </v-tab-item>
      <v-tab-item key="raw">
        <v-card-text>
          <code style="overflow-wrap: anywhere;">{{ txJSON }}</code>
        </v-card-text>
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<script>
  import { mapState } from 'vuex'

  import { CACHE } from '~/constants'
  import { WebAuthError } from '~/error'
  import { uniqAddresses } from '~/modules/helper'

  let tx

  export default {
    name: 'build-transaction',
    async asyncData ({ app, store }) {
      const keypair = store.state.auth.keypair
      if (!keypair) {
        throw WebAuthError.fromCode(100)
      }

      const params = await app.$localForage.getItem(CACHE.page.buildTransaction)

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
        loading: false,
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
      ...mapState('auth', ['keypair']),

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
      async onSubmit () {
        await this.$localForage.removeItem(CACHE.page.buildTransaction)

        this.$wm.emit('transaction-built', {
          rawTx: tx.toJSON(),
        })
      }
    }
  }
</script>

<style lang="scss">
.page-build-transaction {
  .v-list {
    &>.v-list-item {
      min-height: 0;
    }
  }
}
</style>
