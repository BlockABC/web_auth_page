<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="4">
      Web Auth
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'vuex'
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo,
  },
  computed: {
    ...mapState(['config'])
  },
  async mounted () {
    // const ret = await this.$backend.ABCService.getTokens()
    this.$backend.ping()
  }
}
</script>
