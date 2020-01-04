<template>
<span class="my-icon" :class="'my-icon-' + name" v-html="icons[name]"></span>
</template>

<script>
import remove from '!raw-loader!@fortawesome/fontawesome-free/svgs/solid/times.svg';
import search from '!raw-loader!@fortawesome/fontawesome-free/svgs/solid/search.svg';
import users from '!raw-loader!@fortawesome/fontawesome-free/svgs/solid/user-friends.svg';
import mapMarker from '!raw-loader!@fortawesome/fontawesome-free/svgs/solid/map-marker-alt.svg';
import fileImport from '!raw-loader!@fortawesome/fontawesome-free/svgs/solid/file-import.svg';
import thList from '!raw-loader!@fortawesome/fontawesome-free/svgs/solid/th-list.svg';

export default {
  props: ['name'],
  computed: {
    icons() {
      return {
        remove, search, users,
        mapMarker, fileImport, thList,
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
