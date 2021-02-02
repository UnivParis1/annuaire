<template>
<span class="my-icon" :class="'my-icon-' + name" v-html="icons[name]"></span>
</template>

<script>
import remove from '@fortawesome/fontawesome-free/svgs/solid/times.svg?raw';
import search from '@fortawesome/fontawesome-free/svgs/solid/search.svg?raw';
import users from '@fortawesome/fontawesome-free/svgs/solid/user-friends.svg?raw';
import mapMarker from '@fortawesome/fontawesome-free/svgs/solid/map-marker-alt.svg?raw';
import userPlus from '@fortawesome/fontawesome-free/svgs/solid/user-plus.svg?raw';
import thList from '@fortawesome/fontawesome-free/svgs/solid/th-list.svg?raw';

export default {
  props: ['name'],
  computed: {
    icons() {
      return {
        remove, search, users,
        mapMarker, userPlus, thList,
      }
    },
  }
}
</script>

<style>
.my-icon {
  --my-icon-size: 12px;
}
.my-icon > svg {
  width: auto;
  height: var(--my-icon-size);
  display: block;
}
</style>
