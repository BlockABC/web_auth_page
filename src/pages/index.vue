<template>
  <div>
    index
  </div>
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
