<template>
  <div class="imgCircle">
    <img :src="photoURL" v-if="user">
  </div>
</template>

<script>
import config from '../config';

export default {
  props: ['user'],
  computed: {
     photoURL() {
        return this.user && config.photoURL(this.user);
     },
  },
};
</script>
