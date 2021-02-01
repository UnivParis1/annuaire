export const AutoFocus = {
    inserted(el) {
        el.focus();
    }
};

export const MaybeRouterLink = {
    props: ['to'],
    template: `
       <router-link :to="to" v-if="to">
         <slot/>
       </router-link>
       <span v-else>
         <slot/>
       </span>`,
};
