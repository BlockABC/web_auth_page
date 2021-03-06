<template>
  <v-container class="page-confirm-building py-0 fill-height" fluid>
    <v-row>
      <v-col>
        <v-tabs v-model="tab">
          <v-tab key="overview">{{ $tt('Overview') }}</v-tab>
          <v-tab key="raw">{{ $tt('RAW') }}</v-tab>
        </v-tabs>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-tabs-items v-model="tab">
          <v-tab-item key="overview">
            <v-form ref="confirmBuildingForm">
              <v-list class="pa-0 mb-4">
                <h4 class="pa-0 grey--text">From</h4>
                <v-list-item class="pa-0">
                  <v-list-item-content class="pa-0">
                    <v-list-item-title v-for="address in inputs" :key="address">{{ address }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>

              <v-list class="pa-0 mb-4">
                <h4 class="pa-0 grey--text">To</h4>
                <v-list-item class="pa-0">
                  <v-list-item-content class="pa-0">
                    <v-list-item-title v-for="address in outputs" :key="address">{{ address }}</v-list-item-title>
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
          </v-tab-item>
          <v-tab-item key="raw">
            <code>{{ txJSON }}</code>
          </v-tab-item>
        </v-tabs-items>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-btn color="success" @click="onConfirm">{{ $tt('Confirm') }}</v-btn>
        <v-btn color="error" @click="onCancel">{{ $tt('Cancel') }}</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { CACHE, WM_EVENTS } from '~/constants'
import { WebAuthError } from '~/error'
import { uniqAddresses } from '~/modules/helper'
import { configKeys } from '~/store/config'

let tx

export default {
  name: 'confirm-building',
  middleware: ['auth'],

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

  created () {
    this.$store.commit(configKeys.setTitle, this.$tt('Build Transaction'))
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
      this.$wm.emit(WM_EVENTS.confirmBuilding, { confirm: true, signedTransaction: tx.toJSON() })
      this.$router.replace('/')
    },
    async onCancel () {
      this.$wm.emit(WM_EVENTS.confirmBuilding, { confirm: false, signedTransaction: null })
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
