<template>
      <router-link :to="withUser(person.mail)" :tag="person.supannListeRouge ? 'span' : 'a'" class="photoGallery">
            <div class="photo">
                <img :title="person.supannListeRouge ? '' : person.displayName"
                    :src="photoURL" class="img-responsive">
            </div>
            <div class="text">
                {{person.supannListeRouge ? "Personne sur liste rouge" : person.displayName}}
            </div>
      </router-link>
</template>

<script>
import config from '../config';

export default {
  props: ['person'],
  computed: {
    photoURL() { return config.photoURL(this.person) },
  },
}
</script>

