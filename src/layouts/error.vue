<template>
  <v-container class="page-error" fluid>
    <div class="error-content">
      <v-alert type="error" min-width="100%">
        {{ error.message }}
      </v-alert>
    </div>

    <NuxtLink to="/">
      <v-btn depressed color="primary">{{ $tt('Back to home') }}</v-btn>
    </NuxtLink>
  </v-container>
</template>

<script>
export default {
  layout: 'default',
  head () {
    return {
      title: this.$tt('Error')
    }
  },

  props: {
    error: {
      type: Object,
      default: null
    }
  },
  mounted () {
    console.error('Catched error:', this.error)
  }
}
</script>

<style lang="scss">
.page-error {
  display: flex;
  flex-direction: column;
  height: 100%;

  &>.error-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-grow: 1;
  }
}
</style>
