<template>
  <div class="loading">
    <v-progress-circular :size="50" color="primary" indeterminate />
    <h4 class="mt-2">{{text}}</h4>
  </div>
</template>

<script>
  import { hasKey } from '~/modules/helper'

  export default {
    name: 'loading',
    data () {
      return {
        textMap: {
          default: this.$tt('Loading ...'),
          signIn: this.$tt('Please allow popup window to continuing sign in ...'),
        }
      }
    },
    computed: {
      text () {
        const subject = this.$route.query.subject
        return subject && hasKey(this.textMap, subject) ? this.textMap[subject] : this.textMap.default
      }
    },
  }
</script>

<style lang="stylus">
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;

  h4 {
    max-width: 60%;
  }
}
</style>
