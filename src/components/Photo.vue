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

<style scoped>
 .imgCircle {
    width: 26px;
    height: 26px;
    margin: -18px 0 0 -23px;
    display: block;
    float: left;
 }
 .imgCircle img {
     margin-top: -4px;
 }

 .vertical .imgCircle {
    margin: -13px 0 0 -13px;
    z-index: 2;
 }

.secondary-bloc .imgCircle {
   margin: 0 2px 0 0;
}

 .thirdPane .imgCircle {
   margin: 0;
   Xmargin: -2px 3px 0 -16px;
 }

 li.nonSelectedElt .imgCircle {
     display: none;
 }

</style>
