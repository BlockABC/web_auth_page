<template>
  <v-container class="loading fill-height" fluid>
    <v-progress-circular :size="50" color="primary" indeterminate />
    <h4 class="mt-2">{{text}}</h4>
  </v-container>
</template>

<script>
  import { hasKey } from '~/modules/helper'
  import { configKeys } from '~/store/config'

  export default {
    name: 'loading',

    data () {
      return {
        textMap: {
          default: this.$tt('Loading ...'),
          signIn: this.$tt('Please allow popup window to continuing sign in ...'),
          'confirm-building': this.$tt('Loading latest unspents from network ...'),
        }
      }
    },

    created () {
      this.$store.commit(configKeys.setTitle, this.$tt('Loading'))
    },

    mounted () {
      setTimeout(() => {
        const subject = this.$route.query.subject
        switch (subject) {
          case 'confirm-building':
            this.$router.replace('/confirm-building')
            break
          case 'confirm-signing':
            this.$router.replace('/confirm-signing')
            break
        }
      }, 500)
    },
    computed: {
      text () {
        const subject = this.$route.query.subject
        return subject && hasKey(this.textMap, subject) ? this.textMap[subject] : this.textMap.default
      }
    },
  }
</script>

<style lang="scss">
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;

  h4 {
    max-width: 80%;
  }
}
</style>
