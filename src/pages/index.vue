<template>
  <v-card class="page-confirm-building" height="100%" width="100%" flat tile>
    <v-toolbar color="primary" dark dense>
      <v-toolbar-title>{{$tt('Web Auth')}}</v-toolbar-title>
    </v-toolbar>

    <v-card-text>
      Welcome to customize your own Web Auth !
    </v-card-text>
  </v-card>
</template>

<script>

export default {
  async mounted () {
    this.$backend.ping()
  }
}
</script>
