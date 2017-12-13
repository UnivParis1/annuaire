import Vue from 'vue'

Vue.directive('auto-focus', {
    inserted(el) { 
        el.focus();
    }
});

Vue.component('maybe-router-link', {
    props: ['to'],
    template: `
       <router-link :to="to" v-if="to">
         <slot/>
       </router-link>
       <span v-else>
         <slot/>
       </span>`,
});
