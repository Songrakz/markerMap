<template>
  <v-app>

    <v-main>
      <leafmap />
    </v-main>
  </v-app>
</template>

<script>
import Leafmap from './components/Leafmap.vue';

export default {
  name: 'App',

  components: {
    Leafmap,
  },

  data: () => ({
    //
  }),
};
</script>
