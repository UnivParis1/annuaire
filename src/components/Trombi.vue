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
import { MaybeRouterLink, toComputed } from '../directives';

export default {
  props: ['person'],
  components: { MaybeRouterLink },
  setup(props) {
   return toComputed({
    photoURL() { return config.photoURL(props.person) },
    title() {
        const person = props.person;
        if (person.supannListeRouge) return '';

        let lines = [person.displayName];
        lines.push(... (person['supannRoleEntite-all'] || []).map(role => role.role));
        lines.push(... (person.telephoneNumber || []));

        return lines.join("\n");
    },
   })
  }
}
</script>

