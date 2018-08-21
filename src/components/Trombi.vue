<template>
      <maybe-router-link :to="withUser(person)" class="photoGallery">
            <div class="photo">
                <img :title="title"
                    :src="photoURL" class="img-responsive">
            </div>
            <div class="text">
                {{person.supannListeRouge ? "Personne sur liste rouge" : person.displayName}}
            </div>
      </maybe-router-link>
</template>

<script>
import config from '../config';

export default {
  props: ['person'],
  computed: {
    photoURL() { return config.photoURL(this.person) },
    title() {
        const person = this.person;
        if (person.supannListeRouge) return '';

        let lines = [person.displayName];
        lines.push(... (person['supannRoleEntite-all'] || []).map(role => role.role));
        lines.push(... (person.telephoneNumber || []));

        return lines.join("\n");
    },
  },
}
</script>

