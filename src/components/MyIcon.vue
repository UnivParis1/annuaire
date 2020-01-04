<template>
<span class="my-icon" :class="'my-icon-' + name" v-html="icons[name]"></span>
</template>

<script>
import remove from '!raw-loader!@fortawesome/fontawesome-free/svgs/solid/times.svg';

export default {
  props: ['name'],
  computed: {
    icons() {
      return {
        remove,
      }
    },
  }
}
</script>

<style>
.my-icon {
  --my-icon-size: 12px;
  --my-icon-ratio: 1;
}
.my-icon > svg {
  width: calc(var(--my-icon-size) * var(--my-icon-ratio));
  height: var(--my-icon-size);
  display: block;
}

.my-icon-thList {
  --my-icon-ratio: 1.2;
}
.my-icon-user {
  --my-icon-ratio: 1.4;
}
</style>
