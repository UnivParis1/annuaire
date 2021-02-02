// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import * as Vue from 'vue'
import VueTranslate from 'vue3-translate-plugin'
import App from './App.vue'
import router from './router'
import Translations from './translations'
import GlobalMixin from './GlobalMixin'
//import 'core-js/modules/es.promise'; // needed by vue-async-computed (why does it not go through babel transform-runtime?)
//import 'core-js/modules/es.array.find';
import './directives';
let app = Vue.createApp({
  template: '<App/>',
  components: { App }
})
//
app.use(VueTranslate)
app.locales(Translations)
app.use(router)
app.mixin(GlobalMixin)

app.mount('#app')
