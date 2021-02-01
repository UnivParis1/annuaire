import { reactive, computed, watchEffect } from '@vue/composition-api'
import helpers from './helpers'

/**
 * xx@type {<T extends { [key: string]: () => any }>(attr_fns: T) => { [P in keyof T]: { value: ReturnType<T[P]> } } } } */
export const toComputed = (attr_fns) => (
  helpers.map(attr_fns, computed)
)

export function asyncComputed (func) {
  const state = reactive({
    status: "loading",
    val: undefined,
  });

  let lastCalled = null

  watchEffect(() => {
      let me = Symbol('compute');
      lastCalled = me;

      // no more "loading" state after initial computation to workaround https://github.com/vuejs/composition-api/issues/633
      //state.status = "loading"
      //state.val = null;

      func().then(value => {
        if (lastCalled === me) {
          state.status = "success"
          state.val = value;
        }
      }, error => {
        if (lastCalled === me) {
          state.status = "error";
          state.val = error;
        }
      });
  })

  const result = computed(() => state.status === "success" ? state.val : undefined)

  // does not work with https://github.com/vuejs/composition-api
  //Object.defineProperty(result, 'error', {
  //  value: computed(() => state.status === "error" ? state.val : undefined)
  //})
  //Object.defineProperty(result, 'status', {
  //  value: computed(() => state.status)
  //});

  return result;
}

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
